/**
 * Hadith Lens - Frontend Application
 * Sacred manuscript meets modern luxury reading experience
 */

// ============================================
// State Management
// ============================================
const state = {
  currentLang: 'ar',
  searchQuery: '',
  searchResults: [],
  currentHadith: null,
  selectedLanguages: [],
  pinnedLanguages: [],
  allLanguages: [],
  translations: {},
  isLoading: false,
  isTranslating: false,
  // Live search internals
  liveController: null,
  liveTimer: null,
  liveInFlightQuery: '',
  // New state
  history: [],
  bookmarks: [],
  readingSettings: {
    fontSize: 24,
    lineHeight: 2.2,
    showTashkeel: true
  },
  compareLanguages: []
};

// ============================================
// DOM Elements
// ============================================
const elements = {
  langToggle: document.getElementById('lang-toggle'),
  langToggleText: document.querySelector('.lang-toggle-text'),
  searchInput: document.getElementById('search-input'),
  searchBtn: document.getElementById('search-btn'),
  voiceSearch: document.getElementById('voice-search'),
  searchExamples: document.getElementById('search-examples'),
  searchHint: document.getElementById('search-hint'),
  searchError: document.getElementById('search-error'),
  searchErrorMsg: document.getElementById('search-error-msg'),
  searchRetry: document.getElementById('search-retry'),
  liveResults: document.getElementById('live-results'),
  heroSection: document.getElementById('hero-section'),
  resultsSection: document.getElementById('results-section'),
  resultsList: document.getElementById('results-list'),
  resultsTitle: document.getElementById('results-title'),
  resultsCount: document.getElementById('results-count'),
  hadithDetail: document.getElementById('hadith-detail'),
  backButton: document.getElementById('back-button'),
  backText: document.getElementById('back-text'),
  hadithCard: document.getElementById('hadith-card'),
  detailSource: document.getElementById('detail-source'),
  detailBook: document.getElementById('detail-book'),
  detailNumber: document.getElementById('detail-number'),
  detailArabic: document.getElementById('detail-arabic'),
  detailNarrator: document.getElementById('detail-narrator'),
  narratorLabel: document.getElementById('narrator-label'),
  copyHadith: document.getElementById('copy-hadith'),
  shareHadith: document.getElementById('share-hadith'),
  bookmarkHadith: document.getElementById('bookmark-hadith'),
  readingMode: document.getElementById('reading-mode'),
  compareMode: document.getElementById('compare-mode'),
  translationsSection: document.getElementById('translations-section'),
  translationsTitle: document.getElementById('translations-title'),
  translateTrigger: document.getElementById('translate-trigger'),
  translateText: document.getElementById('translate-text'),
  languageFilter: document.getElementById('language-filter'),
  languageSearch: document.getElementById('language-search'),
  pinFavorites: document.getElementById('pin-favorites'),
  toggleAllLanguages: document.getElementById('toggle-all-languages'),
  languageGrid: document.getElementById('language-grid'),
  translationsGrid: document.getElementById('translations-grid'),
  loadingState: document.getElementById('loading-state'),
  loadingText: document.getElementById('loading-text'),
  toast: document.getElementById('toast'),
  heroDescription: document.getElementById('hero-description'),
  // New elements
  relatedHadiths: document.getElementById('related-hadiths'),
  relatedList: document.getElementById('related-list'),
  readingModeOverlay: document.getElementById('reading-mode-overlay'),
  closeReadingMode: document.getElementById('close-reading-mode'),
  fontSizeSlider: document.getElementById('font-size-slider'),
  lineHeightSlider: document.getElementById('line-height-slider'),
  toggleTashkeel: document.getElementById('toggle-tashkeel'),
  readingArabic: document.getElementById('reading-arabic'),
  compareModeOverlay: document.getElementById('compare-mode-overlay'),
  closeCompareMode: document.getElementById('close-compare-mode'),
  compareArabic: document.getElementById('compare-arabic'),
  compareLanguageSelector: document.getElementById('compare-language-selector'),
  compareTranslationColumns: document.getElementById('compare-translation-columns'),
  commandPalette: document.getElementById('command-palette'),
  commandInput: document.getElementById('command-input'),
  commandResults: document.getElementById('command-results'),
  commandPaletteBackdrop: document.getElementById('command-palette-backdrop'),
  historyDrawer: document.getElementById('history-drawer'),
  drawerBackdrop: document.getElementById('drawer-backdrop'),
  closeDrawer: document.getElementById('close-drawer'),
  drawerList: document.getElementById('drawer-list'),
  exportHistory: document.getElementById('export-history'),
  clearHistory: document.getElementById('clear-history')
};

// ============================================
// Translations
// ============================================
const translations = {
  ar: {
    searchPlaceholder: 'ابحث...',
    searchExamples: ['إنما الأعمال بالنيات', 'hadith about intentions', 'Bukhari 1', 'speak good or keep silent', 'أبو هريرة'],
    resultsTitle: 'نتائج البحث',
    back: 'العودة',
    narrator: 'الراوي:',
    translations: 'الترجمات',
    translate: 'ترجم',
    searchLanguage: 'ابحث عن لغة...',
    loadingSearch: 'جاري البحث...',
    loadingTranslate: 'جاري الترجمة...',
    copied: 'تم النسخ',
    bookmarked: 'تم الحفظ',
    unbookmarked: 'تم إزالة الحفظ',
    error: 'حدث خطأ',
    noResults: 'لم يتم العثور على نتائج',
    typeMoreHint: 'اكتب حرفين على الأقل للبدء…',
    hadithSource: 'المصدر',
    hadithNumber: 'رقم الحديث',
    heroDescription: 'ابحث عن أي حديث نبوي صحيح بالعربية أو بأي لغة — واحصل على النص الأصلي والترجمات الفورية'
  },
  en: {
    searchPlaceholder: 'Search...',
    searchExamples: ['إنما الأعمال بالنيات', 'hadith about intentions', 'Bukhari 1', 'speak good or keep silent', 'أبو هريرة'],
    resultsTitle: 'Search Results',
    back: 'Back',
    narrator: 'Narrator:',
    translations: 'Translations',
    translate: 'Translate',
    searchLanguage: 'Search languages...',
    loadingSearch: 'Searching...',
    loadingTranslate: 'Translating...',
    copied: 'Copied',
    bookmarked: 'Bookmarked',
    unbookmarked: 'Removed from bookmarks',
    error: 'An error occurred',
    noResults: 'No results found',
    typeMoreHint: 'Type at least 2 characters to search…',
    hadithSource: 'Source',
    hadithNumber: 'Hadith #',
    heroDescription: 'Search any authentic Prophetic hadith in Arabic or any language — get the original text and instant translations'
  }
};

// ============================================
// RTL Languages List
// ============================================
const rtlLanguages = ['ar', 'ur', 'fa', 'ps', 'ku', 'dv', 'ug', 'ckb', 'sd'];

// ============================================
// Utility Functions
// ============================================
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function showToast(message, duration = 3000) {
  elements.toast.textContent = message;
  elements.toast.classList.remove('hidden');
  elements.toast.classList.add('show');
  
  setTimeout(() => {
    elements.toast.classList.remove('show');
    setTimeout(() => {
      elements.toast.classList.add('hidden');
    }, 300);
  }, duration);
}

function setLoading(isLoading, text) {
  state.isLoading = isLoading;
  elements.loadingText.textContent = text || translations[state.currentLang].loadingSearch;
  
  if (isLoading) {
    elements.loadingState.classList.remove('hidden');
  } else {
    elements.loadingState.classList.add('hidden');
  }
}

function isRTL(langCode) {
  return rtlLanguages.includes(langCode);
}

// Escape text before injecting into innerHTML (search results come from DB/AI)
function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Strip diacritics/tatweel and collapse whitespace to count "meaningful" chars
const TASHKEEL_RE = /[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;
function normalizeForCount(text) {
  return String(text || '')
    .replace(TASHKEEL_RE, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Human-readable source label
function sourceLabel(code) {
  if (!code) return '';
  const c = String(code).toLowerCase();
  if (c.includes('bukhari') || c === 'b') return 'صحيح البخاري';
  if (c.includes('muslim') || c === 'm') return 'صحيح مسلم';
  return code;
}

// ============================================
// Language Toggle
// ============================================
function toggleLanguage() {
  state.currentLang = state.currentLang === 'ar' ? 'en' : 'ar';
  document.documentElement.lang = state.currentLang;
  document.documentElement.dir = state.currentLang === 'ar' ? 'rtl' : 'ltr';
  
  elements.langToggleText.textContent = state.currentLang === 'ar' ? 'English' : 'العربية';
  
  updateUIText();
  renderSearchExamples();
}

function updateUIText() {
  const t = translations[state.currentLang];
  
  elements.searchInput.placeholder = t.searchPlaceholder;
  elements.resultsTitle.textContent = t.resultsTitle;
  elements.backText.textContent = t.back;
  elements.narratorLabel.textContent = t.narrator;
  elements.translationsTitle.textContent = t.translations;
  elements.translateText.textContent = t.translate;
  elements.languageSearch.placeholder = t.searchLanguage;
  elements.heroDescription.textContent = t.heroDescription;
}

// ============================================
// Search Examples
// ============================================
function renderSearchExamples() {
  const t = translations[state.currentLang];
  elements.searchExamples.innerHTML = '';
  
  t.searchExamples.forEach(example => {
    const button = document.createElement('button');
    button.className = 'search-example';
    button.textContent = example;
    button.addEventListener('click', () => {
      elements.searchInput.value = example;
      elements.searchInput.focus();
      scheduleLiveSearch();
    });
    elements.searchExamples.appendChild(button);
  });
}

// ============================================
// Search Functionality
// ============================================
const LIVE_MIN_CHARS = 2;
const LIVE_DEBOUNCE_MS = 150;

// Candidate text/label helpers
function candidateText(c) {
  return c.text_full || c.text_normalized || c.text || '';
}

function truncate(text, max) {
  const t = String(text || '').trim();
  return t.length > max ? t.slice(0, max).trimEnd() + '…' : t;
}

// Core fetch: returns { candidates, valueMatch }. Throws on network/HTTP error.
async function fetchCandidates(query, { signal, limit = 7 } = {}) {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=${limit}`, { signal });
  let data = null;
  try {
    data = await response.json();
  } catch (_) {
    data = null;
  }
  if (!response.ok || !data || data.success === false) {
    const msg = (data && (data.message || data.error)) || translations[state.currentLang].error;
    throw new Error(msg);
  }
  const candidates = Array.isArray(data.candidates) ? data.candidates : (Array.isArray(data.results) ? data.results : []);
  return { candidates, valueMatch: data.valueMatch || null };
}

function hideLiveDropdown() {
  elements.liveResults.classList.add('hidden');
  elements.liveResults.innerHTML = '';
}

function clearInlineFeedback() {
  elements.searchHint.classList.add('hidden');
  elements.searchHint.textContent = '';
  elements.searchError.classList.add('hidden');
}

function showSearchHint(text) {
  elements.searchError.classList.add('hidden');
  hideLiveDropdown();
  elements.searchHint.textContent = text;
  elements.searchHint.classList.remove('hidden');
}

function showSearchError(message) {
  elements.searchHint.classList.add('hidden');
  hideLiveDropdown();
  elements.searchErrorMsg.textContent = message || translations[state.currentLang].error;
  elements.searchError.classList.remove('hidden');
}

// Live search: fires on debounced input. Never touches the input element.
function scheduleLiveSearch() {
  if (state.liveTimer) clearTimeout(state.liveTimer);
  state.liveTimer = setTimeout(runLiveSearch, LIVE_DEBOUNCE_MS);
}

async function runLiveSearch() {
  const query = elements.searchInput.value;
  const meaningful = normalizeForCount(query);

  // Cancel any in-flight request so older results never overwrite newer ones.
  if (state.liveController) {
    state.liveController.abort();
    state.liveController = null;
  }

  clearInlineFeedback();

  if (meaningful.length < LIVE_MIN_CHARS) {
    hideLiveDropdown();
    if (meaningful.length > 0) {
      showSearchHint(translations[state.currentLang].typeMoreHint);
    }
    return;
  }

  // Subtle loading row inside the dropdown (input stays focused & visible).
  elements.liveResults.innerHTML = `<div class="live-loading"><span class="live-spinner"></span>${escapeHtml(translations[state.currentLang].loadingSearch)}</div>`;
  elements.liveResults.classList.remove('hidden');

  const controller = new AbortController();
  state.liveController = controller;
  state.liveInFlightQuery = query;

  try {
    const { candidates, valueMatch } = await fetchCandidates(query, { signal: controller.signal, limit: 7 });
    // Ignore stale responses (a newer query superseded this one).
    if (controller.signal.aborted || state.liveController !== controller) return;
    state.searchResults = candidates;
    renderLiveSuggestions(candidates, valueMatch);
  } catch (error) {
    if (error && error.name === 'AbortError') return;
    if (state.liveController !== controller) return;
    showSearchError(error.message);
  } finally {
    if (state.liveController === controller) state.liveController = null;
  }
}

function renderLiveSuggestions(candidates, valueMatch) {
  const t = translations[state.currentLang];
  elements.searchHint.classList.add('hidden');
  elements.searchError.classList.add('hidden');

  if ((!candidates || candidates.length === 0) && !valueMatch) {
    elements.liveResults.innerHTML = `<div class="live-empty">${escapeHtml(t.noResults)}</div>`;
    elements.liveResults.classList.remove('hidden');
    return;
  }

  elements.liveResults.innerHTML = '';

  // Strong value-name match: first row routes to the value page.
  if (valueMatch) {
    const vItem = document.createElement('button');
    vItem.type = 'button';
    vItem.className = 'live-item live-item-value';
    vItem.style.setProperty('--value-accent', valueMatch.accent || '#D4AF6A');
    vItem.innerHTML = `
      <span class="live-item-source">${escapeHtml((state.currentLang === 'ar' ? 'قيمة إسلامية' : 'Islamic Value'))} · ${escapeHtml(valueMatch.nameAr)} · ${escapeHtml(valueMatch.nameEn)}</span>
      <span class="live-item-text">${escapeHtml(state.currentLang === 'ar' ? 'فتح صفحة القيمة وقراءاتها' : 'Open the value page with its hadiths')}</span>
    `;
    vItem.addEventListener('click', () => {
      hideLiveDropdown();
      location.hash = `#/values/${valueMatch.id}`;
    });
    elements.liveResults.appendChild(vItem);
  }

  (candidates || []).forEach(c => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'live-item';
    item.setAttribute('role', 'option');
    item.innerHTML = `
      <span class="live-item-source">${escapeHtml(sourceLabel(c.source))} · #${escapeHtml(c.hadith_number)}</span>
      <span class="live-item-text" dir="rtl">${escapeHtml(truncate(candidateText(c), 110))}</span>
    `;
    item.addEventListener('click', () => {
      // Clicking a suggestion navigates to the full detail view.
      hideLiveDropdown();
      openHadithDetail(c);
    });
    elements.liveResults.appendChild(item);
  });
  elements.liveResults.classList.remove('hidden');
}

// Full search: navigates to the results list. Hero (and input) stays in place.
async function performSearch(query) {
  const meaningful = normalizeForCount(query);
  if (meaningful.length < LIVE_MIN_CHARS) {
    showSearchHint(translations[state.currentLang].typeMoreHint);
    return;
  }

  state.searchQuery = query;
  clearInlineFeedback();
  hideLiveDropdown();

  // Show the results container with a lightweight loading state (no full-page overlay).
  elements.resultsSection.classList.remove('hidden');
  elements.resultsList.innerHTML = `<p class="results-loading">${escapeHtml(translations[state.currentLang].loadingSearch)}</p>`;
  elements.resultsCount.textContent = '';

  try {
    const { candidates, valueMatch } = await fetchCandidates(query, { limit: 20 });
    // Strong value-name match routes to the value page (conservative matcher server-side).
    if (valueMatch) {
      elements.resultsSection.classList.add('hidden');
      location.hash = `#/values/${valueMatch.id}`;
      // Same-hash repeat searches don't fire hashchange — route manually.
      if (location.hash === `#/values/${valueMatch.id}` && !elements.valuePage.classList.contains('hidden')) openValuePage(valueMatch.id);
      return;
    }
    state.searchResults = candidates;
    renderResults(candidates, valueMatch);
  } catch (error) {
    console.error('Search error:', error);
    elements.resultsSection.classList.add('hidden');
    showSearchError(error.message);
  }
}

function clearSearch() {
  elements.searchInput.value = '';
  state.searchQuery = '';
  state.searchResults = [];
  clearInlineFeedback();
  hideLiveDropdown();
  elements.resultsSection.classList.add('hidden');
  elements.heroSection.classList.remove('hidden');
}

function renderResults(results, valueMatch) {
  const t = translations[state.currentLang];

  elements.heroSection.classList.remove('hidden');
  elements.resultsSection.classList.remove('hidden');
  elements.resultsList.innerHTML = '';

  // Value banner above results when the query also names a value.
  if (valueMatch) {
    const banner = document.createElement('button');
    banner.type = 'button';
    banner.className = 'value-result-banner';
    banner.style.setProperty('--value-accent', valueMatch.accent || '#D4AF6A');
    banner.innerHTML = `«${escapeHtml(valueMatch.nameAr)}» — ${escapeHtml(t.viewValuePage || 'عرض صفحة القيمة')}`;
    banner.addEventListener('click', () => { location.hash = `#/values/${valueMatch.id}`; });
    elements.resultsList.appendChild(banner);
  }

  if (!results || results.length === 0) {
    elements.resultsCount.textContent = '0';
    elements.resultsList.innerHTML = `<p class="no-results">${escapeHtml(t.noResults)}</p>`;
    return;
  }

  elements.resultsCount.textContent = `${results.length}`;

  results.forEach((result, index) => {
    const card = document.createElement('div');
    card.className = 'result-card';
    card.tabIndex = 0;
    card.style.animationDelay = `${index * 0.06}s`;

    const tagsHtml = (result.values && result.values.length)
      ? `<div class="value-tags">${result.values.map(v => `<button type="button" class="value-tag" data-value-id="${escapeHtml(v.id)}" style="--value-accent:${escapeHtml(v.accent || '#D4AF6A')}">${escapeHtml(v.nameAr)}</button>`).join('')}</div>`
      : '';

    card.innerHTML = `
      <div class="result-card-header">
        <span class="result-source">${escapeHtml(sourceLabel(result.source))}</span>
        <span class="result-number">#${escapeHtml(result.hadith_number)}</span>
      </div>
      <p class="result-arabic" dir="rtl">${escapeHtml(truncate(candidateText(result), 220))}</p>
      <p class="result-narrator">${escapeHtml(t.narrator)} ${escapeHtml(result.narrator || '')}</p>
      ${tagsHtml}
    `;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.value-tag')) return;
      openHadithDetail(result);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') openHadithDetail(result);
    });
    card.querySelectorAll('.value-tag').forEach(tag => {
      tag.addEventListener('click', (e) => {
        e.stopPropagation();
        location.hash = `#/values/${tag.dataset.valueId}`;
      });
    });

    elements.resultsList.appendChild(card);
  });
}

// ============================================
// Hadith Detail
// ============================================
async function showHadithDetail(hadith) {
  state.currentHadith = hadith;
  
  elements.resultsSection.classList.add('hidden');
  elements.heroSection.classList.add('hidden');
  elements.hadithDetail.classList.remove('hidden');
  hideValueViews();
  
  elements.detailSource.textContent = hadith.source;
  elements.detailBook.textContent = hadith.book_name || hadith.book || '';
  elements.detailNumber.textContent = `#${hadith.hadith_number}`;
  elements.detailArabic.textContent = hadith.text_full || hadith.text;
  elements.detailNarrator.textContent = hadith.narrator;
  
  // Value cross-link tags (attached to the hadith object for history/share).
  await attachHadithValues(hadith);
  renderDetailValueTags(hadith);
  
  // Reset translations
  elements.translationsGrid.innerHTML = '';
  state.translations = {};
  state.selectedLanguages = [];
  
  // Load languages
  await loadLanguages();
}

function goBack() {
  elements.hadithDetail.classList.add('hidden');
  elements.heroSection.classList.remove('hidden');
  state.currentHadith = null;
  // Return to the value page when the hadith was opened from it.
  if (state.valueReturnContext) {
    const ctx = state.valueReturnContext;
    state.valueReturnContext = null;
    if (ctx.kind === 'value') {
      openValuePage(ctx.id, true);
      return;
    }
    if (ctx.kind === 'gallery') {
      openValuesGallery(true);
      return;
    }
  }
  elements.resultsSection.classList.remove('hidden');
}

// ============================================
// Languages
// ============================================
async function loadLanguages() {
  try {
    const response = await fetch('/api/languages');
    const data = await response.json();
    
    if (data.success) {
      state.allLanguages = data.languages;
      renderLanguageGrid();
    }
  } catch (error) {
    console.error('Failed to load languages:', error);
  }
}

function renderLanguageGrid(filter = '') {
  elements.languageGrid.innerHTML = '';
  
  const filteredLanguages = state.allLanguages.filter(lang => {
    const search = filter.toLowerCase();
    return lang.name.toLowerCase().includes(search) || 
           lang.nativeName.toLowerCase().includes(search);
  });
  
  // Sort: pinned first, then alphabetically
  const sortedLanguages = [...filteredLanguages].sort((a, b) => {
    const aPinned = state.pinnedLanguages.includes(a.code);
    const bPinned = state.pinnedLanguages.includes(b.code);
    
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    
    return a.name.localeCompare(b.name);
  });
  
  sortedLanguages.forEach(lang => {
    const card = document.createElement('div');
    card.className = 'language-card';
    card.dataset.code = lang.code;
    
    if (state.pinnedLanguages.includes(lang.code)) {
      card.classList.add('pinned');
    }
    
    if (state.selectedLanguages.includes(lang.code)) {
      card.classList.add('selected');
    }
    
    // Create monogram from first letter of native name
    const monogram = lang.nativeName.charAt(0).toUpperCase();
    
    card.innerHTML = `
      <div class="language-monogram">${monogram}</div>
      <div class="language-native">${lang.nativeName}</div>
      <div class="language-name">${lang.name}</div>
    `;
    
    card.addEventListener('click', () => {
      toggleLanguageSelection(lang.code, card);
    });
    
    card.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      toggleLanguagePin(lang.code);
    });
    
    elements.languageGrid.appendChild(card);
  });
}

function toggleLanguageSelection(code, card) {
  const index = state.selectedLanguages.indexOf(code);
  
  if (index > -1) {
    state.selectedLanguages.splice(index, 1);
    card.classList.remove('selected');
  } else {
    state.selectedLanguages.push(code);
    card.classList.add('selected');
  }
}

function toggleLanguagePin(code) {
  const index = state.pinnedLanguages.indexOf(code);
  
  if (index > -1) {
    state.pinnedLanguages.splice(index, 1);
    showToast(translations[state.currentLang].unbookmarked);
  } else {
    state.pinnedLanguages.push(code);
    showToast(translations[state.currentLang].bookmarked);
  }
  
  localStorage.setItem('pinnedLanguages', JSON.stringify(state.pinnedLanguages));
  renderLanguageGrid(elements.languageSearch.value);
}

// ============================================
// Translations with SSE
// ============================================
async function startTranslation() {
  if (!state.currentHadith || state.selectedLanguages.length === 0) {
    showToast('Please select at least one language');
    return;
  }
  
  state.isTranslating = true;
  elements.translateTrigger.disabled = true;
  elements.translateText.textContent = translations[state.currentLang].loadingTranslate;
  
  // Clear previous translations
  elements.translationsGrid.innerHTML = '';
  
  // Create skeleton cards for each language
  state.selectedLanguages.forEach((langCode, index) => {
    const lang = state.allLanguages.find(l => l.code === langCode);
    if (!lang) return;
    
    const card = createTranslationCard(lang, null, true, null);
    card.style.animationDelay = `${index * 0.05}s`;
    elements.translationsGrid.appendChild(card);
  });
  
  const { source, hadith_number } = state.currentHadith;
  const langs = state.selectedLanguages.join(',');
  
  try {
    const eventSource = new EventSource(
      `/api/translate/stream?source=${source}&number=${hadith_number}&langs=${langs}`
    );
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'init') {
        console.log('Translation started for', data.totalLanguages, 'languages');
      } else if (data.type === 'translation') {
        updateTranslationCard(data);
      } else if (data.type === 'error') {
        handleTranslationError(data);
      } else if (data.type === 'done') {
        eventSource.close();
        state.isTranslating = false;
        elements.translateTrigger.disabled = false;
        elements.translateText.textContent = translations[state.currentLang].translate;
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
      state.isTranslating = false;
      elements.translateTrigger.disabled = false;
      elements.translateText.textContent = translations[state.currentLang].translate;
      showToast(translations[state.currentLang].error);
    };
    
  } catch (error) {
    console.error('Translation error:', error);
    state.isTranslating = false;
    elements.translateTrigger.disabled = false;
    elements.translateText.textContent = translations[state.currentLang].translate;
    showToast(translations[state.currentLang].error);
  }
}

function createTranslationCard(lang, translation, isLoading = false, provider = null) {
  const card = document.createElement('div');
  card.className = `translation-card ${isLoading ? 'loading' : ''}`;
  card.dataset.lang = lang.code;
  
  const monogram = lang.nativeName.charAt(0).toUpperCase();
  const dir = isRTL(lang.code) ? 'rtl' : 'ltr';
  
  // Provider display name (no "AI" wording)
  const providerDisplay = provider === 'cached' ? 'cached' : provider || '';
  
  card.innerHTML = `
    <div class="translation-card-header">
      <div class="translation-language">
        <span class="translation-monogram">${monogram}</span>
        <span class="translation-name">${lang.nativeName}</span>
        ${providerDisplay ? `<span class="translation-provider">${providerDisplay}</span>` : ''}
      </div>
      <div class="translation-actions">
        <button class="translation-action copy-translation" aria-label="Copy">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
        <button class="translation-action listen-translation" aria-label="Listen">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
        </button>
      </div>
    </div>
    <p class="translation-text" dir="${dir}">${translation || '...'}</p>
  `;
  
  // Add event listeners
  const copyBtn = card.querySelector('.copy-translation');
  const listenBtn = card.querySelector('.listen-translation');
  
  copyBtn.addEventListener('click', () => {
    const text = card.querySelector('.translation-text').textContent;
    if (text && text !== '...') {
      navigator.clipboard.writeText(text);
      showToast(translations[state.currentLang].copied);
    }
  });
  
  listenBtn.addEventListener('click', () => {
    const text = card.querySelector('.translation-text').textContent;
    if (text && text !== '...' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang.code;
      speechSynthesis.speak(utterance);
    }
  });
  
  return card;
}

function updateTranslationCard(data) {
  const card = elements.translationsGrid.querySelector(`[data-lang="${data.lang}"]`);
  if (!card) return;
  
  card.classList.remove('loading');
  
  const textEl = card.querySelector('.translation-text');
  textEl.textContent = data.translation;
  textEl.dir = data.direction || 'ltr';
  
  // Update or add provider tag
  const provider = data.provider || '';
  const providerEl = card.querySelector('.translation-provider');
  
  if (provider && !providerEl) {
    const langEl = card.querySelector('.translation-language');
    const providerSpan = document.createElement('span');
    providerSpan.className = 'translation-provider';
    providerSpan.textContent = provider;
    langEl.appendChild(providerSpan);
  } else if (providerEl) {
    providerEl.textContent = provider;
  }
  
  state.translations[data.lang] = data.translation;
}

function handleTranslationError(data) {
  const card = elements.translationsGrid.querySelector(`[data-lang="${data.lang}"]`);
  if (!card) return;
  
  card.classList.remove('loading');
  card.classList.add('error');
  
  const textEl = card.querySelector('.translation-text');
  textEl.innerHTML = `<span class="translation-error">${data.error}</span>`;
}

// ============================================
// Hadith Actions
// ============================================
function copyHadith() {
  if (!state.currentHadith) return;
  
  const text = `${state.currentHadith.text_full || state.currentHadith.text}\n\n${translations[state.currentLang].narrator} ${state.currentHadith.narrator}\n${state.currentHadith.source} - ${state.currentHadith.hadith_number}`;
  
  navigator.clipboard.writeText(text).then(() => {
    showToast(translations[state.currentLang].copied);
  });
}

function shareHadith() {
  // For now, just copy to clipboard
  // In a full implementation, this would generate an image
  copyHadith();
  showToast('Copied - Image sharing coming soon');
}

function bookmarkHadith() {
  if (!state.currentHadith) return;
  
  const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
  const hadithKey = `${state.currentHadith.source}-${state.currentHadith.hadith_number}`;
  
  const index = bookmarks.indexOf(hadithKey);
  
  if (index > -1) {
    bookmarks.splice(index, 1);
    elements.bookmarkHadith.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
    `;
    showToast(translations[state.currentLang].unbookmarked);
  } else {
    bookmarks.push(hadithKey);
    elements.bookmarkHadith.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
    `;
    showToast(translations[state.currentLang].bookmarked);
  }
  
  localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
}

// ============================================
// Keyboard Navigation
// ============================================
function handleKeyboard(e) {
  // / to focus search
  if (e.key === '/' && document.activeElement !== elements.searchInput) {
    e.preventDefault();
    elements.searchInput.focus();
  }
  
  // Escape to clear search or go back
  if (e.key === 'Escape') {
    if (elements.hadithDetail.classList.contains('hidden') === false) {
      goBack();
    } else if (!elements.resultsSection.classList.contains('hidden')) {
      elements.resultsSection.classList.add('hidden');
      elements.heroSection.classList.remove('hidden');
      elements.searchInput.value = '';
    }
  }
  
  // Arrow key navigation in results
  if (!elements.resultsSection.classList.contains('hidden')) {
    const cards = Array.from(elements.resultsList.querySelectorAll('.result-card'));
    const currentIndex = cards.findIndex(card => card === document.activeElement);
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = currentIndex < cards.length - 1 ? currentIndex + 1 : 0;
      cards[nextIndex]?.focus();
    }
    
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : cards.length - 1;
      cards[prevIndex]?.focus();
    }
    
    if (e.key === 'Enter' && currentIndex > -1) {
      e.preventDefault();
      cards[currentIndex]?.click();
    }
  }
}

// ============================================
// Language Filter Actions
// ============================================
function toggleAllLanguages() {
  const allSelected = state.selectedLanguages.length === state.allLanguages.length;
  
  if (allSelected) {
    state.selectedLanguages = [];
  } else {
    state.selectedLanguages = state.allLanguages.map(lang => lang.code);
  }
  
  renderLanguageGrid(elements.languageSearch.value);
}

function showOnlyFavorites() {
  elements.pinFavorites.classList.toggle('active');
  
  if (elements.pinFavorites.classList.contains('active')) {
    const filtered = state.allLanguages.filter(lang => 
      state.pinnedLanguages.includes(lang.code)
    );
    renderLanguageGridWithFiltered(filtered);
  } else {
    renderLanguageGrid(elements.languageSearch.value);
  }
}

function renderLanguageGridWithFiltered(languages) {
  elements.languageGrid.innerHTML = '';
  
  languages.forEach(lang => {
    const card = document.createElement('div');
    card.className = 'language-card';
    card.dataset.code = lang.code;
    
    if (state.pinnedLanguages.includes(lang.code)) {
      card.classList.add('pinned');
    }
    
    if (state.selectedLanguages.includes(lang.code)) {
      card.classList.add('selected');
    }
    
    const monogram = lang.nativeName.charAt(0).toUpperCase();
    
    card.innerHTML = `
      <div class="language-monogram">${monogram}</div>
      <div class="language-native">${lang.nativeName}</div>
      <div class="language-name">${lang.name}</div>
    `;
    
    card.addEventListener('click', () => {
      toggleLanguageSelection(lang.code, card);
    });
    
    elements.languageSearch.appendChild(card);
  });
}

// ============================================
// Cursor Glow Effect
// ============================================
function initCursorGlow() {
  const cursorGlow = document.createElement('div');
  cursorGlow.className = 'cursor-glow';
  document.body.appendChild(cursorGlow);
  
  let mouseX = 0;
  let mouseY = 0;
  let glowX = 0;
  let glowY = 0;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorGlow.classList.add('active');
  });
  
  document.addEventListener('mouseleave', () => {
    cursorGlow.classList.remove('active');
  });
  
  function animate() {
    glowX += (mouseX - glowX) * 0.1;
    glowY += (mouseY - glowY) * 0.1;
    
    cursorGlow.style.left = `${glowX - 150}px`;
    cursorGlow.style.top = `${glowY - 150}px`;
    
    requestAnimationFrame(animate);
  }
  
  animate();
}

// ============================================
// Initialize
// ============================================
function init() {
  // Load saved state
  const savedLang = localStorage.getItem('preferredLang');
  if (savedLang) {
    state.currentLang = savedLang;
    document.documentElement.lang = state.currentLang;
    document.documentElement.dir = state.currentLang === 'ar' ? 'rtl' : 'ltr';
    elements.langToggleText.textContent = state.currentLang === 'ar' ? 'English' : 'العربية';
  }
  
  const savedPinned = localStorage.getItem('pinnedLanguages');
  if (savedPinned) {
    state.pinnedLanguages = JSON.parse(savedPinned);
  }
  
  // Load history and bookmarks
  const savedHistory = localStorage.getItem('hadithHistory');
  if (savedHistory) {
    state.history = JSON.parse(savedHistory);
  }
  
  const savedBookmarks = localStorage.getItem('hadithBookmarks');
  if (savedBookmarks) {
    state.bookmarks = JSON.parse(savedBookmarks);
  }
  
  // Load reading settings
  const savedReadingSettings = localStorage.getItem('readingSettings');
  if (savedReadingSettings) {
    state.readingSettings = JSON.parse(savedReadingSettings);
  }
  
  // Update UI
  updateUIText();
  renderSearchExamples();
  
  // Initialize cursor glow (respects prefers-reduced-motion)
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    initCursorGlow();
  }
  
  // Add magnetic and ripple classes to buttons
  document.querySelectorAll('button').forEach(btn => {
    btn.classList.add('magnetic-button', 'ripple-button');
  });
  
  // Event Listeners
  elements.langToggle.addEventListener('click', toggleLanguage);
  
  elements.searchInput.addEventListener('input', () => {
    // Cancel any pending debounce and in-flight request, then run a live search.
    if (state.liveTimer) { clearTimeout(state.liveTimer); state.liveTimer = null; }
    clearInlineFeedback();
    scheduleLiveSearch();
  });

  elements.searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (state.liveTimer) { clearTimeout(state.liveTimer); state.liveTimer = null; }
      if (state.liveController) { state.liveController.abort(); state.liveController = null; }
      hideLiveDropdown();
      performSearch(elements.searchInput.value);
    } else if (e.key === 'Escape') {
      hideLiveDropdown();
      clearInlineFeedback();
    }
  });

  elements.searchBtn.addEventListener('click', () => {
    if (state.liveController) { state.liveController.abort(); state.liveController = null; }
    hideLiveDropdown();
    performSearch(elements.searchInput.value);
  });

  if (elements.searchRetry) {
    elements.searchRetry.addEventListener('click', () => {
      clearInlineFeedback();
      performSearch(elements.searchInput.value);
      elements.searchInput.focus();
    });
  }

  // Close the live suggestions dropdown when clicking anywhere outside the search area.
  document.addEventListener('click', (e) => {
    if (elements.liveResults && !elements.liveResults.classList.contains('hidden')
        && !e.target.closest('.search-wrapper')) {
      hideLiveDropdown();
    }
  });
  
  // Voice search
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    elements.voiceSearch.addEventListener('click', () => {
      try {
        recognition.start();
        elements.voiceSearch.classList.add('listening');
        showToast('Listening...');
      } catch (error) {
        console.error('Speech recognition error:', error);
        showToast('Voice search not available');
      }
    });
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      elements.searchInput.value = transcript;
      performSearch(transcript);
      elements.voiceSearch.classList.remove('listening');
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      elements.voiceSearch.classList.remove('listening');
      showToast('Voice search error');
    };
    
    recognition.onend = () => {
      elements.voiceSearch.classList.remove('listening');
    };
  } else {
    elements.voiceSearch.style.display = 'none';
  }
  
  elements.backButton.addEventListener('click', goBack);
  
  elements.copyHadith.addEventListener('click', copyHadith);
  elements.shareHadith.addEventListener('click', shareHadith);
  elements.bookmarkHadith.addEventListener('click', bookmarkHadith);
  
  elements.translateTrigger.addEventListener('click', startTranslation);
  
  // New event listeners
  elements.readingMode.addEventListener('click', openReadingMode);
  elements.compareMode.addEventListener('click', openCompareMode);
  elements.closeReadingMode.addEventListener('click', closeReadingMode);
  elements.closeCompareMode.addEventListener('click', closeCompareMode);
  
  elements.fontSizeSlider.addEventListener('input', (e) => {
    state.readingSettings.fontSize = parseInt(e.target.value);
    updateReadingDisplay();
    saveReadingSettings();
  });
  
  elements.lineHeightSlider.addEventListener('input', (e) => {
    state.readingSettings.lineHeight = parseFloat(e.target.value);
    updateReadingDisplay();
    saveReadingSettings();
  });
  
  elements.toggleTashkeel.addEventListener('click', toggleTashkeelDisplay);
  
  // Command palette
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      toggleCommandPalette();
    }
    if (e.key === 'Escape') {
      closeCommandPalette();
      closeReadingMode();
      closeCompareMode();
      closeHistoryDrawer();
    }
  });
  
  elements.commandPaletteBackdrop.addEventListener('click', closeCommandPalette);
  elements.commandInput.addEventListener('input', handleCommandSearch);
  
  elements.exportHistory.addEventListener('click', exportHistory);
  elements.clearHistory.addEventListener('click', clearHistory);
  
  elements.languageSearch.addEventListener('input', debounce((e) => {
    renderLanguageGrid(e.target.value);
  }, 150));
  
  elements.pinFavorites.addEventListener('click', showOnlyFavorites);
  elements.toggleAllLanguages.addEventListener('click', toggleAllLanguages);
  
  document.addEventListener('keydown', handleKeyboard);
  
  // Load hadith of the day
  loadHadithOfTheDay();
}

// Start the application
document.addEventListener('DOMContentLoaded', init);

// ============================================
// New Feature Functions
// ============================================

// Load Hadith of the Day
async function loadHadithOfTheDay() {
  try {
    const response = await fetch('/api/daily');
    const data = await response.json();
    
    if (data.success && data.hadith) {
      // Display hadith of the day in hero section
      const heroHadith = document.createElement('div');
      heroHadith.className = 'hero-hadith';
      heroHadith.innerHTML = `
        <p class="hero-hadith-arabic" dir="rtl">${data.hadith.text.substring(0, 150)}...</p>
        <p class="hero-hadith-meta">${data.hadith.source} ${data.hadith.hadith_number}</p>
      `;
      elements.heroSection.appendChild(heroHadith);
    }
  } catch (error) {
    console.error('Failed to load hadith of the day:', error);
  }
}

// Reading Mode
function openReadingMode() {
  if (!state.currentHadith) return;
  
  elements.readingArabic.textContent = state.currentHadith.text_full;
  elements.readingModeOverlay.classList.remove('hidden');
  elements.readingModeOverlay.setAttribute('aria-hidden', 'false');
  
  // Apply saved settings
  elements.fontSizeSlider.value = state.readingSettings.fontSize;
  elements.lineHeightSlider.value = state.readingSettings.lineHeight;
  updateReadingDisplay();
  
  document.body.style.overflow = 'hidden';
}

function closeReadingMode() {
  elements.readingModeOverlay.classList.add('hidden');
  elements.readingModeOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function updateReadingDisplay() {
  elements.readingArabic.style.fontSize = `${state.readingSettings.fontSize}px`;
  elements.readingArabic.style.lineHeight = state.readingSettings.lineHeight;
  
  if (state.readingSettings.showTashkeel) {
    elements.readingArabic.textContent = state.currentHadith.text_full;
  } else {
    elements.readingArabic.textContent = stripTashkeel(state.currentHadith.text_full);
  }
}

function toggleTashkeelDisplay() {
  state.readingSettings.showTashkeel = !state.readingSettings.showTashkeel;
  elements.toggleTashkeel.setAttribute('aria-pressed', state.readingSettings.showTashkeel);
  document.getElementById('tashkeel-text').textContent = state.readingSettings.showTashkeel ? 'إخفاء التشكيل' : 'إظهار التشكيل';
  updateReadingDisplay();
  saveReadingSettings();
}

function saveReadingSettings() {
  localStorage.setItem('readingSettings', JSON.stringify(state.readingSettings));
}

// Tashkeel stripping (client-side)
function stripTashkeel(text) {
  return text.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
}

// Compare Mode
function openCompareMode() {
  if (!state.currentHadith) return;
  
  elements.compareArabic.textContent = state.currentHadith.text_full;
  elements.compareModeOverlay.classList.remove('hidden');
  elements.compareModeOverlay.setAttribute('aria-hidden', 'false');
  
  // Render language selector
  renderCompareLanguageSelector();
  
  document.body.style.overflow = 'hidden';
}

function closeCompareMode() {
  elements.compareModeOverlay.classList.add('hidden');
  elements.compareModeOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function renderCompareLanguageSelector() {
  elements.compareLanguageSelector.innerHTML = '';
  
  state.allLanguages.forEach(lang => {
    const btn = document.createElement('button');
    btn.textContent = lang.nativeName;
    btn.dataset.code = lang.code;
    
    if (state.compareLanguages.includes(lang.code)) {
      btn.classList.add('active');
    }
    
    btn.addEventListener('click', () => toggleCompareLanguage(lang.code));
    elements.compareLanguageSelector.appendChild(btn);
  });
}

function toggleCompareLanguage(langCode) {
  const index = state.compareLanguages.indexOf(langCode);
  if (index > -1) {
    state.compareLanguages.splice(index, 1);
  } else {
    if (state.compareLanguages.length >= 3) {
      showToast('Maximum 3 languages');
      return;
    }
    state.compareLanguages.push(langCode);
  }
  
  renderCompareLanguageSelector();
  renderCompareTranslations();
}

async function renderCompareTranslations() {
  elements.compareTranslationColumns.innerHTML = '';
  
  for (const langCode of state.compareLanguages) {
    const lang = state.allLanguages.find(l => l.code === langCode);
    if (!lang) continue;
    
    const column = document.createElement('div');
    column.className = 'compare-translation-column';
    
    // Check cache first
    const cached = state.translations[langCode];
    
    if (cached) {
      column.innerHTML = `
        <h4 class="compare-column-title">${lang.nativeName}</h4>
        <p class="compare-translation-text" dir="${lang.direction}">${cached}</p>
      `;
    } else {
      column.innerHTML = `
        <h4 class="compare-column-title">${lang.nativeName}</h4>
        <p class="compare-translation-text shimmer">Loading...</p>
      `;
      
      // Fetch translation
      try {
        const { source, hadith_number } = state.currentHadith;
        const response = await fetch(
          `/api/translate/stream?source=${source}&number=${hadith_number}&langs=${langCode}`
        );
        
        // Simple fetch (not SSE for compare mode)
        const data = await response.json();
        if (data.success) {
          column.querySelector('.compare-translation-text').textContent = data.translation;
          column.querySelector('.compare-translation-text').classList.remove('shimmer');
        }
      } catch (error) {
        column.querySelector('.compare-translation-text').textContent = 'Error loading translation';
      }
    }
    
    elements.compareTranslationColumns.appendChild(column);
  }
}

// Command Palette
function toggleCommandPalette() {
  elements.commandPalette.classList.toggle('hidden');
  if (!elements.commandPalette.classList.contains('hidden')) {
    elements.commandInput.focus();
    elements.commandInput.value = '';
    elements.commandResults.innerHTML = '';
  }
}

function closeCommandPalette() {
  elements.commandPalette.classList.add('hidden');
}

function handleCommandSearch(e) {
  const query = e.target.value.toLowerCase();
  elements.commandResults.innerHTML = '';
  
  if (query.length < 2) return;

  // Islamic values group (local cache — renders instantly).
  const matchedValues = (state.valuesCache || []).filter(v =>
    v.nameAr.toLowerCase().includes(query) || v.nameEn.toLowerCase().includes(query)
  ).slice(0, 6);

  if (matchedValues.length > 0) {
    const header = document.createElement('div');
    header.className = 'command-group-title';
    header.textContent = state.currentLang === 'ar' ? 'القيم الإسلامية' : 'Islamic Values';
    elements.commandResults.appendChild(header);

    matchedValues.forEach(v => {
      const item = document.createElement('div');
      item.className = 'command-result-item command-result-value';
      item.style.setProperty('--value-accent', v.accent || '#D4AF6A');
      item.innerHTML = `
        <div class="command-result-icon">${valueIconSvg(v.iconKey)}</div>
        <div class="command-result-text">
          <div class="command-result-title">${escapeHtml(v.nameAr)} · ${escapeHtml(v.nameEn)}</div>
          <div class="command-result-subtitle">${escapeHtml(String(v.count))} ${escapeHtml(state.currentLang === 'ar' ? 'حديثًا' : 'hadiths')}</div>
        </div>
      `;
      item.tabIndex = 0;
      const go = () => { closeCommandPalette(); location.hash = `#/values/${v.id}`; };
      item.addEventListener('click', go);
      item.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') go(); });
      elements.commandResults.appendChild(item);
    });
  }
  
  // Search hadiths
  const results = state.searchResults.filter(h => 
    (h.text_normalized || '').toLowerCase().includes(query)
  ).slice(0, 5);

  if (results.length > 0) {
    const hadHeader = document.createElement('div');
    hadHeader.className = 'command-group-title';
    hadHeader.textContent = state.currentLang === 'ar' ? 'الأحاديث' : 'Hadiths';
    elements.commandResults.appendChild(hadHeader);
  }
  
  results.forEach(hadith => {
    const item = document.createElement('div');
    item.className = 'command-result-item';
    item.innerHTML = `
      <div class="command-result-icon">📖</div>
      <div class="command-result-text">
        <div class="command-result-title">${hadith.source} ${hadith.hadith_number}</div>
        <div class="command-result-subtitle">${hadith.text_normalized.substring(0, 50)}...</div>
      </div>
    `;
    item.addEventListener('click', () => {
      openHadithDetail(hadith);
      closeCommandPalette();
    });
    elements.commandResults.appendChild(item);
  });
}

// History & Bookmarks
function openHistoryDrawer() {
  elements.historyDrawer.classList.remove('hidden');
  renderHistoryList();
}

function closeHistoryDrawer() {
  elements.historyDrawer.classList.add('hidden');
}

function renderHistoryList() {
  elements.drawerList.innerHTML = '';
  
  const items = state.history.slice(0, 50);
  
  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'drawer-item';
    div.innerHTML = `
      <div class="drawer-item-arabic">${item.text.substring(0, 100)}...</div>
      <div class="drawer-item-meta">${item.source} ${item.hadith_number}</div>
    `;
    div.addEventListener('click', () => {
      openHadithDetail(item);
      closeHistoryDrawer();
    });
    elements.drawerList.appendChild(div);
  });
}

function addToHistory(hadith) {
  // Remove if already exists
  state.history = state.history.filter(h => h.id !== hadith.id);
  // Add to front
  state.history.unshift(hadith);
  // Keep only last 100
  state.history = state.history.slice(0, 100);
  
  localStorage.setItem('hadithHistory', JSON.stringify(state.history));
}

function bookmarkHadith() {
  if (!state.currentHadith) return;
  
  const index = state.bookmarks.findIndex(h => h.id === state.currentHadith.id);
  if (index > -1) {
    state.bookmarks.splice(index, 1);
    showToast(translations[state.currentLang].unbookmarked);
  } else {
    state.bookmarks.push(state.currentHadith);
    showToast(translations[state.currentLang].bookmarked);
  }
  
  localStorage.setItem('hadithBookmarks', JSON.stringify(state.bookmarks));
}

function exportHistory() {
  const data = JSON.stringify(state.history, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hadith-history.json';
  a.click();
  
  URL.revokeObjectURL(url);
}

function clearHistory() {
  state.history = [];
  localStorage.removeItem('hadithHistory');
  renderHistoryList();
  showToast('History cleared');
}

// Related Hadiths
async function loadRelatedHadiths() {
  if (!state.currentHadith) return;
  
  try {
    const { source, hadith_number } = state.currentHadith;
    const response = await fetch(`/api/hadith/${source}/${hadith_number}/related?limit=5`);
    const data = await response.json();
    
    if (data.success && data.related) {
      renderRelatedHadiths(data.related);
    }
  } catch (error) {
    console.error('Failed to load related hadiths:', error);
  }
}

function renderRelatedHadiths(related) {
  elements.relatedList.innerHTML = '';
  
  related.forEach(hadith => {
    const card = document.createElement('div');
    card.className = 'related-card';
    card.innerHTML = `
      <div class="related-source">${hadith.source} ${hadith.hadith_number}</div>
      <div class="related-text" dir="rtl">${hadith.text}</div>
    `;
    card.addEventListener('click', () => {
      openHadithDetail(hadith);
    });
    elements.relatedList.appendChild(card);
  });
}

// Open the full detail view for a hadith (used by results, suggestions,
// command palette, history drawer, value pages and related-hadith cards).
async function openHadithDetail(hadith) {
  if (!hadith) return;
  hideLiveDropdown();
  await showHadithDetail(hadith);
  addToHistory(hadith);
  loadRelatedHadiths();
}

// Share as Image
async function shareHadith() {
  if (!state.currentHadith) return;
  
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Canvas dimensions
    const width = 800;
    const height = 600;
    canvas.width = width;
    canvas.height = height;
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#070F1A');
    gradient.addColorStop(0.5, '#0E2233');
    gradient.addColorStop(1, '#070F1A');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Gold border
    ctx.strokeStyle = '#D4AF6A';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, width - 40, height - 40);
    
    // Inner gold border
    ctx.strokeStyle = '#D4AF6A';
    ctx.lineWidth = 1;
    ctx.strokeRect(30, 30, width - 60, height - 60);
    
    // Title
    ctx.fillStyle = '#D4AF6A';
    ctx.font = 'bold 24px Amiri, serif';
    ctx.textAlign = 'center';
    ctx.fillText('حديث شريف', width / 2, 70);
    
    // Source and number
    ctx.fillStyle = '#1FBF9A';
    ctx.font = '18px IBM Plex Sans Arabic, sans-serif';
    const sourceText = `${state.currentHadith.source.toUpperCase()} - ${state.currentHadith.hadith_number}`;
    ctx.fillText(sourceText, width / 2, 100);
    
    // Arabic text (wrapped)
    ctx.fillStyle = '#EAF2EE';
    ctx.font = '28px Amiri, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const arabicText = state.currentHadith.text_full;
    const maxWidth = width - 100;
    const lineHeight = 45;
    const lines = wrapText(ctx, arabicText, maxWidth);
    
    let y = 200;
    lines.forEach((line, index) => {
      if (index < 6) { // Max 6 lines
        ctx.fillText(line, width / 2, y);
        y += lineHeight;
      }
    });
    
    // Narrator
    ctx.fillStyle = '#8FA8A6';
    ctx.font = '16px IBM Plex Sans Arabic, sans-serif';
    ctx.fillText(`الراوي: ${state.currentHadith.narrator}`, width / 2, y + 30);
    
    // Footer
    ctx.fillStyle = '#D4AF6A';
    ctx.font = '12px IBM Plex Sans Arabic, sans-serif';
    ctx.fillText('© 2026 عبدالحميد العتيبي — جميع الحقوق محفوظة', width / 2, height - 40);
    
    // Convert to image
    const dataUrl = canvas.toDataURL('image/png');
    
    // Download
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `hadith-${state.currentHadith.source}-${state.currentHadith.hadith_number}.png`;
    a.click();
    
    showToast('Image saved');
  } catch (error) {
    console.error('Failed to generate image:', error);
    showToast('Failed to generate image');
  }
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];
  
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  
  lines.push(currentLine);
  return lines;
}

// ============================================
// Islamic Values — Frontend Core
// (appended block: state/elements/i18n merged via Object.assign)
// ============================================
Object.assign(state, {
  valuesCache: null,          // list of {id,nameAr,nameEn,descAr,iconKey,accent,count}
  valuesNote: '',             // reference note from /api/values
  valueOfDayData: null,       // {date, value}
  currentValueId: null,
  valuePage: 1,
  valueFilters: { book: '', narrator: '', text: '' },
  valueReturnContext: null,   // {kind:'value'|'gallery', id}
  valuesLoading: false
});

Object.assign(elements, {
  valueChipsScroller: document.getElementById('value-chips-scroller'),
  valueChips: document.getElementById('value-chips'),
  valueOfDay: document.getElementById('value-of-day'),
  valuesGallery: document.getElementById('values-gallery'),
  valuesGalleryBack: document.getElementById('values-gallery-back'),
  valuesGalleryNote: document.getElementById('values-gallery-note'),
  valuesGrid: document.getElementById('values-grid'),
  valuesError: document.getElementById('values-error'),
  valuesErrorMsg: document.getElementById('values-error-msg'),
  valuesRetry: document.getElementById('values-retry'),
  valuePage: document.getElementById('value-page'),
  valuePageBack: document.getElementById('value-page-back'),
  valuePageBackText: document.getElementById('value-page-back-text'),
  valueHeroIcon: document.getElementById('value-hero-icon'),
  valueHeroName: document.getElementById('value-hero-name'),
  valueHeroNameEn: document.getElementById('value-hero-name-en'),
  valueHeroDesc: document.getElementById('value-hero-desc'),
  valuePageNote: document.getElementById('value-page-note'),
  valueFeatured: document.getElementById('value-featured'),
  valueFilterBook: document.getElementById('value-filter-book'),
  valueFilterNarrator: document.getElementById('value-filter-narrator'),
  valueFilterText: document.getElementById('value-filter-text'),
  valueHadithsList: document.getElementById('value-hadiths-list'),
  valuePagination: document.getElementById('value-pagination'),
  valuePageError: document.getElementById('value-page-error'),
  valuePageErrorMsg: document.getElementById('value-page-error-msg'),
  valuePageRetry: document.getElementById('value-page-retry')
});

Object.assign(translations.ar, {
  viewValuePage: 'عرض صفحة القيمة',
  valuesTitle: 'القيم الإسلامية',
  valuesSectionNote: 'النص العربي للحديث هو المرجع، والترجمة آلية للتقريب',
  valueOfDayLabel: 'قيمة اليوم',
  showAllValues: 'عرض جميع القيم',
  hadithsCountWord: 'حديثًا',
  featuredHadith: 'الحديث المختار',
  openFullHadith: 'فتح الحديث الكامل',
  translationsWord: 'الترجمات',
  pageWord: 'صفحة',
  ofWord: 'من',
  nextWord: 'التالي',
  prevWord: 'السابق',
  loadingValues: 'جاري تحميل القيم…',
  exportJson: 'تصدير JSON',
  exportMarkdown: 'تصدير Markdown',
  exportPdf: 'تصدير PDF'
});
Object.assign(translations.en, {
  viewValuePage: 'View the value page',
  valuesTitle: 'Islamic Values',
  valuesSectionNote: 'The Arabic text is the reference; translation is an approximation',
  valueOfDayLabel: 'Value of the Day',
  showAllValues: 'Show all values',
  hadithsCountWord: 'hadiths',
  featuredHadith: 'Featured hadith',
  openFullHadith: 'Open full hadith',
  translationsWord: 'Translations',
  pageWord: 'Page',
  ofWord: 'of',
  nextWord: 'Next',
  prevWord: 'Previous',
  loadingValues: 'Loading values…',
  exportJson: 'Export JSON',
  exportMarkdown: 'Export Markdown',
  exportPdf: 'Export PDF'
});

// --- Elegant line icons (stroke only — no clipart, no emoji) ---
const VALUE_ICONS = {
  truth: '<path d="M3 17c3.5-9 14.5-9 18 0"/><path d="M12 4.5v2.5"/><path d="M5.5 7.5 7 9"/><path d="M18.5 7.5 17 9"/><path d="M4 21h16"/>',
  shield: '<path d="M12 3 5 6v5c0 4.8 3.2 8.4 7 10 3.8-1.6 7-5.2 7-10V6l-7-3Z"/><path d="M9.5 12.5l2 2 4-4.5"/>',
  heart: '<path d="M12 20.5S4 15.5 4 9.8A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 8 2.8c0 5.7-8 10.7-8 10.7Z"/>',
  anchor: '<circle cx="12" cy="5" r="2.2"/><path d="M12 7.2V21"/><path d="M5 12H3a9 9 0 0 0 18 0h-2"/><path d="M8.5 9.5h7"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/>',
  star: '<path d="m12 3 2.5 5.4 5.5.5-4.1 3.9 1 5.6-4.9-2.8-4.9 2.8 1-5.6L4 8.9l5.5-.5L12 3Z"/>',
  hands: '<path d="M5 10a7 7 0 0 1 14 0v5"/><path d="M8.5 19.5 5 10"/><path d="M15.5 19.5 19 10"/><path d="M9 19.5h6"/>',
  link: '<path d="M9.5 14.5 14.5 9.5"/><path d="M12.5 6.5 14 5a4 4 0 1 1 5.7 5.7l-1.5 1.5"/><path d="M11.5 17.5 10 19a4 4 0 1 1-5.7-5.7l1.5-1.5"/>',
  home: '<path d="m3 11 9-8 9 8"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
  scale: '<path d="M12 4v16"/><path d="M5 20h14"/><path d="M4 8h16"/><path d="m4 8-2.2 5a2.6 2.6 0 0 0 4.4 0L4 8Z"/><path d="m20 8-2.2 5a2.6 2.6 0 0 0 4.4 0L20 8Z"/>',
  leaf: '<path d="M5 19C4 11 9 5 19 5c0 10-6 14.5-14 14Z"/><path d="M12.5 11.5 6 18"/>',
  gift: '<rect x="4" y="11" width="16" height="10" rx="1"/><path d="M4 15h16"/><path d="M12 11v10"/><path d="M12 11c-4.5 0-5.5-4-2.8-4.6C11 6 12 8.2 12 11Zm0 0c4.5 0 5.5-4 2.8-4.6C13 6 12 8.2 12 11Z"/>',
  flame: '<path d="M12 3c1 3.8 5 5.6 5 9.5a5 5 0 0 1-10 0C7 8 10.5 6.5 12 3Z"/><path d="M12 20a2.6 2.6 0 0 0 2.6-2.6c0-1.8-1.6-2.4-2.6-4-1 1.6-2.6 2.2-2.6 4A2.6 2.6 0 0 0 12 20Z" opacity=".55"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M4.9 4.9 6.7 6.7M17.3 17.3l1.8 1.8M19.1 4.9 17.3 6.7M6.7 17.3 4.9 19.1"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>',
  dove: '<path d="M20 6c-1.5 5-5.5 8.5-11 8.5H4c1.5-4.5 5.5-7.5 11-7.5h5Z"/><path d="M14.5 7.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/><path d="M9 14.5 7 20"/><path d="M20 6h-4"/>',
  wave: '<path d="M2.5 9.5c3-3 5-3 7.5 0s4.5 3 7.5 0 2.5-2 4-2"/><path d="M2.5 15c3-3 5-3 7.5 0s4.5 3 7.5 0 2.5-2 4-2"/>',
  people: '<circle cx="8.5" cy="8" r="2.8"/><path d="M2.8 19.5c.5-3.4 2.8-5.3 5.7-5.3s5.2 1.9 5.7 5.3"/><circle cx="17" cy="9" r="2.3"/><path d="M15.8 14.5c2.9-.3 5 1.5 5.5 4.6"/>',
  chat: '<path d="M21 11.5a8 8 0 0 1-11.6 7.1L3 20.5l1.9-6.1A8 8 0 1 1 21 11.5Z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/>',
  bell: '<path d="M6 9.5a6 6 0 0 1 12 0c0 5 2 6.5 2 6.5H4s2-1.5 2-6.5Z"/><path d="M10 19.5a2.2 2.2 0 0 0 4 0"/>',
  knot: '<circle cx="6" cy="12" r="2.8"/><circle cx="12" cy="12" r="2.8"/><circle cx="18" cy="12" r="2.8"/>',
  book: '<path d="M2 4.5h6a3.5 3.5 0 0 1 3.5 3.5v12A2.5 2.5 0 0 0 9 17.5H2v-13Z"/><path d="M22 4.5h-6A3.5 3.5 0 0 0 12.5 8v12A2.5 2.5 0 0 1 15 17.5h7v-13Z"/>',
  mute: '<path d="M11 5 6.5 9H3v6h3.5L11 19V5Z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>',
  feather: '<path d="M20.5 3.5c-8 .5-13 4.8-13.5 11.2L5 20.5"/><path d="M11 8.5h6M8 13h6"/><path d="M3.5 20.5 8 16"/>',
  hearts: '<path d="M8.7 19.5S3 15.8 3 11.2A3.4 3.4 0 0 1 8.7 8.6a3.4 3.4 0 0 1 5.7 2.6c0 4.6-5.7 8.3-5.7 8.3Z" transform="translate(-1 -1.2) scale(.92)"/><path d="M14.8 20.8s-5-3.2-5-7.3a3.1 3.1 0 0 1 5-2.3 3.1 3.1 0 0 1 5 2.3c0 4.1-5 7.3-5 7.3Z" transform="translate(1.6 -.6) scale(.92)"/>',
  drop: '<path d="M12 3.2c3.4 4.3 6 7.3 6 10.3a6 6 0 0 1-12 0c0-3 2.6-6 6-10.3Z"/><path d="M9.2 14.8a2.9 2.9 0 0 0 2.8 2.8" opacity=".6"/>',
  gem: '<path d="M7 3.5h10l4 6.5L12 21 3 10l4-6.5Z"/><path d="m3 10.5 4.6-6.8M9.5 10.5l2.5 10 2.5-10 2.5.2M14.4 3.7 9.5 10.5m5 0H9.5"/>',
  care: '<path d="M3 13.5c2.5-3 6-3 9 0 3-3 6.5-3 9 0"/><path d="M12 20.5S6.5 16.8 6.5 13a2.9 2.9 0 0 1 5.5-1.3A2.9 2.9 0 0 1 17.5 13c0 3.8-5.5 7.5-5.5 7.5Z" transform="translate(0 -2.6) scale(.96)"/>'
};

function valueIconSvg(key) {
  const inner = VALUE_ICONS[key] || VALUE_ICONS.truth;
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}

// --- Data loading (cached; gallery renders from memory in <100ms) ---
async function loadValuesOnce({ force = false } = {}) {
  if (state.valuesCache && !force) return state.valuesCache;
  const t = translations[state.currentLang];
  try {
    const response = await fetch('/api/values');
    if (!response.ok) throw new Error(String(response.status));
    const data = await response.json();
    if (!data.success || !Array.isArray(data.values)) throw new Error('bad payload');
    state.valuesCache = data.values;
    state.valuesNote = data.note || t.valuesSectionNote;
    state.valueOfDayData = data.valueOfDay || null;
    renderValueChips();
    renderValueOfDay();
    if (elements.valuesError) elements.valuesError.classList.add('hidden');
    return state.valuesCache;
  } catch (error) {
    console.error('Failed to load values:', error);
    showValuesError();
    return null;
  }
}

function showValuesError() {
  const t = translations[state.currentLang];
  if (!elements.valuesError) return;
  elements.valuesErrorMsg.textContent = t.error || 'حدث خطأ';
  elements.valuesError.classList.remove('hidden');
}

function renderValueChips() {
  if (!elements.valueChips || !state.valuesCache) return;
  const t = translations[state.currentLang];
  elements.valueChips.innerHTML = '';
  state.valuesCache.slice(0, 12).forEach(v => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'value-chip';
    chip.style.setProperty('--value-accent', v.accent || '#D4AF6A');
    chip.innerHTML = `<span class="value-chip-icon">${valueIconSvg(v.iconKey)}</span>${escapeHtml(state.currentLang === 'ar' ? v.nameAr : v.nameEn)}`;
    chip.addEventListener('click', () => { location.hash = `#/values/${v.id}`; });
    elements.valueChips.appendChild(chip);
  });
  const all = document.createElement('button');
  all.type = 'button';
  all.className = 'value-chip value-chip-all';
  all.textContent = t.showAllValues || 'عرض جميع القيم';
  all.addEventListener('click', () => { location.hash = '#/values'; });
  elements.valueChips.appendChild(all);
}

async function renderValueOfDay() {
  if (!elements.valueOfDay || !state.valueOfDayData || !state.valueOfDayData.value) return;
  const t = translations[state.currentLang];
  const v = state.valueOfDayData.value;
  const host = elements.valueOfDay;
  host.classList.remove('hidden');
  host.style.setProperty('--value-accent', v.accent || '#D4AF6A');
  host.innerHTML = `
    <div class="value-of-day-inner">
      <div class="value-of-day-label"><span class="value-of-day-icon">${valueIconSvg(v.iconKey)}</span>${escapeHtml(t.valueOfDayLabel)}</div>
      <div class="value-of-day-name">${escapeHtml(v.nameAr)}</div>
      <div class="value-of-day-name-en">${escapeHtml(v.nameEn)}</div>
      <div class="value-of-day-hadith" id="value-of-day-hadith" dir="rtl"></div>
      <button type="button" class="value-of-day-cta">${escapeHtml(t.viewValuePage)}</button>
    </div>`;
  host.querySelector('.value-of-day-cta').addEventListener('click', () => { location.hash = `#/values/${v.id}`; });
  // One featured hadith preview (local dataset only).
  try {
    const res = await fetch(`/api/values/${v.id}?page=1&limit=1`);
    const data = await res.json();
    const box = host.querySelector('#value-of-day-hadith');
    if (data.success && data.hadiths && data.hadiths[0] && box) {
      const h = data.hadiths[0];
      box.textContent = truncate(h.textFull, 160);
      box.addEventListener('click', () => {
        state.valueReturnContext = { kind: 'value', id: v.id };
        openHadithDetail(valueItemToHadith(h));
      });
      box.classList.add('clickable');
    }
  } catch (_) { /* inline preview only — never blocks home */ }
}

// Map API camelCase hadith -> internal snake_case used by the detail view.
function valueItemToHadith(h) {
  return {
    id: h.id,
    source: h.source,
    hadith_number: h.hadithNumber,
    book_name: h.bookName,
    narrator: h.narrator,
    text_full: h.textFull,
    grade: h.grade,
    values: h.values || null
  };
}

// --- View visibility helpers ---
function hideValueViews() {
  if (elements.valuesGallery) elements.valuesGallery.classList.add('hidden');
  if (elements.valuePage) elements.valuePage.classList.add('hidden');
}

function showHome() {
  hideValueViews();
  elements.resultsSection.classList.add('hidden');
  elements.hadithDetail.classList.add('hidden');
  elements.heroSection.classList.remove('hidden');
  state.currentValueId = null;
}

// --- Values gallery ---
function openValuesGallery(instant = false) {
  const t = translations[state.currentLang];
  elements.heroSection.classList.add('hidden');
  elements.resultsSection.classList.add('hidden');
  elements.hadithDetail.classList.add('hidden');
  if (elements.valuePage) elements.valuePage.classList.add('hidden');
  elements.valuesGallery.classList.remove('hidden');
  elements.valuesGalleryNote.textContent = state.valuesNote || t.valuesSectionNote;
  state.currentValueId = null;

  const render = () => {
    const t2 = translations[state.currentLang];
    elements.valuesGrid.innerHTML = '';
    elements.valuesGrid.setAttribute('role', 'list');
    (state.valuesCache || []).forEach((v, i) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'value-card';
      card.setAttribute('role', 'listitem');
      card.style.setProperty('--value-accent', v.accent || '#D4AF6A');
      card.style.animationDelay = instant ? '0s' : `${Math.min(i * 0.045, 1.2)}s`;
      card.innerHTML = `
        <span class="value-card-glow" aria-hidden="true"></span>
        <span class="value-card-icon">${valueIconSvg(v.iconKey)}</span>
        <span class="value-card-name">${escapeHtml(v.nameAr)}</span>
        <span class="value-card-name-en">${escapeHtml(v.nameEn)}</span>
        <span class="value-card-count">${escapeHtml(String(v.count))} ${escapeHtml(t2.hadithsCountWord)}</span>
      `;
      const go = () => { location.hash = `#/values/${v.id}`; };
      card.addEventListener('click', go);
      elements.valuesGrid.appendChild(card);
    });
  };

  if (state.valuesCache) {
    render(); // instant: local cache, no network
  } else {
    elements.valuesGrid.innerHTML = `<p class="results-loading">${escapeHtml(t.loadingValues)}</p>`;
    loadValuesOnce().then(render);
  }
}

// --- Hash router: '' → home, '#/values' → gallery, '#/values/:id' → value page ---
function routeFromHash() {
  const hash = location.hash || '';
  const m = hash.match(/^#\/values\/([a-z0-9-]+)/i);
  if (m) {
    openValuePage(m[1]);
  } else if (hash === '#/values') {
    openValuesGallery();
  }
  // Other hashes (e.g. none) are the default home view — nothing to do.
}

// --- Value page ---
async function openValuePage(id, keepState = false) {
  const t = translations[state.currentLang];
  if (!id) return;
  elements.heroSection.classList.add('hidden');
  elements.resultsSection.classList.add('hidden');
  elements.hadithDetail.classList.add('hidden');
  elements.valuesGallery.classList.add('hidden');
  elements.valuePage.classList.remove('hidden');
  elements.valuePageError.classList.add('hidden');

  if (!keepState) {
    state.valuePage = 1;
    state.valueFilters = { book: '', narrator: '', text: '' };
    if (elements.valueFilterBook) elements.valueFilterBook.value = '';
    if (elements.valueFilterText) elements.valueFilterText.value = '';
  }
  state.currentValueId = id;

  const meta = (state.valuesCache || []).find(v => v.id === id) || null;
  if (meta) renderValueHero(meta);

  try {
    if (!state.valuesCache) await loadValuesOnce();
    const q = new URLSearchParams({
      page: String(state.valuePage),
      limit: '10',
      book: state.valueFilters.book || '',
      narrator: state.valueFilters.narrator || '',
      text: state.valueFilters.text || ''
    });
    const res = await fetch(`/api/values/${id}?${q.toString()}`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || t.error);

    if (!meta && data.value) renderValueHero(data.value);
    elements.valuePageNote.textContent = data.value.note || t.valuesSectionNote;
    populateNarratorOptions(data.filters && data.filters.narratorOptions || []);
    renderValueFeatured(data.hadiths && data.hadiths[0], data.value);
    renderValueHadiths(data.hadiths || [], data.value);
    renderValuePagination(data.pagination);
  } catch (error) {
    console.error('Value page error:', error);
    // Inline error with retry — never replaces the whole page.
    elements.valuePageErrorMsg.textContent = error.message || t.error;
    elements.valuePageError.classList.remove('hidden');
    if (!state.valuesCache || !meta) {
      elements.valueHeroName.textContent = t.error;
      elements.valueHeroIcon.innerHTML = '';
      elements.valueHeroDesc.textContent = '';
      elements.valueHeroNameEn.textContent = '';
    }
  }
}

function renderValueHero(v) {
  elements.valuePage.style.setProperty('--value-accent', v.accent || '#D4AF6A');
  elements.valueHeroIcon.innerHTML = valueIconSvg(v.iconKey);
  elements.valueHeroName.textContent = v.nameAr;
  elements.valueHeroNameEn.textContent = v.nameEn;
  elements.valueHeroDesc.textContent = v.descAr || '';
  elements.valuePageBackText.textContent = translations[state.currentLang].valuesTitle;
}

function populateNarratorOptions(narrators) {
  const sel = elements.valueFilterNarrator;
  if (!sel) return;
  const current = state.valueFilters.narrator || '';
  sel.innerHTML = '';
  const allOpt = document.createElement('option');
  allOpt.value = '';
  allOpt.textContent = state.currentLang === 'ar' ? 'الراوي: الكل' : 'Narrator: All';
  sel.appendChild(allOpt);
  (narrators || []).forEach(n => {
    const opt = document.createElement('option');
    opt.value = n;
    opt.textContent = n;
    sel.appendChild(opt);
  });
  sel.value = current;
}

// Featured hadith — large full-bleed presentation.
function renderValueFeatured(featured, valueMeta) {
  const host = elements.valueFeatured;
  host.innerHTML = '';
  if (!featured) return;
  const t = translations[state.currentLang];
  const card = document.createElement('article');
  card.className = 'value-featured-card';
  card.innerHTML = `
    <div class="value-featured-label">${escapeHtml(t.featuredHadith)}</div>
    <p class="value-featured-text" dir="rtl">${escapeHtml(featured.textFull)}</p>
    <div class="value-featured-meta">
      <span class="result-source">${escapeHtml(sourceLabel(featured.source))} · #${escapeHtml(String(featured.hadithNumber))}</span>
      <span class="authenticity-seal small">${escapeHtml(featured.grade || 'صحيح')}</span>
      <span class="result-narrator">${escapeHtml(t.narrator)} ${escapeHtml(featured.narrator || '')}</span>
    </div>
    <div class="value-featured-actions">
      <button type="button" class="value-featured-open">${escapeHtml(t.openFullHadith)}</button>
    </div>`;
  card.querySelector('.value-featured-open').addEventListener('click', () => {
    state.valueReturnContext = { kind: 'value', id: valueMeta.id };
    openHadithDetail(valueItemToHadith(featured));
  });
  host.appendChild(card);
}

// Hadith list — same result-card design + copy / share-as-image / bookmark.
function renderValueHadiths(hadiths, valueMeta) {
  const t = translations[state.currentLang];
  const host = elements.valueHadithsList;
  host.innerHTML = '';
  if (!hadiths.length) {
    host.innerHTML = `<p class="no-results">${escapeHtml(t.noResults)}</p>`;
    return;
  }
  hadiths.forEach((h, index) => {
    const card = document.createElement('div');
    card.className = 'result-card value-hadith-card';
    card.tabIndex = 0;
    card.style.animationDelay = `${index * 0.05}s`;
    card.innerHTML = `
      <div class="result-card-header">
        <span class="result-source">${escapeHtml(sourceLabel(h.source))} · #${escapeHtml(String(h.hadithNumber))}</span>
        <span class="authenticity-seal small">${escapeHtml(h.grade || 'صحيح')}</span>
      </div>
      <p class="result-arabic" dir="rtl">${escapeHtml(truncate(h.textFull, 260))}</p>
      <p class="result-narrator">${escapeHtml(t.narrator)} ${escapeHtml(h.narrator || '')}</p>
      <div class="value-card-actions">
        <button type="button" class="value-action-btn v-copy" aria-label="${escapeHtml(t.copied)}" title="${escapeHtml(t.copied)}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        </button>
        <button type="button" class="value-action-btn v-share" aria-label="Share as image" title="Share as image">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        </button>
        <button type="button" class="value-action-btn v-bookmark" aria-label="Bookmark" title="Bookmark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        </button>
        <button type="button" class="value-action-btn v-translate">${escapeHtml(t.translationsWord)}</button>
      </div>
      <div class="value-translations" hidden></div>`;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.value-card-actions')) return;
      state.valueReturnContext = { kind: 'value', id: valueMeta ? valueMeta.id : state.currentValueId };
      openHadithDetail(valueItemToHadith(h));
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.target.closest('.value-card-actions')) {
        state.valueReturnContext = { kind: 'value', id: valueMeta ? valueMeta.id : state.currentValueId };
        openHadithDetail(valueItemToHadith(h));
      }
    });

    card.querySelector('.v-copy').addEventListener('click', (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(`${h.textFull}\n\n${t.narrator} ${h.narrator || ''}\n${sourceLabel(h.source)} - ${h.hadithNumber}`)
        .then(() => showToast(t.copied));
    });
    card.querySelector('.v-share').addEventListener('click', (e) => {
      e.stopPropagation();
      shareHadithImage(valueItemToHadith(h), valueMeta ? valueMeta.nameAr : null);
    });
    card.querySelector('.v-bookmark').addEventListener('click', (e) => {
      e.stopPropagation();
      const key = `${h.source}-${h.hadithNumber}`;
      const marks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      const idx = marks.indexOf(key);
      if (idx > -1) { marks.splice(idx, 1); showToast(t.unbookmarked); }
      else { marks.push(key); showToast(t.bookmarked); }
      localStorage.setItem('bookmarks', JSON.stringify(marks));
    });
    card.querySelector('.v-translate').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleValueCardTranslations(card, h, valueMeta);
    });

    host.appendChild(card);
  });
}

function renderValuePagination(p) {
  const host = elements.valuePagination;
  host.innerHTML = '';
  if (!p || p.totalPages <= 1) return;
  const t = translations[state.currentLang];
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'value-page-btn';
  prev.textContent = t.prevWord;
  prev.disabled = p.page <= 1;
  const info = document.createElement('span');
  info.className = 'value-page-info';
  info.textContent = `${t.pageWord} ${p.page} ${t.ofWord} ${p.totalPages}`;
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'value-page-btn';
  next.textContent = t.nextWord;
  next.disabled = p.page >= p.totalPages;
  prev.addEventListener('click', () => gotoValuePage(p.page - 1));
  next.addEventListener('click', () => gotoValuePage(p.page + 1));
  host.append(prev, info, next);
}

function gotoValuePage(page) {
  state.valuePage = Math.max(1, page);
  openValuePage(state.currentValueId, true).then(() => {
    elements.valuePage.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

// --- Per-card translation streaming (scoped; reuses SSE endpoint) ---
const VALUE_TRANS_LANG_META = {
  en: { native: 'English', dir: 'ltr' },
  fr: { native: 'Français', dir: 'ltr' },
  ur: { native: 'اردو', dir: 'rtl' },
  id: { native: 'Bahasa Indonesia', dir: 'ltr' },
  tr: { native: 'Türkçe', dir: 'ltr' },
  fa: { native: 'فارسی', dir: 'rtl' }
};

function toggleValueCardTranslations(card, h, valueMeta) {
  const box = card.querySelector('.value-translations');
  if (!box) return;
  if (!box.hidden) {
    box.hidden = true;
    box.innerHTML = '';
    box._loaded = false;
    return;
  }
  box.hidden = false;
  if (box._loaded) return;
  box._loaded = true;
  // Pinned languages first (Hebrew can never be pinned — hard-excluded server-side).
  const prefs = (state.pinnedLanguages || []).filter(c => VALUE_TRANS_LANG_META[c]);
  const langs = prefs.length ? prefs : ['en', 'fr', 'ur'];
  langs.forEach(code => {
    const metaLang = VALUE_TRANS_LANG_META[code] || { native: code.toUpperCase(), dir: 'ltr' };
    const tc = document.createElement('div');
    tc.className = 'translation-card loading';
    tc.dataset.lang = code;
    tc.innerHTML = `
      <div class="translation-card-header">
        <div class="translation-language">
          <span class="translation-monogram">${escapeHtml(metaLang.native.charAt(0).toUpperCase())}</span>
          <span class="translation-name">${escapeHtml(metaLang.native)}</span>
        </div>
      </div>
      <p class="translation-text" dir="${metaLang.dir}">…</p>`;
    box.appendChild(tc);
  });
  const params = new URLSearchParams({
    source: h.source,
    number: String(h.hadithNumber),
    langs: langs.join(',')
  });
  let es;
  try { es = new EventSource(`/api/translate/stream?${params.toString()}`); } catch (_) { return; }
  es.onmessage = (event) => {
    let data = null;
    try { data = JSON.parse(event.data); } catch (_) { return; }
    if (data.type === 'translation' || data.type === 'error') {
      updateScopedTranslationCard(box, data);
    } else if (data.type === 'done') {
      es.close();
    }
  };
  es.onerror = () => { es.close(); };
}

function updateScopedTranslationCard(box, data) {
  const card = box.querySelector(`[data-lang="${data.lang}"]`);
  if (!card) return;
  card.classList.remove('loading');
  const textEl = card.querySelector('.translation-text');
  if (data.type === 'error') {
    card.classList.add('error');
    textEl.innerHTML = `<span class="translation-error">${escapeHtml(data.error || 'error')}</span>`;
    return;
  }
  textEl.textContent = data.translation;
  textEl.dir = data.direction || (isRTL(data.lang) ? 'rtl' : 'ltr');
}

// --- Value tags on hadith detail (cross-links) ---
async function attachHadithValues(hadith) {
  if (!hadith) return;
  const hid = hadith.id || `${hadith.source}:${hadith.hadith_number}`;
  hadith.id = hid;
  if (Array.isArray(hadith.values)) {
    hadith.valueTags = hadith.values;
    return;
  }
  if (hadith.valueTags) return;
  try {
    const res = await fetch(`/api/hadith/${hadith.source}/${hadith.hadith_number}/values`);
    const data = await res.json();
    hadith.valueTags = (data.success && Array.isArray(data.values)) ? data.values : [];
  } catch (_) {
    hadith.valueTags = [];
  }
}

function renderDetailValueTags(hadith) {
  const card = elements.hadithCard;
  if (!card) return;
  let box = document.getElementById('detail-value-tags');
  if (!box) {
    box = document.createElement('div');
    box.id = 'detail-value-tags';
    box.className = 'value-tags detail-value-tags';
    const narratorEl = card.querySelector('.hadith-narrator');
    if (narratorEl && narratorEl.nextSibling) card.querySelector('.hadith-card-inner').insertBefore(box, narratorEl.nextSibling);
    else card.querySelector('.hadith-card-inner').appendChild(box);
  }
  box.innerHTML = '';
  const tags = hadith.valueTags || [];
  tags.forEach(v => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'value-tag';
    btn.style.setProperty('--value-accent', v.accent || '#D4AF6A');
    btn.textContent = v.nameAr;
    btn.addEventListener('click', () => { location.hash = `#/values/${v.id}`; });
    box.appendChild(btn);
  });
  box.classList.toggle('hidden', tags.length === 0);
}

// --- Share as image (canvas; value name + fixed footer) ---
function shareHadithImage(hadith, valueName) {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = 800;
    const height = 600;
    canvas.width = width;
    canvas.height = height;

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#070F1A');
    gradient.addColorStop(0.5, '#0E2233');
    gradient.addColorStop(1, '#070F1A');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#D4AF6A';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, width - 40, height - 40);
    ctx.lineWidth = 1;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    ctx.fillStyle = '#D4AF6A';
    ctx.font = 'bold 24px Amiri, serif';
    ctx.textAlign = 'center';
    ctx.fillText('حديث شريف', width / 2, 66);

    ctx.fillStyle = '#1FBF9A';
    ctx.font = '17px IBM Plex Sans Arabic, sans-serif';
    ctx.fillText(`${sourceLabel(hadith.source)} - ${hadith.hadith_number}`, width / 2, 94);

    if (valueName) {
      ctx.fillStyle = '#D4AF6A';
      ctx.font = '16px Amiri, serif';
      ctx.fillText(`القيمة: ${valueName}`, width / 2, 120);
    }

    ctx.fillStyle = '#EAF2EE';
    ctx.font = '28px Amiri, serif';
    ctx.textBaseline = 'middle';
    const lines = wrapText(ctx, hadith.text_full || '', width - 100);
    let y = valueName ? 190 : 200;
    lines.slice(0, 6).forEach(line => {
      ctx.fillText(line, width / 2, y);
      y += 45;
    });

    ctx.fillStyle = '#8FA8A6';
    ctx.font = '16px IBM Plex Sans Arabic, sans-serif';
    ctx.fillText(`الراوي: ${hadith.narrator || ''}`, width / 2, y + 30);

    ctx.fillStyle = '#D4AF6A';
    ctx.font = '12px IBM Plex Sans Arabic, sans-serif';
    ctx.fillText('© 2026 عبدالحميد العتيبي — جميع الحقوق محفوظة', width / 2, height - 40);

    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `hadith-${hadith.source}-${hadith.hadith_number}.png`;
    a.click();
    showToast('Image saved');
  } catch (error) {
    console.error('Failed to generate image:', error);
    showToast('Failed to generate image');
  }
}

// Detail-view share: includes the value name when opened from a value page.
function shareHadith() {
  if (!state.currentHadith) return;
  const valueName = (state.valueReturnContext && state.valueReturnContext.kind === 'value')
    ? ((state.valuesCache || []).find(v => v.id === state.valueReturnContext.id) || {}).nameAr
    : ((state.currentHadith.valueTags || [])[0] || {}).nameAr || null;
  shareHadithImage(state.currentHadith, valueName);
}

// --- Exports (JSON / Markdown / PDF) — include value name + fixed footer ---
const EXPORT_FOOTER = '© 2026 عبدالحميد العتيبي — جميع الحقوق محفوظة';

function currentExportValueName() {
  const tags = (state.currentHadith && state.currentHadith.valueTags) || [];
  if (tags.length) return tags.map(v => v.nameAr).join('، ');
  if (state.currentValueId) {
    const v = (state.valuesCache || []).find(x => x.id === state.currentValueId);
    if (v) return v.nameAr;
  }
  return null;
}

function exportHadithAs(format) {
  const h = state.currentHadith;
  if (!h) return;
  const valueName = currentExportValueName();
  const text = h.text_full || h.text || '';
  const metaLine = `${sourceLabel(h.source)} - ${h.hadith_number}`;
  const blobFor = (content, type) => new Blob([content], { type });

  if (format === 'json') {
    const payload = JSON.stringify({
      hadith: {
        source: h.source, hadithNumber: h.hadith_number, book: h.book_name || '',
        narrator: h.narrator || '', arabicText: text, grade: h.grade || 'صحيح',
        value: valueName || undefined
      },
      note: translations[state.currentLang].valuesSectionNote,
      footer: EXPORT_FOOTER
    }, null, 2);
    downloadBlob(blobFor(payload, 'application/json'), `hadith-${h.source}-${h.hadith_number}.json`);
  } else if (format === 'markdown') {
    const md = `# حديث شريف\n\n**${metaLine}**${valueName ? `\n**القيمة:** ${valueName}` : ''}\n\n---\n\n${text}\n\n**الراوي:** ${h.narrator || ''}\n\n> النص العربي للحديث هو المرجع، والترجمة آلية للتقريب\n\n---\n\n${EXPORT_FOOTER}\n`;
    downloadBlob(blobFor(md, 'text/markdown'), `hadith-${h.source}-${h.hadith_number}.md`);
  } else if (format === 'pdf') {
    const w = window.open('', '_blank');
    if (!w) { showToast('Popup blocked'); return; }
    w.document.write(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>حديث شريف</title>` +
      `<style>body{font-family:'Amiri','IBM Plex Sans Arabic',serif;background:#fff;color:#12212e;max-width:720px;margin:40px auto;padding:0 24px}` +
      `h1{color:#a68a4f}.meta{color:#0f7a5f;font-size:15px}.value{color:#a68a4f;font-size:15px}p.text{font-size:24px;line-height:2}` +
      `footer{margin-top:48px;border-top:1px solid #d9c9a3;padding-top:12px;color:#a68a4f;font-size:12px;text-align:center}</style></head><body>` +
      `<h1>حديث شريف</h1><div class="meta">${escapeHtml(metaLine)}</div>` +
      (valueName ? `<div class="value">القيمة: ${escapeHtml(valueName)}</div>` : '') +
      `<p class="text">${escapeHtml(text)}</p><div>الراوي: ${escapeHtml(h.narrator || '')}</div>` +
      `<div>النص العربي للحديث هو المرجع، والترجمة آلية للتقريب</div>` +
      `<footer>${EXPORT_FOOTER}</footer><script>window.onload=()=>window.print()<\/script></body></html>`);
    w.document.close();
  }
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

// --- Values wiring (runs after the main init) ---
function initValuesFeature() {
  const t = () => translations[state.currentLang];

  if (elements.valuesRetry) {
    elements.valuesRetry.addEventListener('click', () => {
      elements.valuesError.classList.add('hidden');
      loadValuesOnce({ force: true }).then(() => {
        if (!elements.valuesGallery.classList.contains('hidden')) openValuesGallery(true);
      });
    });
  }
  if (elements.valuePageRetry) {
    elements.valuePageRetry.addEventListener('click', () => {
      elements.valuePageError.classList.add('hidden');
      openValuePage(state.currentValueId, true);
    });
  }
  if (elements.valuesGalleryBack) elements.valuesGalleryBack.addEventListener('click', () => { location.hash = ''; showHome(); });
  if (elements.valuePageBack) elements.valuePageBack.addEventListener('click', () => { location.hash = '#/values'; });

  // Filters: book / narrator refetch immediately; text is debounced.
  if (elements.valueFilterBook) {
    elements.valueFilterBook.addEventListener('change', () => {
      state.valueFilters.book = elements.valueFilterBook.value;
      state.valuePage = 1;
      openValuePage(state.currentValueId, true);
    });
  }
  if (elements.valueFilterNarrator) {
    elements.valueFilterNarrator.addEventListener('change', () => {
      state.valueFilters.narrator = elements.valueFilterNarrator.value;
      state.valuePage = 1;
      openValuePage(state.currentValueId, true);
    });
  }
  if (elements.valueFilterText) {
    elements.valueFilterText.addEventListener('input', debounce(() => {
      state.valueFilters.text = elements.valueFilterText.value;
      state.valuePage = 1;
      openValuePage(state.currentValueId, true);
    }, 300));
  }

  // Export buttons in the hadith action bar.
  const actionsBar = document.querySelector('.hadith-actions');
  if (actionsBar && !document.getElementById('export-menu-btn')) {
    const menu = document.createElement('div');
    menu.className = 'export-menu';
    menu.innerHTML = `
      <button id="export-menu-btn" type="button" class="action-button" aria-label="Export" title="Export">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      </button>
      <div class="export-menu-list hidden" role="menu">
        <button type="button" data-format="json">${escapeHtml(t().exportJson)}</button>
        <button type="button" data-format="markdown">${escapeHtml(t().exportMarkdown)}</button>
        <button type="button" data-format="pdf">${escapeHtml(t().exportPdf)}</button>
      </div>`;
    actionsBar.appendChild(menu);
    const list = menu.querySelector('.export-menu-list');
    menu.querySelector('#export-menu-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      list.classList.toggle('hidden');
    });
    list.querySelectorAll('button').forEach(b => {
      b.addEventListener('click', () => {
        list.classList.add('hidden');
        exportHadithAs(b.dataset.format);
      });
    });
    document.addEventListener('click', () => list.classList.add('hidden'));
  }

  // Routing + home widgets.
  window.addEventListener('hashchange', routeFromHash);
  loadValuesOnce().then(() => {
    if (location.hash) routeFromHash();
  });
}

document.addEventListener('DOMContentLoaded', initValuesFeature);
