/**
 * Hadith of the Day Endpoint
 * Deterministic selection based on date
 */

import express from 'express';
import { getAllHadithsForIndexing, getHadithById } from '../db/database.js';

const router = express.Router();

/**
 * GET /api/daily
 * Returns a deterministic hadith based on the current date
 */
router.get('/', (req, res) => {
  try {
    const hadiths = getAllHadithsForIndexing();
    
    if (hadiths.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hadiths available'
      });
    }

    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
      hash = hash & hash;
    }
    
    const index = Math.abs(hash) % hadiths.length;
    const selectedHadithRef = hadiths[index];
    
    const selectedHadith = getHadithById(selectedHadithRef.id);
    
    if (!selectedHadith) {
      return res.status(404).json({
        success: false,
        message: 'Daily hadith not found in database'
      });
    }
    
    return res.json({
      success: true,
      date: dateString,
      hadith: {
        id: selectedHadith.id,
        source: selectedHadith.source,
        hadith_number: selectedHadith.hadith_number,
        book_name: selectedHadith.book_name,
        narrator: selectedHadith.narrator,
        text: selectedHadith.text_full
      }
    });
  } catch (err) {
    console.error('[API /api/daily] Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
});

export default router;
