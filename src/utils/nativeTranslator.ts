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

import { translateUIElements } from './translator';

const STORAGE_KEY = 'bingo-lang';

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
 * Initialize native translation for a fixed page.
 * Dynamically imports the translations for the given page to keep
 * the initial bundle small.
 */
export async function initNativeTranslator(pageId: string): Promise<void> {
  const lang = getStoredLang();

  // Set html lang attribute
  const langAttr = lang === 'zh-CN' ? 'zh' : lang;
  document.documentElement.lang = langAttr;

  // Translate structural UI elements (header, footer, hero)
  // These use data-i18n and are handled by the existing i18n.ts system
  translateUIElements(lang);

  // If Portuguese, content is already correct — nothing else to do
  if (lang === 'pt') {
    revealBody();
    return;
  }

  // Map lang codes to translation keys
  const langKey = lang === 'zh-CN' ? 'zh' : lang;

  try {
    // Dynamic import to avoid loading all translations on every page
    const { pageTranslations } = await import('./translations/pages');
    const pageTrans = pageTranslations[pageId];
    if (!pageTrans) {
      revealBody();
      return;
    }

    // Replace all data-t elements
    document.querySelectorAll('[data-t]').forEach((el) => {
      const key = (el as HTMLElement).dataset.t;
      if (!key) return;

      const entry = pageTrans[key];
      if (!entry) return;

      const translation = entry[langKey as 'en' | 'zh'];
      if (!translation) return;

      // Use innerHTML to support rich content (bold, links, etc.)
      (el as HTMLElement).innerHTML = translation;
      
      // Protect this element from Google Translate
      el.classList.add('notranslate');
      el.setAttribute('translate', 'no');
    });

    // Check if the page needs Google Translate for dynamic parts (e.g. News cards)
    if (document.querySelector('[data-dynamic-translate]')) {
      const { initTranslator } = await import('./translator');
      initTranslator();
      return; // Anti-FOUC script will reveal body when GTE finishes
    }
  } catch (err) {
    console.warn('[BINGO i18n] Failed to load native translations:', err);
  }

  revealBody();
}

/**
 * Remove the anti-FOUC opacity:0 style if present.
 * For native translation this is instant (no Google Translate delay).
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
