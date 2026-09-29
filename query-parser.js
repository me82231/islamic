import { normalizeArabic, isArabic } from '../db/arabic-utils.js';

// Common famous hadith transliterations and keywords mapping for instant matching
const FAMOUS_QUERIES = [
  {
    regex: /innama\s*al[- ]?a'?m[aā]lu?\s*bi[n-]?niyy[aā]t|actions\s+are\s+by\s+intentions|intentions/i,
    arabicKeywords: ['انما الاعمال بالنيات', 'لكل امرئ ما نوى', 'فهجرته الى ما هاجر'],
    book: 'bukhari',
    number: 1
  },
  {
    regex: /hadith\s*(of)?\s*gabriel|hadith\s*(of)?\s*jibril|islam\s+iman\s+ihsan/i,
    arabicKeywords: ['جبريل', 'الايمان', 'الاسلام', 'الاحسان', 'الساعة'],
    book: 'muslim',
    number: 8
  },
  {
    regex: /buniya\s*al[- ]?isl[aā]m|five\s+pillars|pillars\s+of\s+islam/i,
    arabicKeywords: ['بني الاسلام على خمس', 'شهادة ان لا اله الا الله', 'اقام الصلاة', 'ايتاء الزكاة'],
    book: 'bukhari',
    number: 8
  },
  {
    regex: /smiling\s+is\s+charity|tabassumuka/i,
    arabicKeywords: ['تبسمك في وجه اخيك صدقة', 'صدقة'],
    book: null,
    number: null
  },
  {
    regex: /speak\s+good\s+or\s+(be|keep|remain)\s+silent|fal[- ]?yaqul\s+khayran/i,
    arabicKeywords: ['من كان يؤمن بالله واليوم الاخر', 'فليقل خيرا او ليصمت', 'يكرم جاره', 'يكرم ضيفه'],
    book: 'bukhari',
    number: 6018
  },
  {
    regex: /strong\s+(man|person)\s+is\s+not\s+(the\s+one\s+who)?\s*wrestles|laisa\s+ash[- ]?shadid/i,
    arabicKeywords: ['ليس الشديد بالصرعة', 'يملك نفسه عند الغضب'],
    book: 'bukhari',
    number: 6114
  },
  {
    regex: /none\s+of\s+you\s+(truly\s+)?believes\s+until\s+he\s+loves\s+for\s+his\s+brother|la\s+yu['a]?minu\s+ahadukum/i,
    arabicKeywords: ['لا يؤمن احدكم حتى يحب لاخيه ما يحب لنفسه'],
    book: 'bukhari',
    number: 13
  },
  {
    regex: /two\s+words\s+(that\s+are\s+)?beloved\s+to\s+the\s+most\s+merciful|kalimatani\s+habibatani/i,
    arabicKeywords: ['كلمتان خفيفتان على اللسان ثقيلتان في الميزان حبيبتان الى الرحمن', 'سبحان الله وبحمده سبحان الله العظيم'],
    book: 'bukhari',
    number: 7563
  }
];

// Narrator English to Arabic lookup
const NARRATOR_MAP = [
  { match: /abu\s+hurairah|abu\s+huraira/i, arabic: 'أبو هريرة' },
  { match: /umar\s+bin\s+al[- ]?khattab|omar|umar/i, arabic: 'عمر بن الخطاب' },
  { match: /aisha|ayesha/i, arabic: 'عائشة' },
  { match: /anas\s+bin\s+malik|anas/i, arabic: 'أنس بن مالك' },
  { match: /ibn\s+umar|abdullah\s+bin\s+umar/i, arabic: 'عبد الله بن عمر' },
  { match: /ibn\s+abbas|abdullah\s+bin\s+abbas/i, arabic: 'عبد الله بن عباس' },
  { match: /jabir\s+bin\s+abdullah|jabir/i, arabic: 'جابر بن عبد الله' },
  { match: /abu\s+sa['i]d\s+al[- ]?khudri/i, arabic: 'أبو سعيد الخدري' },
  { match: /ibn\s+mas['u]ood|abdullah\s+bin\s+mas['u]ud/i, arabic: 'عبد الله بن مسعود' },
  { match: /ali\s+bin\s+abi\s+talib|ali/i, arabic: 'علي بن أبي طالب' },
  { match: /uthman\s+bin\s+affan|uthman/i, arabic: 'عثمان بن عفان' },
  { match: /abu\s+bakr/i, arabic: 'أبو بكر الصديق' }
];

/**
 * Parses user input to identify book + number patterns, famous phrases, or query structure.
 */
export function parseQuery(query) {
  if (!query || typeof query !== 'string') {
    return { type: 'empty', raw: '' };
  }

  const raw = query.trim();
  const normalized = normalizeArabic(raw);
  const arabic = isArabic(raw);

  // 1. Direct Book + Number check (e.g. "Bukhari 1", "صحيح البخاري 1", "Muslim 45")
  const bookNumberRegex = /(?:صحيح\s+)?(البخاري|بخاري|bukhari|مسلم|muslim)\s*[:#\-_,\s]?\s*(\d+)/i;
  const matchBookNum = raw.match(bookNumberRegex);
  if (matchBookNum) {
    const rawBook = matchBookNum[1].toLowerCase();
    const source = (rawBook.includes('bukhari') || rawBook.includes('بخاري')) ? 'bukhari' : 'muslim';
    const number = parseInt(matchBookNum[2], 10);
    return {
      type: 'book_number',
      source,
      number,
      raw
    };
  }

  // 2. Pure number check (e.g. "1")
  if (/^\d+$/.test(raw)) {
    return {
      type: 'pure_number',
      number: parseInt(raw, 10),
      raw
    };
  }

  // 3. Famous query phrase match
  for (const item of FAMOUS_QUERIES) {
    if (item.regex.test(raw)) {
      return {
        type: 'famous_phrase',
        raw,
        arabicKeywords: item.arabicKeywords,
        book: item.book,
        number: item.number,
        isArabic: arabic
      };
    }
  }

  // 4. Narrator query check in English
  if (!arabic) {
    for (const n of NARRATOR_MAP) {
      if (n.match.test(raw)) {
        return {
          type: 'narrator_foreign',
          raw,
          narratorArabic: n.arabic,
          isArabic: false
        };
      }
    }
  }

  return {
    type: arabic ? 'arabic_text' : 'foreign_text',
    raw,
    normalized,
    isArabic: arabic
  };
}
