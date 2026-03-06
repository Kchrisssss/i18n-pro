/**
 * i18n-pro Runtime Tool
 * Supports static JSON and Supabase modes.
 */
let currentLang = localStorage.getItem('app-lang') || 'en';
let translations = {};
let config = {
  mode: 'static', // 'static' or 'supabase'
  localesDir: '/locales',
  supabaseConfig: null // { url, anonKey, table: 'translations' }
};

/**
 * Initialize the i18n system
 * @param {Object} options - { mode, localesDir, supabaseConfig }
 */
export async function initI18n(options = {}) {
  Object.assign(config, options);
  await loadLanguage(currentLang);
  document.documentElement.lang = currentLang;
  
  // Observe DOM for dynamic content
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) translateElement(node);
        if (node.querySelectorAll) {
          node.querySelectorAll('[data-i18n]').forEach(translateElement);
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Load a specific language
 * @param {string} lang - 'en', 'fr', 'de', etc.
 */
export async function loadLanguage(lang) {
  try {
    if (config.mode === 'supabase') {
      const { data, error } = await config.supabaseConfig.client
        .from(config.supabaseConfig.table || 'translations')
        .select('key, value')
        .eq('lang', lang);
      
      if (error) throw error;
      translations = data.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
    } else {
      const res = await fetch(`${config.localesDir}/${lang}.json`);
      if (!res.ok) throw new Error(`Could not load ${lang}.json`);
      translations = await res.json();
    }
    
    currentLang = lang;
    localStorage.setItem('app-lang', lang);
    document.documentElement.lang = lang;
    applyTranslations();
  } catch (err) {
    console.error('i18n-pro Error:', err);
  }
}

/**
 * Translate all elements with [data-i18n]
 */
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(translateElement);
}

/**
 * Translate a single element
 */
function translateElement(el) {
  const key = el.dataset.i18n;
  if (!key || !translations[key]) return;
  
  // Handle different translation targets
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
    if (el.placeholder) el.placeholder = translations[key];
  } else {
    el.innerHTML = translations[key];
  }
}

/**
 * Global translation helper for JS strings
 */
export function t(key, fallback = '') {
  return translations[key] || fallback || key;
}

export function getCurrentLang() {
  return currentLang;
}
