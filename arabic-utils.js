/**
 * Arabic Text Normalization & Linguistic Utilities
 * Tailored for Classical Quranic & Hadith Arabic
 */

// Comprehensive Tashkeel (diacritics) Unicode ranges
const TASHKEEL_REGEX = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;

// Tatweel (Kashida)
const TATWEEL_REGEX = /\u0640/g;

// Common punctuation marks in Arabic and Latin texts
const PUNCTUATION_REGEX = /[،؛؟«»"'\(\)\[\]\{\}\.\:\-\_\,\;\!\?\/\\]/g;

/**
 * Strips all diacritics (harakat / tashkeel) and tatweel.
 */
export function stripTashkeel(text) {
  if (!text) return '';
  return text
    .replace(TASHKEEL_REGEX, '')
    .replace(TATWEEL_REGEX, '');
}

/**
 * Normalizes Arabic text for high-accuracy phonetic and canonical matching:
 * - Strips tashkeel and tatweel
 * - Unifies alef forms: أ, إ, آ, ٱ -> ا
 * - Unifies ta marbuta: ة -> ه
 * - Unifies alef maqsura: ى -> ي
 * - Unifies hamza on carriers: ؤ -> و, ئ -> ي
 * - Removes standalone hamza (ء) for canonical matching
 * - Removes punctuation
 * - Normalizes multiple spaces into a single space
 */
export function normalizeArabic(text) {
  if (!text) return '';
  return stripTashkeel(text)
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ء/g, '')
    .replace(PUNCTUATION_REGEX, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Detects whether a string primarily contains Arabic script.
 */
export function isArabic(text) {
  if (!text) return false;
  // Match any Arabic character block
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  return arabicPattern.test(text);
}

/**
 * Splits normalized Arabic text into indexing tokens.
 */
export function tokenizeArabic(text) {
  const normalized = normalizeArabic(text);
  if (!normalized) return [];
  return normalized
    .split(/\s+/)
    .filter(token => token.length > 1);
}

/**
 * Safely highlights matching keywords in the original full-tashkeel Arabic text
 */
export function highlightArabicText(fullText, query) {
  if (!fullText || !query) return fullText;
  const normalizedQuery = normalizeArabic(query);
  const searchWords = normalizedQuery.split(/\s+/).filter(w => w.length > 1);
  if (searchWords.length === 0) return fullText;

  // We split fullText into words and check if their normalized version matches any search word
  const words = fullText.split(/(\s+|[،؛؟«»"'\(\)\[\]\{\}\.\:\-])/);
  return words.map(part => {
    const normPart = normalizeArabic(part);
    if (!normPart) return part;
    const isMatch = searchWords.some(w => normPart === w || (w.length >= 3 && normPart.includes(w)));
    if (isMatch) {
      return `<mark class="hadith-highlight">${part}</mark>`;
    }
    return part;
  }).join('');
}
