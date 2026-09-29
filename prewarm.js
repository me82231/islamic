/**
 * Islamic Values — Featured Hadith Pre-warm
 * ------------------------------------------------------------------
 * Low-priority background job that pre-translates the FEATURED hadith of
 * each value into the top-12 languages, so the value pages stream instantly.
 *
 * - Never blocks startup (fire-and-forget with a delay).
 * - Runs strictly SEQUENTIALLY with an inter-call delay to respect rate limits.
 * - Skips languages that are already cached.
 * - Only hadith text already in the local SQLite dataset is translated;
 *   no hadith is ever picked or written by the AI.
 */

import { SUPPORTED_LANGUAGES } from '../languages.js';
import { getHadithById, getCachedTranslation, setCachedTranslation } from '../db/database.js';
import { translateWithFallback } from '../ai/router.js';
import { isAiConfigured } from '../ai/gemini.js';
import { listValues, getValueMeta } from './values-store.js';

const TOP_LANG_CODES = SUPPORTED_LANGUAGES
  .filter(l => l.tier === 1 && l.code !== 'ar')
  .slice(0, 12)
  .map(l => l.code);

const STARTUP_DELAY_MS = 12 * 1000;   // let the server settle first
const BETWEEN_HADITH_MS = 4 * 1000;   // pause between featured hadiths
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

let started = false;

export function getPrewarmLanguages() {
  return TOP_LANG_CODES;
}

async function prewarmHadith(hadithId, langs) {
  const hadith = getHadithById(hadithId);
  if (!hadith) return { hadithId, translated: 0, skipped: 0, failed: 0 };

  const uncached = langs.filter(lang => !getCachedTranslation(hadith.id, lang));
  if (uncached.length === 0) return { hadithId, translated: 0, skipped: langs.length, failed: 0 };

  const context = {
    narrator: hadith.narrator,
    bookTitle: hadith.book_name,
    hadithNumber: hadith.hadith_number
  };

  try {
    const { results, errors } = await translateWithFallback(hadith.text_full, uncached, context);
    let n = 0;
    for (const [lang, translation] of Object.entries(results || {})) {
      if (!translation) continue;
      setCachedTranslation(hadith.id, lang, translation, 'cached');
      n++;
    }
    const failed = Object.keys(errors || {}).length;
    return { hadithId, translated: n, skipped: langs.length - uncached.length, failed };
  } catch (err) {
    console.warn(`[ValuesPrewarm] failed for ${hadithId}: ${err.message}`);
    return { hadithId, translated: 0, skipped: 0, failed: uncached.length, error: err.message };
  }
}

// True when a pre-warm failure looks like a quota / rate-limit problem.
function isQuotaSignal(res) {
  const msg = String(res.error || '').toLowerCase();
  return msg.includes('429') || msg.includes('quota') || msg.includes('rate') || msg.includes('resource_exhausted');
}

/**
 * Kick off the pre-warm. Safe to call once at startup; no-op if AI is not
 * configured or if values.json is missing.
 */
export function startValuesPrewarm({ delayMs = STARTUP_DELAY_MS } = {}) {
  if (started) return;
  started = true;

  (async () => {
    try {
      if (!isAiConfigured()) {
        console.log('[ValuesPrewarm] AI not configured — skipping background pre-warm.');
        return;
      }
      const values = listValues();
      if (values.length === 0) {
        console.log('[ValuesPrewarm] no values loaded — skipping.');
        return;
      }

      await sleep(delayMs);
      console.log(`[ValuesPrewarm] warming featured hadiths for ${values.length} values × ${TOP_LANG_CODES.length} languages (low priority)...`);

      let totalTranslated = 0;
      // Hard safety budget: never let a background job consume the whole daily
      // quota. Stop after this many successful hadiths, or on the first
      // quota/rate-limit signal.
      const MAX_HADITHS = parseInt(process.env.VALUES_PREWARM_MAX || '3', 10);
      let processed = 0;
      for (const v of values) {
        if (processed >= MAX_HADITHS) {
          console.log(`[ValuesPrewarm] reached budget of ${MAX_HADITHS} hadiths — stopping to protect the daily quota.`);
          break;
        }
        const meta = getValueMeta(v.id);
        const featuredId = meta && meta.hadithIds && meta.hadithIds[0];
        if (!featuredId) continue;
        const res = await prewarmHadith(featuredId, TOP_LANG_CODES);
        processed++;
        totalTranslated += res.translated || 0;
        if (isQuotaSignal(res)) {
          console.warn('[ValuesPrewarm] quota/rate-limit detected — aborting pre-warm to keep on-demand translation alive.');
          break;
        }
        await sleep(BETWEEN_HADITH_MS);
      }
      console.log(`[ValuesPrewarm] done — ${totalTranslated} new translations cached.`);
    } catch (err) {
      console.warn('[ValuesPrewarm] aborted:', err.message);
    }
  })();
}
