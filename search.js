import express from 'express';
import { searchHadith } from '../search/search-engine.js';
import { matchValueByName, getValuesForHadith } from '../values/values-store.js';

const router = express.Router();

/**
 * GET /api/search?q=...
 * Finds authentic hadiths from Sahih al-Bukhari and Sahih Muslim.
 */
router.get('/', async (req, res) => {
  const query = req.query.q || '';
  const limit = parseInt(req.query.limit || '5', 10);

  if (!query || !query.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Query parameter "q" is required.'
    });
  }

  try {
    const result = await searchHadith(query.trim(), { limit: Math.min(limit, 20) });

    // Strong value-name routing: if the query names a value ("أحاديث الصدق",
    // "hadith about patience"), surface it so the UI can offer the value page.
    const valueMatch = matchValueByName(query);

    // Cross-link tags: attach the values each candidate belongs to.
    if (result && Array.isArray(result.candidates)) {
      result.candidates = result.candidates.map(c => ({
        ...c,
        values: getValuesForHadith(c.id).map(v => ({ id: v.id, nameAr: v.nameAr, nameEn: v.nameEn, accent: v.accent }))
      }));
    }

    return res.json({
      success: true,
      valueMatch,
      ...result
    });
  } catch (err) {
    console.error('[API /api/search] Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while searching hadith.',
      error: err.message
    });
  }
});

export default router;
