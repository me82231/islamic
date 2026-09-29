/**
 * Supported Languages Definition for Hadith Lens
 *
 * STRICT CONSTRAINT:
 * Translations into ALL major world languages EXCEPT Hebrew.
 * Hard-exclude "he" and "iw" everywhere (code, dropdowns, lists, prompts, sanitization).
 */

export const EXCLUDED_LANGUAGE_CODES = Object.freeze([
  'he', 'iw', 'heb', 'hebrew', 'ivrit', 'עברית'
]);

export const SUPPORTED_LANGUAGES = Object.freeze([
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', region: 'Global', tier: 1 },
  { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr', region: 'Europe/Africa', tier: 1 },
  { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr', region: 'Europe/Americas', tier: 1 },
  { code: 'de', name: 'German', nativeName: 'Deutsch', direction: 'ltr', region: 'Europe', tier: 1 },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', direction: 'ltr', region: 'Turkey/Central Asia', tier: 1 },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', direction: 'rtl', region: 'South Asia', tier: 1 },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', direction: 'ltr', region: 'Southeast Asia', tier: 1 },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', direction: 'ltr', region: 'Southeast Asia', tier: 1 },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', direction: 'rtl', region: 'Iran/Central Asia', tier: 1 },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', direction: 'ltr', region: 'Russia/CIS', tier: 1 },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '中文 (简体)', direction: 'ltr', region: 'East Asia', tier: 1 },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr', region: 'South Asia', tier: 1 },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', direction: 'ltr', region: 'South Asia', tier: 1 },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', direction: 'ltr', region: 'Europe/Americas', tier: 1 },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', direction: 'ltr', region: 'Europe', tier: 1 },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', region: 'MENA', tier: 1 },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', direction: 'ltr', region: 'East Asia', tier: 2 },
  { code: 'ko', name: 'Korean', nativeName: '한국어', direction: 'ltr', region: 'East Asia', tier: 2 },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', direction: 'ltr', region: 'East Africa', tier: 2 },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa', direction: 'ltr', region: 'West Africa', tier: 2 },
  { code: 'bs', name: 'Bosnian', nativeName: 'Bosanski', direction: 'ltr', region: 'Balkans', tier: 2 },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip', direction: 'ltr', region: 'Balkans', tier: 2 },
  { code: 'uz', name: 'Uzbek', nativeName: "O'zbek", direction: 'ltr', region: 'Central Asia', tier: 2 },
  { code: 'ps', name: 'Pashto', nativeName: 'پښتو', direction: 'rtl', region: 'Afghanistan', tier: 2 },
  { code: 'ku', name: 'Kurdish (Sorani)', nativeName: 'کوردی', direction: 'rtl', region: 'Kurdistan', tier: 2 },
  { code: 'so', name: 'Somali', nativeName: 'Soomaali', direction: 'ltr', region: 'Horn of Africa', tier: 2 },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', direction: 'ltr', region: 'Europe', tier: 2 },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', direction: 'ltr', region: 'Europe', tier: 2 },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', direction: 'ltr', region: 'Europe', tier: 2 },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', direction: 'ltr', region: 'Europe', tier: 2 },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', direction: 'ltr', region: 'Europe', tier: 2 },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', direction: 'ltr', region: 'Europe', tier: 2 },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', direction: 'ltr', region: 'Europe', tier: 2 },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', direction: 'ltr', region: 'Europe', tier: 2 },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', direction: 'ltr', region: 'Europe', tier: 2 },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', direction: 'ltr', region: 'Europe', tier: 2 },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', direction: 'ltr', region: 'Europe', tier: 2 },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', direction: 'ltr', region: 'Europe', tier: 2 },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', direction: 'ltr', region: 'Balkans', tier: 2 },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски', direction: 'ltr', region: 'Balkans', tier: 2 },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', direction: 'ltr', region: 'Balkans', tier: 2 },
  { code: 'mk', name: 'Macedonian', nativeName: 'Македонски', direction: 'ltr', region: 'Balkans', tier: 2 },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', direction: 'ltr', region: 'Europe', tier: 2 },
  { code: 'be', name: 'Belarusian', nativeName: 'Беларуская', direction: 'ltr', region: 'Europe', tier: 3 },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', direction: 'ltr', region: 'Europe', tier: 3 },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', direction: 'ltr', region: 'Europe', tier: 3 },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti', direction: 'ltr', region: 'Europe', tier: 3 },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska', direction: 'ltr', region: 'Europe', tier: 3 },
  { code: 'ga', name: 'Irish', nativeName: 'Gaeilge', direction: 'ltr', region: 'Europe', tier: 3 },
  { code: 'mt', name: 'Maltese', nativeName: 'Malti', direction: 'ltr', region: 'Europe', tier: 3 },
  { code: 'cy', name: 'Welsh', nativeName: 'Cymraeg', direction: 'ltr', region: 'Europe', tier: 3 },
  { code: 'eu', name: 'Basque', nativeName: 'Euskara', direction: 'ltr', region: 'Europe', tier: 3 },
  { code: 'ca', name: 'Catalan', nativeName: 'Català', direction: 'ltr', region: 'Europe', tier: 3 },
  { code: 'gl', name: 'Galician', nativeName: 'Galego', direction: 'ltr', region: 'Europe', tier: 3 },
  { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն', direction: 'ltr', region: 'Caucasus', tier: 3 },
  { code: 'ka', name: 'Georgian', nativeName: 'ქართული', direction: 'ltr', region: 'Caucasus', tier: 3 },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan', direction: 'ltr', region: 'Caucasus', tier: 3 },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақша', direction: 'ltr', region: 'Central Asia', tier: 3 },
  { code: 'ky', name: 'Kyrgyz', nativeName: 'Кыргызча', direction: 'ltr', region: 'Central Asia', tier: 3 },
  { code: 'tg', name: 'Tajik', nativeName: 'Тоҷикӣ', direction: 'ltr', region: 'Central Asia', tier: 3 },
  { code: 'tk', name: 'Turkmen', nativeName: 'Türkmen', direction: 'ltr', region: 'Central Asia', tier: 3 },
  { code: 'mn', name: 'Mongolian', nativeName: 'Монгол', direction: 'ltr', region: 'East Asia', tier: 3 },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', direction: 'ltr', region: 'Southeast Asia', tier: 2 },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', direction: 'ltr', region: 'Southeast Asia', tier: 2 },
  { code: 'my', name: 'Burmese', nativeName: 'မြန်မာ', direction: 'ltr', region: 'Southeast Asia', tier: 3 },
  { code: 'km', name: 'Khmer', nativeName: 'ខ្មែរ', direction: 'ltr', region: 'Southeast Asia', tier: 3 },
  { code: 'lo', name: 'Lao', nativeName: 'ລາວ', direction: 'ltr', region: 'Southeast Asia', tier: 3 },
  { code: 'tl', name: 'Tagalog (Filipino)', nativeName: 'Tagalog', direction: 'ltr', region: 'Southeast Asia', tier: 2 },
  { code: 'jv', name: 'Javanese', nativeName: 'Basa Jawa', direction: 'ltr', region: 'Southeast Asia', tier: 3 },
  { code: 'su', name: 'Sundanese', nativeName: 'Basa Sunda', direction: 'ltr', region: 'Southeast Asia', tier: 3 },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', direction: 'ltr', region: 'South Asia', tier: 2 },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', direction: 'ltr', region: 'South Asia', tier: 3 },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', direction: 'ltr', region: 'South Asia', tier: 3 },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', direction: 'ltr', region: 'South Asia', tier: 3 },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', direction: 'ltr', region: 'South Asia', tier: 3 },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', direction: 'ltr', region: 'South Asia', tier: 3 },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', direction: 'ltr', region: 'South Asia', tier: 3 },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', direction: 'rtl', region: 'South Asia', tier: 2 },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', direction: 'ltr', region: 'South Asia', tier: 3 },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', direction: 'ltr', region: 'South Asia', tier: 3 },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', direction: 'ltr', region: 'East Africa', tier: 3 },
  { code: 'ti', name: 'Tigrinya', nativeName: 'ትግርኛ', direction: 'ltr', region: 'East Africa', tier: 3 },
  { code: 'orm', name: 'Oromo', nativeName: 'Afaan Oromoo', direction: 'ltr', region: 'East Africa', tier: 3 },
  { code: 'rw', name: 'Kinyarwanda', nativeName: 'Kinyarwanda', direction: 'ltr', region: 'East Africa', tier: 3 },
  { code: 'rn', name: 'Kirundi', nativeName: 'Kirundi', direction: 'ltr', region: 'East Africa', tier: 3 },
  { code: 'lg', name: 'Luganda', nativeName: 'Luganda', direction: 'ltr', region: 'East Africa', tier: 3 },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', direction: 'ltr', region: 'West Africa', tier: 3 },
  { code: 'ig', name: 'Igbo', nativeName: 'Igbo', direction: 'ltr', region: 'West Africa', tier: 3 },
  { code: 'ff', name: 'Fulfulde', nativeName: 'Fulfulde', direction: 'ltr', region: 'West Africa', tier: 3 },
  { code: 'wo', name: 'Wolof', nativeName: 'Wolof', direction: 'ltr', region: 'West Africa', tier: 3 },
  { code: 'st', name: 'Sesotho', nativeName: 'Sesotho', direction: 'ltr', region: 'Southern Africa', tier: 3 },
  { code: 'tn', name: 'Setswana', nativeName: 'Setswana', direction: 'ltr', region: 'Southern Africa', tier: 3 },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', direction: 'ltr', region: 'Southern Africa', tier: 3 },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', direction: 'ltr', region: 'Southern Africa', tier: 3 },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', direction: 'ltr', region: 'Southern Africa', tier: 3 },
  { code: 'mg', name: 'Malagasy', nativeName: 'Malagasy', direction: 'ltr', region: 'Madagascar', tier: 3 },
  { code: 'dv', name: 'Dhivehi', nativeName: 'ދިވެހި', direction: 'rtl', region: 'Maldives', tier: 2 },
  { code: 'ug', name: 'Uyghur', nativeName: 'ئۇيغۇرچە', direction: 'rtl', region: 'Central Asia', tier: 2 },
  { code: 'ckb', name: 'Sorani Kurdish', nativeName: 'کوردیی ناوەندی', direction: 'rtl', region: 'Kurdistan', tier: 2 },
  { code: 'zh-hant', name: 'Chinese (Traditional)', nativeName: '中文 (繁體)', direction: 'ltr', region: 'East Asia', tier: 2 },
  { code: 'pt-br', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', direction: 'ltr', region: 'South America', tier: 1 },
  { code: 'en-us', name: 'English (US)', nativeName: 'English (US)', direction: 'ltr', region: 'North America', tier: 1 },
  { code: 'en-gb', name: 'English (UK)', nativeName: 'English (UK)', direction: 'ltr', region: 'Europe', tier: 1 },
  { code: 'nl-be', name: 'Dutch (Belgium)', nativeName: 'Nederlands (België)', direction: 'ltr', region: 'Europe', tier: 3 },
  { code: 'fr-ca', name: 'French (Canada)', nativeName: 'Français (Canada)', direction: 'ltr', region: 'North America', tier: 3 },
  { code: 'es-mx', name: 'Spanish (Mexico)', nativeName: 'Español (México)', direction: 'ltr', region: 'North America', tier: 2 },
  { code: 'es-ar', name: 'Spanish (Argentina)', nativeName: 'Español (Argentina)', direction: 'ltr', region: 'South America', tier: 3 },
  { code: 'de-at', name: 'German (Austria)', nativeName: 'Deutsch (Österreich)', direction: 'ltr', region: 'Europe', tier: 3 },
  { code: 'de-ch', name: 'German (Switzerland)', nativeName: 'Deutsch (Schweiz)', direction: 'ltr', region: 'Europe', tier: 3 },
  { code: 'fr-ch', name: 'French (Switzerland)', nativeName: 'Français (Suisse)', direction: 'ltr', region: 'Europe', tier: 3 },
  { code: 'it-ch', name: 'Italian (Switzerland)', nativeName: 'Italiano (Svizzera)', direction: 'ltr', region: 'Europe', tier: 3 },
  { code: 'zh-hans', name: 'Chinese (Simplified)', nativeName: '中文 (简体)', direction: 'ltr', region: 'East Asia', tier: 1 },
  { code: 'pt-pt', name: 'Portuguese (Portugal)', nativeName: 'Português (Portugal)', direction: 'ltr', region: 'Europe', tier: 2 },
  { code: 'sr-latn', name: 'Serbian (Latin)', nativeName: 'Srpski (Latinica)', direction: 'ltr', region: 'Balkans', tier: 3 },
  { code: 'no-nb', name: 'Norwegian Bokmål', nativeName: 'Norsk Bokmål', direction: 'ltr', region: 'Europe', tier: 3 },
  { code: 'no-nn', name: 'Norwegian Nynorsk', nativeName: 'Norsk Nynorsk', direction: 'ltr', region: 'Europe', tier: 3 },
  { code: 'smn', name: 'Inari Sami', nativeName: 'Anarâškielâ', direction: 'ltr', region: 'Europe', tier: 3 },
  { code: 'sma', name: 'Southern Sami', nativeName: 'Åarjelsaemien', direction: 'ltr', region: 'Europe', tier: 3 }
]);

const LANGUAGE_MAP = new Map(SUPPORTED_LANGUAGES.map(l => [l.code, l]));

/**
 * Checks whether a language code is strictly allowed.
 * Returns false if it is in the exclusion list or not supported.
 */
export function isLanguageAllowed(code) {
  if (!code || typeof code !== 'string') return false;
  const clean = code.trim().toLowerCase();
  if (EXCLUDED_LANGUAGE_CODES.includes(clean)) {
    return false;
  }
  return LANGUAGE_MAP.has(clean);
}

/**
 * Retrieves language metadata by code. Returns null if not permitted.
 */
export function getLanguage(code) {
  if (!isLanguageAllowed(code)) return null;
  return LANGUAGE_MAP.get(code.trim().toLowerCase()) || null;
}

/**
 * Filters and sanitizes a list of requested language codes.
 * Ensures any excluded code (he/iw) is stripped out completely.
 */
export function sanitizeLanguageList(codes) {
  if (!Array.isArray(codes)) {
    if (typeof codes === 'string') {
      codes = codes.split(',').map(s => s.trim());
    } else {
      const defaultLangs = SUPPORTED_LANGUAGES
        .filter(l => l.tier <= 2)
        .map(l => l.code);
      return defaultLangs;
    }
  }

  const result = [];
  for (const raw of codes) {
    const clean = String(raw).trim().toLowerCase();
    if (isLanguageAllowed(clean) && !result.includes(clean)) {
      result.push(clean);
    }
  }

  return result.length > 0 ? result : ['en'];
}
