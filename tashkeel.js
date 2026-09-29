/**
 * Tashkeel (Arabic Diacritics) Stripping Utility
 * Removes Arabic vowel marks while preserving consonants for translation
 */

/**
 * Strip tashkeel (diacritics) from Arabic text
 * Removes harakat (fatha, kasra, damma), tanwin, shadda, sukun, etc.
 * Preserves letters, hamzas, and alif variants
 * 
 * @param {string} text - Arabic text with diacritics
 * @returns {string} - Arabic text without diacritics
 */
export function stripTashkeel(text) {
  if (!text || typeof text !== 'string') return text;

  // Arabic diacritics range (064B-065F in Unicode)
  // Also includes some other diacritical marks
  const tashkeelPattern = /[\u064B-\u065F\u0670\u06D6-\u06ED\u08D3-\u08FF]/g;
  
  return text.replace(tashkeelPattern, '');
}

/**
 * Check if text contains tashkeel
 * @param {string} text - Arabic text to check
 * @returns {boolean}
 */
export function hasTashkeel(text) {
  if (!text || typeof text !== 'string') return false;
  const tashkeelPattern = /[\u064B-\u065F\u0670\u06D6-\u06ED\u08D3-\u08FF]/;
  return tashkeelPattern.test(text);
}

/**
 * Get count of tashkeel characters in text
 * @param {string} text - Arabic text
 * @returns {number}
 */
export function countTashkeel(text) {
  if (!text || typeof text !== 'string') return 0;
  const tashkeelPattern = /[\u064B-\u065F\u0670\u06D6-\u06ED\u08D3-\u08FF]/g;
  const matches = text.match(tashkeelPattern);
  return matches ? matches.length : 0;
}
