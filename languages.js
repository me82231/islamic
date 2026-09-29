import express from 'express';
import { SUPPORTED_LANGUAGES, EXCLUDED_LANGUAGE_CODES } from '../languages.js';

const router = express.Router();

/**
 * GET /api/languages
 * Returns list of supported world languages.
 * Hebrew is strictly and unconditionally excluded.
 */
router.get('/', (req, res) => {
  // Defensive verification: ensure no excluded code slipped through
  const safeLanguages = SUPPORTED_LANGUAGES.filter(
    lang => !EXCLUDED_LANGUAGE_CODES.includes(lang.code.toLowerCase())
  );

  res.json({
    success: true,
    total: safeLanguages.length,
    languages: safeLanguages
  });
});

export default router;
