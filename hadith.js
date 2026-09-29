import express from 'express';
import { getHadithBySourceAndNumber, getCachedTranslation } from '../db/database.js';
import appConfig from '../../app.config.js';
import { similarityEngine } from '../search/similarity.js';
import { getValuesForHadith, shareValue } from '../values/values-store.js';

const router = express.Router();

/**
 * GET /api/hadith/:source/:number
 * Retrieves the full hadith by source ('bukhari' | 'muslim') and hadith number.
 */
router.get('/:source/:number', (req, res) => {
  const { source, number } = req.params;

  if (!source || !number) {
    return res.status(400).json({
      success: false,
      message: 'Both source and number are required.'
    });
  }

  const normalizedSource = source.toLowerCase().trim();
  if (normalizedSource !== 'bukhari' && normalizedSource !== 'muslim') {
    return res.status(400).json({
      success: false,
      message: 'Invalid source. Supported authentic sources: "bukhari" or "muslim".'
    });
  }

  const num = parseInt(number, 10);
  if (isNaN(num)) {
    return res.status(400).json({
      success: false,
      message: 'Hadith number must be a valid integer.'
    });
  }

  try {
    const hadith = getHadithBySourceAndNumber(normalizedSource, num);
    if (!hadith) {
      return res.status(404).json({
        success: false,
        message: `Hadith #${num} not found in ${appConfig.sources[normalizedSource]?.titleEn || normalizedSource}.`
      });
    }

    // Check if English translation is already cached
    const cachedEn = getCachedTranslation(hadith.id, 'en');

    return res.json({
      success: true,
      hadith: {
        ...hadith,
        sourceMetadata: appConfig.sources[normalizedSource],
        initialTranslations: cachedEn ? { en: cachedEn } : {}
      }
    });
  } catch (err) {
    console.error('[API /api/hadith] Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching hadith.',
      error: err.message
    });
  }
});

/**
 * GET /api/hadith/:source/:number/related
 * Returns semantically related hadiths using TF-IDF similarity
 */
router.get('/:source/:number/related', async (req, res) => {
  const { source, number } = req.params;
  const limit = parseInt(req.query.limit || '5', 10);

  const normalizedSource = source.toLowerCase().trim();
  const num = parseInt(number, 10);

  if (isNaN(num)) {
    return res.status(400).json({
      success: false,
      message: 'Hadith number must be a valid integer.'
    });
  }

  try {
    const hadith = getHadithBySourceAndNumber(normalizedSource, num);
    if (!hadith) {
      return res.status(404).json({
        success: false,
        message: `Hadith #${num} not found.`
      });
    }

    // Ensure similarity engine is initialized
    await similarityEngine.initialize();

    const related = similarityEngine.findSimilar(hadith.id, limit);

    // Prefer hadiths that share the same Islamic value (cross-link boost).
    const ranked = [...related].sort((a, b) => {
      const aVal = shareValue(hadith.id, a.id) ? 1 : 0;
      const bVal = shareValue(hadith.id, b.id) ? 1 : 0;
      if (aVal !== bVal) return bVal - aVal;
      return (b.similarity || 0) - (a.similarity || 0);
    });

    return res.json({
      success: true,
      related: ranked.map(r => ({
        id: r.id,
        source: r.source,
        hadith_number: r.hadith_number,
        book_name: r.book_name,
        narrator: r.narrator,
        text: r.text_full,
        similarity: r.similarity
      }))
    });
  } catch (err) {
    console.error('[API /api/hadith/related] Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while finding related hadiths.',
      error: err.message
    });
  }
});

/**
 * GET /api/hadith/:source/:number/values
 * Value tags for cross-linking a hadith to the Islamic values it belongs to.
 */
router.get('/:source/:number/values', (req, res) => {
  const normalizedSource = String(req.params.source).toLowerCase().trim();
  const num = parseInt(req.params.number, 10);
  if (isNaN(num) || !['bukhari', 'muslim'].includes(normalizedSource)) {
    return res.status(400).json({ success: false, message: 'Invalid source or number.' });
  }
  const values = getValuesForHadith(`${normalizedSource}:${num}`);
  return res.json({ success: true, values });
});

export default router;
