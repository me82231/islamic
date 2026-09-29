/**
 * DeepL Translation Provider
 * Handles DeepL API integration with free/paid key detection, usage tracking, and language support
 */

import { TranslationProvider } from './base.js';
import { stripTashkeel } from '../../utils/tashkeel.js';
import { applyHonorifics } from '../../utils/honorifics.js';
import dotenv from 'dotenv';

dotenv.config();

const DEEPL_API_KEY = process.env.DEEPL_API_KEY || '';
const DEEPL_ENABLED = process.env.DEEPL_ENABLED === 'true';

// Detect if this is a free API key (ends with :fx)
const isFreeKey = DEEPL_API_KEY.endsWith(':fx');
const DEEPL_API_URL = isFreeKey 
  ? 'https://api-free.deepl.com/v2' 
  : 'https://api.deepl.com/v2';

// Cached supported languages
let cachedLanguages = null;
let lastLanguageFetch = null;
const LANGUAGE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Usage tracking
let usageData = {
  characterCount: 0,
  characterLimit: 0,
  lastFetch: null
};

const USAGE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class DeepLProvider extends TranslationProvider {
  constructor() {
    super();
    this.apiKey = DEEPL_API_KEY;
    this.enabled = DEEPL_ENABLED && Boolean(this.apiKey);
  }

  getProviderName() {
    return 'DeepL';
  }

  isAvailable() {
    return this.enabled;
  }

  /**
   * Fetch supported target languages from DeepL API
   */
  async getSupportedLanguages() {
    // Return cached if still valid
    if (cachedLanguages && lastLanguageFetch && 
        Date.now() - lastLanguageFetch < LANGUAGE_CACHE_TTL) {
      return cachedLanguages;
    }

    try {
      const response = await fetch(`${DEEPL_API_URL}/languages?type=target`, {
        headers: {
          'Authorization': `DeepL-Auth-Key ${this.apiKey}`
        }
      });

      if (!response.ok) {
        console.error('[DeepL] Failed to fetch languages:', response.status);
        return [];
      }

      const data = await response.json();
      cachedLanguages = data.map(lang => lang.language.toUpperCase());
      lastLanguageFetch = Date.now();
      
      console.log(`[DeepL] Fetched ${cachedLanguages.length} supported languages`);
      return cachedLanguages;
    } catch (error) {
      console.error('[DeepL] Error fetching languages:', error.message);
      return [];
    }
  }

  /**
   * Translate text to multiple target languages
   */
  async translate(arabicText, langCodes, context = {}) {
    if (!this.isAvailable()) {
      throw new Error('DeepL provider is not configured or enabled');
    }

    // Strip tashkeel for DeepL (keep original for display)
    const textToTranslate = stripTashkeel(arabicText);
    
    const results = {};
    const errors = {};

    // Filter out Hebrew (hard exclusion)
    const filteredLangCodes = langCodes.filter(code => {
      const upper = code.toUpperCase();
      return upper !== 'HE' && upper !== 'IW';
    });

    // Check quota before translating
    await this.checkUsage();
    if (usageData.characterLimit > 0 && 
        usageData.characterCount >= usageData.characterLimit * 0.9) {
      console.warn('[DeepL] Usage at 90%+, routing to fallback');
      throw new Error('QUOTA_EXCEEDED');
    }

    // Translate each language
    for (const langCode of filteredLangCodes) {
      try {
        // Normalize language code for DeepL
        const normalizedCode = this.normalizeLanguageCode(langCode);
        
        const translation = await this.translateSingle(textToTranslate, normalizedCode);
        
        // Apply honorifics post-processing
        const processedTranslation = applyHonorifics(translation, langCode, context);
        
        results[langCode] = processedTranslation;
      } catch (error) {
        console.error(`[DeepL] Error translating to ${langCode}:`, error.message);
        errors[langCode] = error;
      }
    }

    if (Object.keys(results).length === 0 && Object.keys(errors).length > 0) {
      throw new Error('All translations failed');
    }

    return { results, errors };
  }

  /**
   * Translate to a single language
   */
  async translateSingle(text, targetLang) {
    const response = await fetch(`${DEEPL_API_URL}/translate`, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: [text],
        target_lang: targetLang,
        source_lang: 'AR'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 456) {
        throw new Error('QUOTA_EXCEEDED');
      }
      
      if (response.status === 429) {
        throw new Error('RATE_LIMIT');
      }
      
      throw new Error(`DeepL API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.translations[0].text;
  }

  /**
   * Normalize language code for DeepL
   * Handle variant codes like EN-US, EN-GB, PT-BR, PT-PT, ZH-HANS, ZH-HANT
   */
  normalizeLanguageCode(code) {
    const upper = code.toUpperCase();
    
    // Map common variants to DeepL codes
    const variantMap = {
      'EN': 'EN-US',
      'PT': 'PT-BR',
      'ZH': 'ZH-HANS',
      'FR': 'FR',
      'ES': 'ES',
      'DE': 'DE',
      'IT': 'IT',
      'JA': 'JA',
      'KO': 'KO',
      'RU': 'RU',
      'TR': 'TR',
      'PL': 'PL',
      'NL': 'NL',
      'UK': 'UK',
      'ID': 'ID',
      'VI': 'VI',
      'TH': 'TH',
      'SV': 'SV-SE',
      'BG': 'BG',
      'CS': 'CS',
      'DA': 'DA',
      'EL': 'EL',
      'ET': 'ET',
      'FI': 'FI',
      'HU': 'HU',
      'LT': 'LT',
      'LV': 'LV',
      'RO': 'RO',
      'SK': 'SK',
      'SL': 'SL'
    };

    return variantMap[upper] || upper;
  }

  /**
   * Check DeepL usage and quota
   */
  async checkUsage() {
    // Return cached if still valid
    if (usageData.lastFetch && 
        Date.now() - usageData.lastFetch < USAGE_CACHE_TTL) {
      return usageData;
    }

    try {
      const response = await fetch(`${DEEPL_API_URL}/usage`, {
        headers: {
          'Authorization': `DeepL-Auth-Key ${this.apiKey}`
        }
      });

      if (!response.ok) {
        console.warn('[DeepL] Failed to fetch usage:', response.status);
        return usageData;
      }

      const data = await response.json();
      usageData = {
        characterCount: data.character_count || 0,
        characterLimit: data.character_limit || 0,
        lastFetch: Date.now()
      };

      console.log(`[DeepL] Usage: ${usageData.characterCount}/${usageData.characterLimit} characters`);
      return usageData;
    } catch (error) {
      console.error('[DeepL] Error fetching usage:', error.message);
      return usageData;
    }
  }

  /**
   * Get current usage data
   */
  getUsage() {
    return usageData;
  }

  /**
   * Check if quota is near limit (90%+)
   */
  isQuotaNearLimit() {
    if (usageData.characterLimit === 0) return false;
    return usageData.characterCount >= usageData.characterLimit * 0.9;
  }
}

// Export singleton instance
export const deepLProvider = new DeepLProvider();
