/**
 * Translation Router
 * Routes translation requests to appropriate provider (DeepL or Gemini)
 * Handles fallback logic and provider selection
 */

import { deepLProvider } from './providers/deepl.js';
import { geminiProvider } from './providers/gemini.js';
import { isLanguageAllowed } from '../languages.js';

// Cache for DeepL supported languages
let deepLSupportedLanguages = null;
let deepLLanguagesCacheTime = null;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Initialize the router by fetching DeepL supported languages
 */
export async function initializeRouter() {
  if (deepLProvider.isAvailable()) {
    try {
      console.log('[Router] Initializing DeepL language cache...');
      deepLSupportedLanguages = await deepLProvider.getSupportedLanguages();
      deepLLanguagesCacheTime = Date.now();
      console.log(`[Router] DeepL supports ${deepLSupportedLanguages.length} languages`);
    } catch (error) {
      console.error('[Router] Failed to initialize DeepL cache:', error.message);
      deepLSupportedLanguages = [];
    }
  } else {
    console.log('[Router] DeepL not available, all translations will use Gemini');
    deepLSupportedLanguages = [];
  }
}

/**
 * Refresh DeepL language cache if expired
 */
async function refreshDeepLCacheIfNeeded() {
  if (!deepLProvider.isAvailable()) {
    deepLSupportedLanguages = [];
    return;
  }

  if (!deepLLanguagesCacheTime || Date.now() - deepLLanguagesCacheTime > CACHE_TTL) {
    console.log('[Router] Refreshing DeepL language cache...');
    deepLSupportedLanguages = await deepLProvider.getSupportedLanguages();
    deepLLanguagesCacheTime = Date.now();
  }
}

/**
 * Route languages to appropriate providers
 * @param {string[]} langCodes - Array of requested language codes
 * @returns {Object} - Object with deepl: [] and gemini: [] arrays
 */
export async function routeLanguages(langCodes) {
  await refreshDeepLCacheIfNeeded();

  const routing = {
    deepl: [],
    gemini: []
  };

  // Check if DeepL quota is near limit
  const quotaNearLimit = deepLProvider.isQuotaNearLimit();
  if (quotaNearLimit) {
    console.warn('[Router] DeepL quota near limit, routing all to Gemini');
    routing.gemini = [...langCodes];
    return routing;
  }

  // Route each language
  for (const langCode of langCodes) {
    // Hard exclusion: Hebrew
    if (!isLanguageAllowed(langCode)) {
      console.warn(`[Router] Excluding forbidden language: ${langCode}`);
      continue;
    }

    const upperCode = langCode.toUpperCase();

    // Check if DeepL supports this language
    if (deepLSupportedLanguages && deepLSupportedLanguages.includes(upperCode)) {
      routing.deepl.push(langCode);
    } else {
      routing.gemini.push(langCode);
    }
  }

  console.log(`[Router] Routed ${routing.deepl.length} to DeepL, ${routing.gemini.length} to Gemini`);
  return routing;
}

/**
 * Translate with automatic fallback
 * @param {string} arabicText - Arabic text to translate
 * @param {string[]} langCodes - Target language codes
 * @param {object} context - Translation context
 * @returns {Promise<Object>} - Results with provider info
 */
export async function translateWithFallback(arabicText, langCodes, context = {}) {
  const results = {};
  const errors = {};
  const providerInfo = {};

  // Route languages
  const routing = await routeLanguages(langCodes);

  // Translate with DeepL
  if (routing.deepl.length > 0 && deepLProvider.isAvailable()) {
    try {
      const deeplResult = await deepLProvider.translate(arabicText, routing.deepl, context);
      
      // Store results and provider info
      Object.entries(deeplResult.results || {}).forEach(([lang, translation]) => {
        results[lang] = translation;
        providerInfo[lang] = 'DeepL';
      });
      
      // Store errors for fallback
      Object.entries(deeplResult.errors || {}).forEach(([lang, error]) => {
        errors[lang] = { provider: 'DeepL', error };
      });
    } catch (error) {
      console.error('[Router] DeepL translation failed:', error.message);
      
      // If DeepL fails completely, route all to Gemini
      if (error.message === 'QUOTA_EXCEEDED' || error.message === 'RATE_LIMIT') {
        console.log('[Router] DeepL unavailable, routing all to Gemini');
        routing.gemini.push(...routing.deepl);
        routing.deepl = [];
      }
    }
  }

  // Fallback: Translate failed DeepL languages with Gemini
  const fallbackLanguages = [
    ...routing.gemini,
    ...Object.keys(errors)
  ];

  if (fallbackLanguages.length > 0 && geminiProvider.isAvailable()) {
    try {
      const geminiResult = await geminiProvider.translate(arabicText, fallbackLanguages, context);
      
      Object.entries(geminiResult.results || {}).forEach(([lang, translation]) => {
        results[lang] = translation;
        providerInfo[lang] = 'Gemini';
      });
      
      Object.entries(geminiResult.errors || {}).forEach(([lang, error]) => {
        errors[lang] = { provider: 'Gemini', error };
      });
    } catch (error) {
      console.error('[Router] Gemini translation failed:', error.message);
    }
  }

  return {
    results,
    errors,
    providerInfo
  };
}

/**
 * Get current DeepL usage statistics
 */
export function getDeepLUsage() {
  return deepLProvider.getUsage();
}

/**
 * Get router status for diagnostics
 */
export async function getRouterStatus() {
  await refreshDeepLCacheIfNeeded();
  
  return {
    deepL: {
      available: deepLProvider.isAvailable(),
      supportedLanguages: deepLSupportedLanguages?.length || 0,
      usage: deepLProvider.getUsage(),
      quotaNearLimit: deepLProvider.isQuotaNearLimit()
    },
    gemini: {
      available: geminiProvider.isAvailable()
    }
  };
}
