/**
 * Gemini Translation Provider
 * Wraps existing Gemini translation functionality in the TranslationProvider interface
 */

import { TranslationProvider } from './base.js';
import { translateHadithText as geminiTranslate, translateHadithTextMulti as geminiTranslateMulti, isAiConfigured } from '../gemini.js';
import { isLanguageAllowed, getLanguage } from '../../languages.js';

function isQuotaError(err) {
  const msg = String((err && (err.message || err)) || '').toLowerCase();
  return msg.includes('429') || msg.includes('quota') || msg.includes('resource_exhausted') || msg.includes('rate');
}

export class GeminiProvider extends TranslationProvider {
  constructor() {
    super();
  }

  getProviderName() {
    return 'Gemini';
  }

  isAvailable() {
    return isAiConfigured();
  }

  /**
   * Gemini supports all languages in our list (except Hebrew which is filtered before routing)
   */
  async getSupportedLanguages() {
    // Return all supported languages from languages.js
    const { SUPPORTED_LANGUAGES } = await import('../../languages.js');
    return SUPPORTED_LANGUAGES.map(lang => lang.code);
  }

  /**
   * Translate text to multiple target languages using Gemini
   */
  async translate(arabicText, langCodes, context = {}) {
    if (!this.isAvailable()) {
      throw new Error('Gemini provider is not configured');
    }

    const { narrator, bookTitle, hadithNumber } = context;
    const results = {};
    const errors = {};

    // Filter out Hebrew (hard exclusion)
    const filteredLangCodes = langCodes.filter(code => {
      return isLanguageAllowed(code);
    });

    // Preferred path: ONE batched API call for ALL languages. This conserves the
    // free-tier daily request quota (which the old per-language loop drained N×
    // faster and left translation appearing "dead" after a few hadiths).
    if (filteredLangCodes.length > 1) {
      try {
        const multi = await geminiTranslateMulti(
          arabicText,
          narrator || 'Unknown',
          bookTitle || 'Unknown',
          hadithNumber || 0,
          filteredLangCodes
        );
        for (const [code, translation] of Object.entries(multi)) {
          results[code] = translation;
        }
        // Any requested language not returned fell through; mark them as errors.
        for (const code of filteredLangCodes) {
          if (!(code in results)) {
            errors[code] = new Error('Missing from batched result');
          }
        }
        if (Object.keys(results).length > 0) {
          return { results, errors };
        }
      } catch (error) {
        // Quota / rate limits must NOT be retried per-language (would 429 again
        // and waste time). Surface them so the route reports "try again later".
        if (isQuotaError(error)) {
          for (const code of filteredLangCodes) {
            errors[code] = error;
          }
          throw new Error('QUOTA_EXCEEDED');
        }
        // Otherwise fall through to the robust per-language loop below.
        console.warn('[Gemini] Batched translation failed, falling back to per-language:', error.message);
      }
    }

    // Fallback path: translate each language individually (single-language
    // requests, or after a non-quota batch failure).
    for (const langCode of filteredLangCodes) {
      try {
        const translation = await geminiTranslate(
          arabicText,
          narrator || 'Unknown',
          bookTitle || 'Unknown',
          hadithNumber || 0,
          langCode
        );
        
        results[langCode] = translation;
      } catch (error) {
        console.error(`[Gemini] Error translating to ${langCode}:`, error.message);
        errors[langCode] = error;
      }
    }

    if (Object.keys(results).length === 0 && Object.keys(errors).length > 0) {
      throw new Error('All translations failed');
    }

    return { results, errors };
  }
}

// Export singleton instance
export const geminiProvider = new GeminiProvider();
