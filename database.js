import path from 'node:path';
import fs from 'node:fs';
import Database from 'better-sqlite3';
import { setupDatabase } from '../../scripts/setup-data.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'hadiths.sqlite');

let dbInstance = null;

export function getDatabase() {
  if (dbInstance) return dbInstance;

  if (!fs.existsSync(DB_PATH)) {
    console.log('[Database] SQLite file not found, running initial dataset setup...');
    setupDatabase(false);
  }

  dbInstance = new Database(DB_PATH, { readonly: false });
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('synchronous = NORMAL');
  dbInstance.pragma('cache_size = -64000'); // 64MB cache

  // Add provider column if it doesn't exist (migration for existing databases)
  try {
    dbInstance.exec(`
      ALTER TABLE translations ADD COLUMN provider TEXT DEFAULT 'cached';
    `);
  } catch (err) {
    // Column already exists, ignore error
  }

  try {
    dbInstance.exec(`
      ALTER TABLE translation_cache ADD COLUMN provider TEXT DEFAULT 'cached';
    `);
  } catch (err) {
    // Column already exists, ignore error
  }

  return dbInstance;
}

/**
 * Returns a specific hadith by source ('bukhari' | 'muslim') and hadith number.
 */
export function getHadithBySourceAndNumber(source, hadithNumber) {
  const db = getDatabase();
  const num = parseInt(hadithNumber, 10);
  const normalizedSource = String(source).toLowerCase().trim();

  const stmt = db.prepare(`
    SELECT id, source, hadith_number, arabic_number, book_number, book_name, narrator, text_full, text_normalized, grade, reference_json
    FROM hadiths
    WHERE source = ? AND (hadith_number = ? OR arabic_number = ?)
    LIMIT 1
  `);

  const row = stmt.get(normalizedSource, num, num);
  if (!row) return null;

  return {
    ...row,
    reference: row.reference_json ? JSON.parse(row.reference_json) : {}
  };
}

/**
 * Returns a specific hadith by full ID (e.g. 'bukhari:1').
 */
export function getHadithById(id) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT id, source, hadith_number, arabic_number, book_number, book_name, narrator, text_full, text_normalized, grade, reference_json
    FROM hadiths
    WHERE id = ?
    LIMIT 1
  `);

  const row = stmt.get(id);
  if (!row) return null;

  return {
    ...row,
    reference: row.reference_json ? JSON.parse(row.reference_json) : {}
  };
}

/**
 * Loads all hadith records for building the in-memory search index.
 */
export function getAllHadithsForIndexing() {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT id, source, hadith_number, arabic_number, book_number, book_name, narrator, text_normalized
    FROM hadiths
  `);
  return stmt.all();
}

/**
 * Retrieves cached search query results if available and within TTL.
 */
export function getCachedSearch(queryHash) {
  try {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT results_json, created_at FROM search_cache WHERE query_hash = ?
    `);
    const row = stmt.get(queryHash);
    if (!row) return null;

    // Cache valid for 7 days
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - row.created_at > maxAgeMs) {
      return null;
    }
    return JSON.parse(row.results_json);
  } catch (err) {
    console.error('[Cache] Error reading search cache:', err.message);
    return null;
  }
}

/**
 * Stores search query results in SQLite cache.
 */
export function setCachedSearch(queryHash, queryText, results) {
  try {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO search_cache (query_hash, query_text, results_json, created_at)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(queryHash, queryText, JSON.stringify(results), Date.now());
  } catch (err) {
    console.error('[Cache] Error writing search cache:', err.message);
  }
}

/**
 * Retrieves cached translation for a hadith in a specific language.
 */
export function getCachedTranslation(hadithId, lang) {
  try {
    const db = getDatabase();
    const cacheKey = `${hadithId}:${lang.toLowerCase()}`;
    const stmt = db.prepare(`
      SELECT translation FROM translation_cache WHERE cache_key = ?
    `);
    const row = stmt.get(cacheKey);
    return row ? row.translation : null;
  } catch (err) {
    console.error('[Cache] Error reading translation cache:', err.message);
    return null;
  }
}

/**
 * Stores translation in SQLite cache and translations table.
 */
export function setCachedTranslation(hadithId, lang, translation, provider = 'cached') {
  try {
    const db = getDatabase();
    const cleanLang = lang.toLowerCase();
    const cacheKey = `${hadithId}:${cleanLang}`;

    const insertCache = db.prepare(`
      INSERT OR REPLACE INTO translation_cache (cache_key, hadith_id, lang, translation, provider, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertCache.run(cacheKey, hadithId, cleanLang, translation, provider, Date.now());

    const insertTrans = db.prepare(`
      INSERT OR REPLACE INTO translations (hadith_id, lang, translation, source, provider)
      VALUES (?, ?, ?, 'official', ?)
    `);
    insertTrans.run(hadithId, cleanLang, translation, provider);
  } catch (err) {
    console.error('[Cache] Error writing translation cache:', err.message);
  }
}
