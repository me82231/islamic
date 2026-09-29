/**
 * Honorifics Post-Processing Utility
 * Applies Islamic honorifics to translated text after translation
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load honorifics config
let honorificsConfig = null;

function loadHonorificsConfig() {
  if (honorificsConfig) return honorificsConfig;
  
  try {
    const configPath = join(__dirname, '../../config/honorifics.json');
    const configData = readFileSync(configPath, 'utf-8');
    honorificsConfig = JSON.parse(configData);
    return honorificsConfig;
  } catch (error) {
    console.error('[Honorifics] Failed to load config:', error.message);
    return null;
  }
}

/**
 * Apply honorifics to translated text
 * @param {string} translation - The translated text
 * @param {string} langCode - Target language code
 * @param {object} context - Context including narrator, book, etc.
 * @returns {string} - Text with honorifics applied
 */
export function applyHonorifics(translation, langCode, context = {}) {
  const config = loadHonorificsConfig();
  if (!config) return translation;

  const lang = langCode.toLowerCase();
  let processedText = translation;

  // Apply Prophet's honorific (ﷺ)
  processedText = applyProphetHonorific(processedText, lang, config);

  // Apply Companion's honorific (رضي الله عنه/عنها)
  processedText = applyCompanionHonorific(processedText, lang, context, config);

  // Ensure "Allah" is kept untranslated where required
  processedText = ensureAllahUntranslated(processedText, lang, config);

  return processedText;
}

/**
 * Apply Prophet's honorific after mentions of the Prophet
 */
function applyProphetHonorific(text, lang, config) {
  const prophetHonorifics = config.prophetHonorifics;
  const prophetNames = config.prophetNames;

  const honorific = prophetHonorifics[lang] || prophetHonorifics['en'];
  const names = prophetNames[lang] || prophetNames['en'];

  let processed = text;

  // Apply honorific after each prophet name
  names.forEach(name => {
    // Case-insensitive replacement
    const regex = new RegExp(`(${name})(?![\\s]*${escapeRegex(honorific)})`, 'gi');
    processed = processed.replace(regex, `$1 ${honorific}`);
  });

  return processed;
}

/**
 * Apply Companion's honorific after mentions of companions
 */
function applyCompanionHonorific(text, lang, context, config) {
  const companionHonorifics = config.companionHonorifics;
  const companionFemaleHonorifics = config.companionFemaleHonorifics;

  const honorific = companionHonorifics[lang] || companionHonorifics['en'];
  const honorificFemale = companionFemaleHonorifics[lang] || companionFemaleHonorifics['en'];

  // Common companion names (simplified - in production, this would be more comprehensive)
  const maleCompanions = [
    'Abu Bakr', 'أبو بكر',
    'Umar', 'عمر',
    'Uthman', 'عثمان',
    'Ali', 'علي',
    'Abu Hurairah', 'أبو هريرة',
    'Aisha', 'عائشة',
    'Ibn Umar', 'ابن عمر',
    'Ibn Abbas', 'ابن عباس',
    'Anas', 'أنس'
  ];

  let processed = text;

  maleCompanions.forEach(name => {
    const regex = new RegExp(`(${name})(?![\\s]*${escapeRegex(honorific)})`, 'gi');
    processed = processed.replace(regex, `$1 ${honorific}`);
  });

  // Special handling for Aisha (female companion)
  const aishaRegex = new RegExp('(Aisha|عائشة)(?![\\s]*' + escapeRegex(honorificFemale) + ')', 'gi');
  processed = processed.replace(aishaRegex, `$1 ${honorificFemale}`);

  return processed;
}

/**
 * Ensure "Allah" is kept untranslated in languages that require it
 */
function ensureAllahUntranslated(text, lang, config) {
  const keepUntranslated = config.keepAllahUntranslated || [];
  
  // If language requires keeping "Allah" untranslated
  if (keepUntranslated.includes(lang)) {
    // Replace common translations of Allah back to "Allah"
    const allahVariants = [
      ['God', 'Allah'],
      ['Dios', 'Allah'],
      ['Dieu', 'Allah'],
      ['Gott', 'Allah'],
      ['Tanrı', 'Allah'],
      ['Бог', 'Allah'],
      ['神', 'Allah'],
      ['ईश्वर', 'Allah'],
      ['ঈশ্বর', 'Allah'],
      ['Deus', 'Allah'],
      ['Dio', 'Allah'],
      ['神', 'Allah'],
      ['Mungu', 'Allah'],
      ['Allah', 'Allah'] // Already correct
    ];

    let processed = text;
    allahVariants.forEach(([variant, correct]) => {
      const regex = new RegExp(`\\b${variant}\\b`, 'gi');
      processed = processed.replace(regex, correct);
    });

    return processed;
  }

  return text;
}

/**
 * Escape special regex characters
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Get honorific for a specific language
 */
export function getProphetHonorific(langCode) {
  const config = loadHonorificsConfig();
  if (!config) return null;
  
  const lang = langCode.toLowerCase();
  return config.prophetHonorifics[lang] || config.prophetHonorifics['en'];
}

/**
 * Get companion honorific for a specific language
 */
export function getCompanionHonorific(langCode, isFemale = false) {
  const config = loadHonorificsConfig();
  if (!config) return null;
  
  const lang = langCode.toLowerCase();
  if (isFemale) {
    return config.companionFemaleHonorifics[lang] || config.companionFemaleHonorifics['en'];
  }
  return config.companionHonorifics[lang] || config.companionHonorifics['en'];
}
