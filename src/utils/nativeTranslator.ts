/**
 * ═══════════════════════════════════════════════════════════════════════
 *  BINGO Telescope — Native Translation Engine (Hardcoded)
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  Replaces Google Translate on FIXED pages (index, about, science,
 *  instrumentation, uirapuru, abdus, outreach, location) with
 *  manually curated, context-aware translations.
 *
 *  Every visible text element on these pages carries a `data-t` attribute
 *  whose value maps to an entry in `translations/pages.ts`.
 *
 *  CMS-driven pages (news, team, publications) continue to use the
 *  Google Translate pipeline defined in translator.ts.
 * ═══════════════════════════════════════════════════════════════════════
 */

import { translateUIElements, initTranslator } from './translator';

const STORAGE_KEY = 'bingo-lang';

/**
 * Retrieves the currently stored language preference from localStorage.
 * Defaults to 'en' if no preference is found or if localStorage is unavailable.
 *
 * @returns {string} The active language code ('pt', 'en', or 'zh-CN').
 */
export function getStoredLang(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ['pt', 'en', 'zh-CN'].includes(stored)) {
      return stored;
    }
  } catch { /* localStorage unavailable */ }
  return 'en';
}

/**
 * Initializes native translation for a specific, fixed page.
 * Dynamically imports the translation definitions for the given page to keep
 * the initial javascript bundle size optimal. Replaces DOM elements containing
 * `data-t` attributes with their localized counterparts.
 *
 * @param {string} pageId - The identifier for the current page (e.g., 'location', 'about').
 * @returns {Promise<void>} A promise that resolves when the page translation completes.
 */
export async function initNativeTranslator(pageId: string): Promise<void> {
  const lang = getStoredLang();

  // Set html lang attribute for accessibility and browser behavior
  const langAttr = lang === 'zh-CN' ? 'zh' : lang;
  document.documentElement.lang = langAttr;

  // Translate structural UI elements (header, footer, hero)
  // These use data-i18n and are handled by the existing i18n.ts system
  translateUIElements(lang);

  // If the selected language is Portuguese, the original content is displayed.
  // We simply reveal the body content immediately.
  if (lang === 'pt') {
    revealBody();
    return;
  }

  // Map internal lang codes to their translation keys
  const langKey = lang === 'zh-CN' ? 'zh' : lang;

  try {
    // Dynamic import of page-specific translations to minimize payload
    const { pageTranslations } = await import('./translations/pages');
    const pageTrans = pageTranslations[pageId];
    if (!pageTrans) {
      revealBody();
      return;
    }

    // Process and translate all elements tagged with data-t
    document.querySelectorAll('[data-t]').forEach((el) => {
      const key = (el as HTMLElement).dataset.t;
      if (!key) return;

      const entry = pageTrans[key];
      if (!entry) return;

      const translation = entry[langKey as 'en' | 'zh'];
      if (!translation) return;

      // Use innerHTML to inject rich text formatting seamlessly
      (el as HTMLElement).innerHTML = translation;
      
      // Mark element to bypass Google Translate processing
      el.classList.add('notranslate');
      el.setAttribute('translate', 'no');
    });

    // Sub-pages with mixed content (e.g., native layout + dynamic news feed) 
    // will trigger the Google Translate engine strictly for untranslated elements.
    if (document.querySelector('[data-dynamic-translate]')) {
      initTranslator();
      return; // Anti-FOUC script will reveal body when GTE finishes its job
    }
  } catch (err) {
    console.warn('[BINGO i18n] Failed to load native translations:', err);
  }

  revealBody();
}

/**
 * Removes the anti-FOUC (Flash of Unstyled Content) opacity:0 style safely.
 * Since native translation happens locally, the transition is near-instant,
 * bypassing the usual Google Translate delay footprint.
 */
function revealBody(): void {
  const style = document.getElementById('anti-fouc-style');
  if (style) {
    document.body.style.transition = 'opacity 0.3s ease-in';
    document.body.style.opacity = '1';
    setTimeout(() => {
      style.remove();
      document.body.style.transition = '';
    }, 400);
  }
}
