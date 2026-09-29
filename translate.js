import express from 'express';
import { getHadithBySourceAndNumber, getCachedTranslation, setCachedTranslation } from '../db/database.js';
import { sanitizeLanguageList, getLanguage, isLanguageAllowed } from '../languages.js';
import { translateWithFallback, getRouterStatus } from '../ai/router.js';
import appConfig from '../../app.config.js';

const router = express.Router();

/**
 * GET /api/translate/stream?source=bukhari&number=1&langs=en,fr,es,tr,ur,id,ru,de
 * Server-Sent Events (SSE) streaming endpoint.
 * Translates authentic hadith into requested languages, streaming results as they are ready.
 * 
 * STRICT CONSTRAINT:
 * Hard-exclude Hebrew ("he" / "iw") unconditionally.
 */
router.get('/stream', async (req, res) => {
  const { source, number, langs } = req.query;

  if (!source || !number) {
    return res.status(400).json({
      success: false,
      message: 'Query parameters "source" and "number" are required.'
    });
  }

  const normalizedSource = String(source).toLowerCase().trim();
  if (normalizedSource !== 'bukhari' && normalizedSource !== 'muslim') {
    return res.status(400).json({
      success: false,
      message: 'Invalid source. Supported authentic sources: "bukhari" or "muslim".'
    });
  }

  const num = parseInt(number, 10);
  if (isNaN(num)) {
    return res.status(400).json({
      success: false,
      message: 'Hadith number must be a valid integer.'
    });
  }

  // Retrieve authentic hadith from local database
  const hadith = getHadithBySourceAndNumber(normalizedSource, num);
  if (!hadith) {
    return res.status(404).json({
      success: false,
      message: `Hadith #${num} not found in ${normalizedSource}.`
    });
  }

  // Sanitize requested languages list (strictly excludes Hebrew!)
  const requestedLangs = sanitizeLanguageList(langs);

  // Set SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });
  res.flushHeaders?.();

  let clientConnected = true;
  req.on('close', () => {
    clientConnected = false;
  });

  const sendEvent = (data) => {
    if (clientConnected) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  };

  const bookTitle = appConfig.sources[normalizedSource]?.titleEn || normalizedSource;

  // Send an initial handshake event
  sendEvent({
    type: 'init',
    hadithId: hadith.id,
    totalLanguages: requestedLangs.length,
    languages: requestedLangs
  });

  // Separate cached and uncached languages
  const uncachedLangs = [];
  
  for (const langCode of requestedLangs) {
    if (!clientConnected) break;

    // Double check language safety
    if (!isLanguageAllowed(langCode)) {
      continue;
    }

    const langMeta = getLanguage(langCode);
    const langName = langMeta ? langMeta.name : langCode;
    const nativeName = langMeta ? langMeta.nativeName : langName;
    const direction = langMeta ? langMeta.direction : 'ltr';
    const flag = langMeta ? langMeta.flag : '🌐';

    // 1. Check local SQLite cache first
    const cachedTranslation = getCachedTranslation(hadith.id, langCode);
    if (cachedTranslation) {
      sendEvent({
        type: 'translation',
        lang: langCode,
        name: langName,
        nativeName,
        direction,
        flag,
        translation: cachedTranslation,
        cached: true,
        provider: 'cached'
      });
    } else {
      uncachedLangs.push(langCode);
    }
  }

  // 2. Translate uncached languages using hybrid router
  if (uncachedLangs.length > 0) {
    try {
      const context = {
        narrator: hadith.narrator,
        bookTitle: bookTitle,
        hadithNumber: hadith.hadith_number
      };

      const { results, errors, providerInfo } = await translateWithFallback(
        hadith.text_full,
        uncachedLangs,
        context
      );

      // Stream successful translations
      for (const [langCode, translation] of Object.entries(results)) {
        if (!clientConnected) break;

        const langMeta = getLanguage(langCode);
        const langName = langMeta ? langMeta.name : langCode;
        const nativeName = langMeta ? langMeta.nativeName : langName;
        const direction = langMeta ? langMeta.direction : 'ltr';
        const flag = langMeta ? langMeta.flag : '🌐';
        const provider = providerInfo[langCode] || 'unknown';

        // Cache in SQLite with provider info
        setCachedTranslation(hadith.id, langCode, translation, provider);

        sendEvent({
          type: 'translation',
          lang: langCode,
          name: langName,
          nativeName,
          direction,
          flag,
          translation,
          cached: false,
          provider
        });
      }

      // Stream errors
      for (const [langCode, errorInfo] of Object.entries(errors)) {
        if (!clientConnected) break;

        const langMeta = getLanguage(langCode);
        const langName = langMeta ? langMeta.name : langCode;

        let userMessage = 'Translation service currently unavailable.';
        if (errorInfo.error.message === 'MISSING_API_KEY') {
          userMessage = 'Please configure GEMINI_API_KEY in .env to enable on-demand translations.';
        } else if (errorInfo.error.message === 'QUOTA_EXCEEDED') {
          userMessage = 'Translation quota exceeded. Please try again later.';
        } else if (errorInfo.error.message === 'RATE_LIMIT') {
          userMessage = 'Rate limit exceeded. Please wait a moment.';
        }

        sendEvent({
          type: 'error',
          lang: langCode,
          name: langName,
          error: userMessage
        });
      }
    } catch (err) {
      console.error('[Translate Stream] Hybrid translation failed:', err.message);
      
      // If hybrid system fails entirely, send error for all uncached languages
      for (const langCode of uncachedLangs) {
        if (!clientConnected) break;

        const langMeta = getLanguage(langCode);
        const langName = langMeta ? langMeta.name : langCode;

        sendEvent({
          type: 'error',
          lang: langCode,
          name: langName,
          error: 'Translation service unavailable. Please configure API keys.'
        });
      }
    }
  }

  // Final completion event
  sendEvent({
    type: 'done',
    done: true
  });

  res.end();
});

export default router;
