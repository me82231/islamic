/**
 * Islamic Values — Build & Validation Core
 * ------------------------------------------------------------------
 * Pure logic that maps each value to authentic hadith IDs using ONLY the
 * local Sahih al-Bukhari / Sahih Muslim dataset. No AI, no external text.
 *
 * Matching signals (weights):
 *   - phrase hit   : strong multi-word expression present  -> +6 each
 *   - keyword hit  : Arabic root/term present              -> +2 each
 *   - chapter hit  : dataset book/chapter title matches     -> +3
 *
 * Curated IDs are always kept (and placed first) but MUST be relevant:
 * they have to contain at least one keyword/phrase or belong to a matching
 * chapter, and MUST exist in the dataset. Otherwise validation fails.
 */

import { normalizeArabic } from '../db/arabic-utils.js';

export const WEIGHTS = { phrase: 6, keyword: 2, chapter: 3 };
export const GENERATED_CAP = 40;

/**
 * Loads the minimal hadith columns needed for matching into memory once.
 */
export function loadMatchableHadiths(db) {
  const rows = db.prepare(`
    SELECT id, source, hadith_number, book_name, narrator,
           length(text_full) AS len, text_normalized
    FROM hadiths
  `).all();
  return rows;
}

/**
 * Computes, for a single value definition, the ranked list of matching
 * hadith IDs plus a reason map used for validation.
 *
 * @returns {{ ranked: Array<{id:string,score:number,reasons:string[]}>,
 *            reasonById: Map<string,string[]>,
 *            curatedErrors: string[] }}
 */
export function resolveValueHadiths(valueDef, matchable, { cap = GENERATED_CAP } = {}) {
  const keywords = (valueDef.keywords || []).map(k => normalizeArabic(k)).filter(k => k && k.length >= 2);
  const phrases = (valueDef.phrases || []).map(p => normalizeArabic(p)).filter(p => p && p.length >= 3);
  const chapters = (valueDef.chapters || []).map(c => String(c).toLowerCase().trim()).filter(Boolean);

  const scores = new Map();   // id -> score
  const reasons = new Map();  // id -> string[]
  const metaById = new Map(matchable.map(h => [h.id, h]));

  const bump = (id, weight, reason) => {
    scores.set(id, (scores.get(id) || 0) + weight);
    if (!reasons.has(id)) reasons.set(id, []);
    if (!reasons.get(id).includes(reason)) reasons.get(id).push(reason);
  };

  for (const h of matchable) {
    const text = h.text_normalized;
    for (const p of phrases) {
      if (text.includes(p)) bump(h.id, WEIGHTS.phrase, `phrase:${p}`);
    }
    for (const k of keywords) {
      if (text.includes(k)) bump(h.id, WEIGHTS.keyword, `keyword:${k}`);
    }
    if (h.book_name) {
      const bn = String(h.book_name).toLowerCase();
      for (const c of chapters) {
        if (bn.includes(c)) bump(h.id, WEIGHTS.chapter, `chapter:${c}`);
      }
    }
  }

  // Rank: score desc, then shorter text (more likely the core hadith), then id.
  const ranked = [...scores.entries()]
    .map(([id, score]) => ({ id, score, reasons: reasons.get(id) || [] }))
    .filter(r => metaById.has(r.id))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const la = metaById.get(a.id).len ?? 0;
      const lb = metaById.get(b.id).len ?? 0;
      if (la !== lb) return la - lb;
      return a.id < b.id ? -1 : 1;
    });

  // Curated validation.
  const curatedErrors = [];
  const curatedIds = Array.isArray(valueDef.curatedIds) ? valueDef.curatedIds : [];
  for (const cid of curatedIds) {
    if (!metaById.has(cid)) {
      curatedErrors.push(`curated id "${cid}" does not exist in the dataset`);
      continue;
    }
    if (!reasons.has(cid) || reasons.get(cid).length === 0) {
      curatedErrors.push(`curated id "${cid}" is unrelated to value "${valueDef.id}" (no keyword/phrase/chapter match)`);
    }
  }

  // Assemble final list: curated first (validated, in given order), then generated.
  const curatedValid = curatedIds.filter(cid => metaById.has(cid) && reasons.has(cid) && reasons.get(cid).length > 0);
  const generated = ranked.map(r => r.id).filter(id => !curatedValid.includes(id)).slice(0, cap);
  const hadithIds = [...curatedValid, ...generated];

  return { ranked, reasonById: reasons, curatedErrors, hadithIds };
}

/**
 * Validates an entire values document against the dataset.
 * Returns { ok, errors: string[] }.
 */
export function validateValuesDoc(valuesDoc, matchable) {
  const errors = [];
  const metaById = new Map(matchable.map(h => [h.id, h]));

  if (!valuesDoc || !Array.isArray(valuesDoc.values)) {
    return { ok: false, errors: ['values.json must contain a "values" array'] };
  }

  const seenIds = new Set();
  for (const v of valuesDoc.values) {
    for (const field of ['id', 'nameAr', 'nameEn', 'descAr', 'iconKey', 'accent', 'keywords']) {
      if (v[field] === undefined || v[field] === null || v[field] === '') {
        errors.push(`value "${v.id || '?'}" is missing required field "${field}"`);
      }
    }
    if (seenIds.has(v.id)) errors.push(`duplicate value id "${v.id}"`);
    seenIds.add(v.id);

    if (!Array.isArray(v.hadithIds) || v.hadithIds.length === 0) {
      errors.push(`value "${v.id}" has no mapped hadiths`);
    }
    if (!Array.isArray(v.curatedIds)) {
      errors.push(`value "${v.id}" missing curatedIds array`);
    }

    // Every mapped hadith id must exist.
    for (const id of (v.hadithIds || [])) {
      if (!metaById.has(id)) errors.push(`value "${v.id}" maps to missing hadith "${id}"`);
    }

    // Curated relevance re-check.
    const { curatedErrors } = resolveValueHadiths(v, matchable);
    for (const e of curatedErrors) errors.push(`value "${v.id}": ${e}`);
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Builds the full values document from a list of value definitions.
 * Pure function (no DB writes) so it can be reused by tests.
 */
export function buildValuesDoc(defs, matchable, { cap = GENERATED_CAP, note, version } = {}) {
  const values = [];
  const allErrors = [];
  for (const def of defs) {
    const { hadithIds, curatedErrors } = resolveValueHadiths(def, matchable, { cap });
    allErrors.push(...curatedErrors.map(e => `value "${def.id}": ${e}`));
    values.push({
      id: def.id,
      nameAr: def.nameAr,
      nameEn: def.nameEn,
      descAr: def.descAr,
      iconKey: def.iconKey,
      accent: def.accent,
      keywords: def.keywords || [],
      phrases: def.phrases || [],
      chapters: def.chapters || [],
      curatedIds: def.curatedIds || [],
      hadithIds,
      count: hadithIds.length
    });
  }
  return {
    doc: {
      schemaVersion: version ?? 1,
      note: note ?? '',
      generatedAt: new Date().toISOString(),
      values
    },
    errors: allErrors
  };
}
