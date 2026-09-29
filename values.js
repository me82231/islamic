/**
 * Islamic Values API Routes
 * ------------------------------------------------------------------
 * GET  /api/values                 -> gallery list + counts + value of the day
 * GET  /api/values/:id             -> value metadata
 * GET  /api/values/:id/hadiths     -> paginated + filtered hadiths (local dataset only)
 *
 * Every hadith returned is read directly from the local SQLite dataset.
 * No AI is ever used to pick, recall or write hadith text.
 */

import express from 'express';
import {
  listValues,
  getValueMeta,
  getValueHadiths,
  getValueOfDay,
  getReferenceNote,
  isValuesAvailable
} from '../values/values-store.js';

const router = express.Router();

router.get('/', (req, res) => {
  if (!isValuesAvailable()) {
    return res.status(503).json({
      success: false,
      message: 'القيم غير متوفرة — شغّل npm run build:values أولاً'
    });
  }
  const values = listValues();
  return res.json({
    success: true,
    count: values.length,
    note: getReferenceNote(),
    valueOfDay: getValueOfDay(),
    values
  });
});

router.get('/:id', (req, res) => {
  const value = getValueMeta(req.params.id);
  if (!value) {
    return res.status(404).json({ success: false, message: 'هذه القيمة غير موجودة' });
  }
  // Contract: GET /api/values/:id?page=&limit= -> paginated hadiths + metadata.
  const pageData = getValueHadiths(req.params.id, {
    page: req.query.page,
    limit: req.query.limit,
    book: req.query.book,
    narrator: req.query.narrator,
    text: req.query.text
  });
  return res.json({ success: true, ...pageData });
});

router.get('/:id/hadiths', (req, res) => {
  const result = getValueHadiths(req.params.id, {
    page: req.query.page,
    limit: req.query.limit,
    book: req.query.book,
    narrator: req.query.narrator,
    text: req.query.text
  });
  if (!result) {
    return res.status(404).json({ success: false, message: 'هذه القيمة غير موجودة' });
  }
  return res.json({ success: true, ...result });
});

export default router;
