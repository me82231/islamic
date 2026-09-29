import MiniSearch from 'minisearch';
import crypto from 'node:crypto';
import { 
  getDatabase, 
  getAllHadithsForIndexing, 
  getHadithById, 
  getHadithBySourceAndNumber,
  getCachedSearch,
  setCachedSearch
} from '../db/database.js';
import { normalizeArabic, isArabic } from '../db/arabic-utils.js';
import { parseQuery } from './query-parser.js';
import { convertQueryToArabicKeywords, isAiConfigured } from '../ai/gemini.js';
import appConfig from '../../app.config.js';

let miniSearchInstance = null;
let isIndexing = false;

/**
 * Initializes the in-memory MiniSearch index across all 14,900+ hadiths.
 */
export function initSearchIndex() {
  if (miniSearchInstance) return miniSearchInstance;
  if (isIndexing) return null;

  isIndexing = true;
  console.log('[Search Engine] Building in-memory index over Arabic hadiths...');
  const start = performance.now();

  const rows = getAllHadithsForIndexing();

  const ms = new MiniSearch({
    fields: ['text_normalized', 'narrator', 'book_name'],
    storeFields: ['id', 'source', 'hadith_number', 'arabic_number', 'book_number', 'book_name', 'narrator'],
    searchOptions: {
      prefix: true,
      fuzzy: (term) => (term.length > 3 ? 0.2 : false),
      boost: { text_normalized: 3, narrator: 1.5, book_name: 1 }
    }
  });

  ms.addAll(rows);
  const elapsed = (performance.now() - start).toFixed(1);
  console.log(`[Search Engine] Indexed ${rows.length} authentic hadiths in ${elapsed}ms.`);

  miniSearchInstance = ms;
  isIndexing = false;
  return miniSearchInstance;
}

function getIndex() {
  if (!miniSearchInstance) {
    return initSearchIndex();
  }
  return miniSearchInstance;
}

function hashQuery(query) {
  return crypto.createHash('sha256').update(String(query).trim().toLowerCase()).digest('hex');
}

/**
 * Main Hadith Search Pipeline:
 * 1. Checks Book + Number direct lookup (e.g. Bukhari 1).
 * 2. Checks Disk Query Cache (SQLite).
 * 3. Fast Path: In-memory MiniSearch on normalized Arabic.
 * 4. Smart Path: If score is weak or query is non-Arabic, consults Gemini for keywords.
 * 5. Returns top candidates, verified against the authentic dataset.
 */
export async function searchHadith(queryText, options = {}) {
  const startTime = performance.now();
  const limit = options.limit || appConfig.search.topCandidatesCount || 5;

  if (!queryText || !queryText.trim()) {
    return {
      query: '',
      count: 0,
      candidates: [],
      pathUsed: 'none',
      timeMs: 0
    };
  }

  const queryHash = hashQuery(queryText);

  // Check Cache
  const cached = getCachedSearch(queryHash);
  if (cached) {
    return {
      ...cached,
      cached: true,
      timeMs: (performance.now() - startTime).toFixed(1)
    };
  }

  const parsed = parseQuery(queryText);
  const index = getIndex();

  // Case 1: Direct Book + Number match (e.g. "Bukhari 1" or "مسلم 5")
  if (parsed.type === 'book_number') {
    const hadith = getHadithBySourceAndNumber(parsed.source, parsed.number);
    if (hadith) {
      const result = {
        query: queryText,
        count: 1,
        candidates: [{ ...hadith, score: 100, matchReason: 'رقم الحديث المباشر' }],
        pathUsed: 'direct_number',
        timeMs: (performance.now() - startTime).toFixed(1)
      };
      setCachedSearch(queryHash, queryText, result);
      return result;
    }
  }

  // Case 2: Pure number (e.g. "1") -> return Bukhari and Muslim #1
  if (parsed.type === 'pure_number') {
    const b = getHadithBySourceAndNumber('bukhari', parsed.number);
    const m = getHadithBySourceAndNumber('muslim', parsed.number);
    const candidates = [];
    if (b) candidates.push({ ...b, score: 99, matchReason: 'صحيح البخاري' });
    if (m) candidates.push({ ...m, score: 98, matchReason: 'صحيح مسلم' });
    if (candidates.length > 0) {
      const result = {
        query: queryText,
        count: candidates.length,
        candidates,
        pathUsed: 'direct_number',
        timeMs: (performance.now() - startTime).toFixed(1)
      };
      setCachedSearch(queryHash, queryText, result);
      return result;
    }
  }

  // Case 3: Famous predefined phrase (e.g. "innama al-a'malu bin-niyyat")
  if (parsed.type === 'famous_phrase') {
    if (parsed.book && parsed.number) {
      const direct = getHadithBySourceAndNumber(parsed.book, parsed.number);
      if (direct) {
        const result = {
          query: queryText,
          count: 1,
          candidates: [{ ...direct, score: 95, matchReason: 'عبارة مشهورة' }],
          pathUsed: 'famous_phrase',
          timeMs: (performance.now() - startTime).toFixed(1)
        };
        setCachedSearch(queryHash, queryText, result);
        return result;
      }
    }
  }

  // Case 4: Fast Path (Local MiniSearch)
  let rawHits = [];
  const normalizedQuery = normalizeArabic(queryText);

  if (normalizedQuery.length > 1) {
    try {
      // First try AND combination for precision
      rawHits = index.search(normalizedQuery, { combineWith: 'AND' });
      // If low hits, try OR combination
      if (rawHits.length < 2) {
        const orHits = index.search(normalizedQuery, { combineWith: 'OR' });
        const existingIds = new Set(rawHits.map(h => h.id));
        for (const h of orHits) {
          if (!existingIds.has(h.id)) {
            rawHits.push(h);
          }
        }
      }
    } catch (e) {
      console.warn('[Search Engine] MiniSearch error:', e.message);
    }
  }

  const topLocalHit = rawHits[0];
  const localScoreIsStrong = topLocalHit && topLocalHit.score >= 12;

  // If local search is strong and query is Arabic or matched, return fast path
  if (localScoreIsStrong && isArabic(queryText)) {
    const candidates = rawHits.slice(0, limit).map(hit => {
      const full = getHadithById(hit.id);
      return {
        ...full,
        score: Math.min(100, Math.round(hit.score * 2)),
        matchReason: 'تطابق نصي مباشر'
      };
    });

    const result = {
      query: queryText,
      count: candidates.length,
      candidates,
      pathUsed: 'fast_path_local',
      timeMs: (performance.now() - startTime).toFixed(1)
    };
    setCachedSearch(queryHash, queryText, result);
    return result;
  }

  // Case 5: Smart Path (Gemini Query Understanding)
  // Invoked when query is non-Arabic, or local score is weak
  let smartPathUsed = false;
  let aiKeywords = [];

  if (isAiConfigured()) {
    try {
      console.log(`[Search Engine] Invoking Gemini Smart Path for query: "${queryText}"`);
      const aiInterpretation = await convertQueryToArabicKeywords(queryText);

      if (aiInterpretation) {
        // If Gemini identified a specific book and number, verify and check
        if (aiInterpretation.book && aiInterpretation.hadithNumber) {
          const matched = getHadithBySourceAndNumber(aiInterpretation.book, aiInterpretation.hadithNumber);
          if (matched) {
            const result = {
              query: queryText,
              count: 1,
              candidates: [{ ...matched, score: 96, matchReason: 'التحليل الذكي للحديث' }],
              pathUsed: 'smart_path_ai',
              aiKeywords: aiInterpretation.keywords,
              timeMs: (performance.now() - startTime).toFixed(1)
            };
            setCachedSearch(queryHash, queryText, result);
            return result;
          }
        }

        // Re-search using the extracted Arabic keywords
        aiKeywords = aiInterpretation.keywords || [];
        const combinedAiHits = new Map();

        for (const kw of aiKeywords) {
          const normKw = normalizeArabic(kw);
          if (!normKw || normKw.length < 2) continue;
          const hits = index.search(normKw, { combineWith: 'OR' });
          for (const h of hits) {
            const currentScore = combinedAiHits.get(h.id) || 0;
            combinedAiHits.set(h.id, currentScore + h.score);
          }
        }

        if (combinedAiHits.size > 0) {
          const sortedHits = Array.from(combinedAiHits.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit);

          const candidates = sortedHits.map(([id, score]) => {
            const full = getHadithById(id);
            return {
              ...full,
              score: Math.min(95, Math.round(score * 1.5)),
              matchReason: 'مطابقة الموضوع والكلمات الدلالية'
            };
          });

          const result = {
            query: queryText,
            count: candidates.length,
            candidates,
            pathUsed: 'smart_path_ai',
            aiKeywords,
            timeMs: (performance.now() - startTime).toFixed(1)
          };
          setCachedSearch(queryHash, queryText, result);
          return result;
        }
      }
    } catch (err) {
      console.error('[Search Engine] Smart path error:', err.message);
    }
  }

  // Fallback 1: English offline search in translations table if query is English
  if (!isArabic(queryText)) {
    try {
      const db = getDatabase();
      const engTokens = queryText.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t.length > 2);
      if (engTokens.length > 0) {
        const sqlLike = engTokens.map(() => 'translation LIKE ?').join(' AND ');
        const params = engTokens.map(t => `%${t}%`);
        const stmt = db.prepare(`
          SELECT hadith_id FROM translations 
          WHERE lang = 'en' AND ${sqlLike}
          LIMIT ?
        `);
        const matchingRows = stmt.all(...params, limit);

        if (matchingRows.length > 0) {
          const candidates = matchingRows.map(r => {
            const full = getHadithById(r.hadith_id);
            return {
              ...full,
              score: 85,
              matchReason: 'تطابق مع الترجمة الإنجليزية المعتمدة'
            };
          });

          const result = {
            query: queryText,
            count: candidates.length,
            candidates,
            pathUsed: 'english_dataset_fallback',
            timeMs: (performance.now() - startTime).toFixed(1)
          };
          setCachedSearch(queryHash, queryText, result);
          return result;
        }
      }
    } catch (err) {
      console.error('[Search Engine] English fallback error:', err.message);
    }
  }

  // Fallback 2: Best available local hits if any exist
  if (rawHits.length > 0) {
    const candidates = rawHits.slice(0, limit).map(hit => {
      const full = getHadithById(hit.id);
      return {
        ...full,
        score: Math.min(80, Math.round(hit.score * 1.5)),
        matchReason: 'أقرب تطابق تقريبي'
      };
    });

    const result = {
      query: queryText,
      count: candidates.length,
      candidates,
      pathUsed: 'fuzzy_local_fallback',
      timeMs: (performance.now() - startTime).toFixed(1)
    };
    setCachedSearch(queryHash, queryText, result);
    return result;
  }

  // No confident match: Say so honestly instead of inventing anything!
  const noMatchResult = {
    query: queryText,
    count: 0,
    candidates: [],
    pathUsed: 'none',
    message: 'لم يتم العثور على حديث مطابق بدقة في صحيحي البخاري ومسلم. يرجى تجربة كلمات بحث أخرى أو رقم الحديث.',
    timeMs: (performance.now() - startTime).toFixed(1)
  };
  return noMatchResult;
}
