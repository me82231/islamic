import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

import appConfig from '../app.config.js';
import searchRoutes from './routes/search.js';
import hadithRoutes from './routes/hadith.js';
import translateRoutes from './routes/translate.js';
import languagesRoutes from './routes/languages.js';
import dailyRoutes from './routes/daily.js';
import valuesRoutes from './routes/values.js';
import { initSearchIndex } from './search/search-engine.js';
import { startValuesPrewarm } from './values/prewarm.js';
import { isAiConfigured, getConfiguredModel } from './ai/gemini.js';
import { initializeRouter, getRouterStatus } from './ai/router.js';
import { rateLimiter, sanitizeInput, securityHeaders, translationRateLimiter } from './middleware/security.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

const app = express();
const PORT = process.env.PORT || appConfig.server.port || 3000;

// Security and utility middlewares
app.use(securityHeaders);
app.use(sanitizeInput);
app.use(rateLimiter);
app.use(cors({
  origin: '*', // Will be overridden by securityHeaders
  methods: ['GET', 'POST', 'OPTIONS'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!req.url.startsWith('/css') && !req.url.startsWith('/js') && !req.url.startsWith('/favicon')) {
      console.log(`[HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// App configuration and status endpoint for frontend
app.get('/api/config', (req, res) => {
  res.json({
    appName: appConfig.appName,
    appNameArabic: appConfig.appNameArabic,
    tagline: appConfig.tagline,
    taglineArabic: appConfig.taglineArabic,
    version: appConfig.version,
    sources: appConfig.sources,
    footer: appConfig.footer,
    aiConfigured: isAiConfigured(),
    model: getConfiguredModel()
  });
});

// Diagnostics endpoint for translation providers
app.get('/api/diagnostics', async (req, res) => {
  try {
    const routerStatus = await getRouterStatus();
    res.json({
      success: true,
      translation: routerStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get diagnostics',
      error: error.message
    });
  }
});

// Mount API routes
app.use('/api/search', searchRoutes);
app.use('/api/hadith', hadithRoutes);
app.use('/api/translate', translationRateLimiter, translateRoutes);
app.use('/api/languages', languagesRoutes);
app.use('/api/daily', dailyRoutes);
app.use('/api/values', valuesRoutes);

// Serve static frontend assets
app.use(express.static(PUBLIC_DIR));

// Fallback for SPA routing
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API route not found' });
  }
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server & Initialize Search Engine
async function start() {
  try {
    console.log('========================================================');
    console.log(`   ${appConfig.appNameArabic} | ${appConfig.appName}`);
    console.log('========================================================');
    console.log('[Init] Warming up in-memory search index...');
    initSearchIndex();
    
    console.log('[Init] Initializing translation router...');
    await initializeRouter();

    app.listen(PORT, () => {
      console.log(`\n🚀 Server is running smoothly at:`);
      console.log(`👉 http://localhost:${PORT}`);
      console.log(`👉 http://127.0.0.1:${PORT}`);
      console.log(`\n🤖 AI Status: ${isAiConfigured() ? `Active (Model: ${getConfiguredModel()})` : 'Offline Mode (Local search + Pre-cached English ready)'}`);
      console.log(`📖 Sources: Sahih al-Bukhari (7,580) & Sahih Muslim (7,360)`);
      console.log('========================================================\n');
      // Pre-warm is OFF by default: it fires value featured hadiths × 12 languages
      // at startup, which instantly exhausts the free-tier daily Gemini quota
      // (20 req/day) and breaks ALL on-demand translation (hadiths + values).
      // Enable only on a paid/high-quota key via: VALUES_PREWARM=1
      if (process.env.VALUES_PREWARM === '1') {
        startValuesPrewarm();
      } else {
        console.log('ℹ️  Values pre-warm disabled (set VALUES_PREWARM=1 to enable) — preserving translation quota for on-demand use.');
      }
    });
  } catch (err) {
    console.error('[Server Startup Error]', err);
    process.exit(1);
  }
}

start();
