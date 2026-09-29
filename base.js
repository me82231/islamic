/**
 * Translation Provider Interface
 * Abstract base class for translation providers (DeepL, Gemini, etc.)
 */

export class TranslationProvider {
  /**
   * Translate text to one or more target languages
   * @param {string} arabicText - The Arabic text to translate
   * @param {string[]} langCodes - Array of target language codes
   * @param {object} context - Additional context (narrator, book, hadithNumber)
   * @returns {Promise<Object>} - Object mapping lang codes to translations
   */
  async translate(arabicText, langCodes, context = {}) {
    throw new Error('translate() must be implemented by subclass');
  }

  /**
   * Get the provider name for logging/display
   * @returns {string}
   */
  getProviderName() {
    throw new Error('getProviderName() must be implemented by subclass');
  }

  /**
   * Check if the provider is configured and available
   * @returns {boolean}
   */
  isAvailable() {
    throw new Error('isAvailable() must be implemented by subclass');
  }

  /**
   * Get supported target language codes
   * @returns {Promise<string[]>}
   */
  async getSupportedLanguages() {
    throw new Error('getSupportedLanguages() must be implemented by subclass');
  }

  /**
   * Check if a specific language code is supported
   * @param {string} langCode
   * @returns {Promise<boolean>}
   */
  async supportsLanguage(langCode) {
    const supported = await this.getSupportedLanguages();
    return supported.includes(langCode);
  }
}
