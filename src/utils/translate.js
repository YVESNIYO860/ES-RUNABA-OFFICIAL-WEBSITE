/** Google Translate — only runs when the user picks a language (cookie + reload) */

const STORAGE_KEY = 'es_runaba_lang';

export function getSavedLanguage() {
  return localStorage.getItem(STORAGE_KEY) || 'en';
}

export function clearTranslateCookies() {
  const expires = 'Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = `googtrans=;expires=${expires};path=/`;
  document.cookie = `googtrans=;expires=${expires};path=/;domain=${window.location.hostname}`;
}

export function setTranslateCookies(langCode) {
  clearTranslateCookies();
  if (langCode === 'en') return;
  const value = `/en/${langCode}`;
  document.cookie = `googtrans=${value};path=/`;
  document.cookie = `googtrans=${value};path=/;domain=${window.location.hostname}`;
}

/** Load hidden Google widget (required for cookie-based full-page translate) */
export function ensureTranslateScript() {
  if (document.getElementById('google-translate-script')) return Promise.resolve();

  return new Promise((resolve) => {
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,fr,rw,sw',
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
      resolve();
    };
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src =
      'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.onload = () => setTimeout(resolve, 300);
    document.body.appendChild(script);
  });
}

/**
 * Apply language: English restores original page; others translate the full page.
 * Always reloads so translation is never partial/hover-based.
 */
export async function applySiteLanguage(langCode) {
  localStorage.setItem(STORAGE_KEY, langCode);

  if (langCode === 'en') {
    clearTranslateCookies();
    window.location.reload();
    return;
  }

  setTranslateCookies(langCode);
  await ensureTranslateScript();
  window.location.reload();
}

/** On app start: keep site in English unless user previously chose another language */
export function initTranslateState() {
  const saved = getSavedLanguage();
  const cookie = document.cookie.match(/googtrans=([^;]+)/)?.[1];

  if (saved === 'en') {
    if (cookie && cookie !== '/en/en') {
      clearTranslateCookies();
    }
    return;
  }

  if (!cookie || cookie === '/en/en') {
    setTranslateCookies(saved);
  }

  // Ensure script is loaded so translation applies
  ensureTranslateScript();
}

/** Fix corrupted school name from old translations or typos */
export function normalizeSchoolName(name) {
  if (!name || typeof name !== 'string') return 'ES RUNABA';
  const trimmed = name.trim();
  if (/IT'?S\s*RUNABA/i.test(trimmed) || /^ITS\s*RUNABA/i.test(trimmed)) {
    return 'ES RUNABA';
  }
  return trimmed;
}
