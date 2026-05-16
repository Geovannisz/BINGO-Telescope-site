/**
 * ═══════════════════════════════════════════════════════════════════════
 *  BINGO Telescope — Client-Side Translator Engine
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  This script runs on every page after DOMContentLoaded to translate
 *  visible text content from Portuguese into the user's chosen language.
 *
 *  Design decisions:
 *    - Uses a curated phrase dictionary (not machine translation) to
 *      ensure scientific accuracy and preserve untranslatable terms.
 *    - Walks the DOM tree and replaces matching text nodes.
 *    - Terms like BINGO, BAO, FRB, Stage 0-V, ABDUS, Uirapuru,
 *      Intensity Mapping, Crossed-Dragone, etc. are never translated.
 *    - Falls back to longest-match-first to handle overlapping phrases.
 *    - Persists user language choice in localStorage.
 *    - Translates <title> and meta description for better UX.
 *
 *  This file is imported as an inline <script> in BaseLayout.astro.
 * ═══════════════════════════════════════════════════════════════════════
 */

import enDict from './translations/en';
import zhDict from './translations/zh';

type Lang = 'pt' | 'en' | 'zh';

const STORAGE_KEY = 'bingo-lang';
const DICTIONARIES: Record<string, Record<string, string>> = { en: enDict, zh: zhDict };

/** Tags whose text content should never be translated */
const SKIP_TAGS: Record<string, boolean> = {
  SCRIPT: true, STYLE: true, NOSCRIPT: true, TEXTAREA: true,
  CODE: true, PRE: true, SVG: true, IFRAME: true, INPUT: true,
};

/** Patterns that should never be translated (scientific terms, proper nouns) */
const PRESERVE_PATTERNS = [
  /^BINGO(?:-ABDUS|-Uirapuru)?$/,
  /^BAO$/,
  /^FRB(?:s)?$/,
  /^Stage\s+[0IV]+$/,
  /^(?:Intensity Mapping|Crossed-Dragone|SKARABs2|FAST|Tianlai|LOFAR)$/i,
  /^(?:HFSS|OSKAR|PCB|LNA|FPGA|GPU|FFT|RFI|HI|CMB|DM)$/,
  /^(?:Planck|Hubble|Vela|LSST|Rubin)$/,
  /^Paper\s+[IVXL]+$/,
  /^(?:arXiv|DOI|ORCID|LinkedIn|ResearchGate|Lattes)$/i,
  /^\d[\d.,\s°×%~≤≥±]*\s*(?:m|MHz|GHz|Hz|km|K|deg|arcmin|Mpc)?$/,
  /^https?:\/\//,
  /^[a-zA-Z0-9._%+-]+@/,
];

function shouldPreserve(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length < 2) return true;
  // Pure numbers/symbols
  if (/^[\d\s.,;:!?°×%~≤≥±()\[\]{}–—·•→←↑↓⚡🔧🗺️🖥️🔬🎓🐦🏆📄💡]+$/.test(trimmed)) return true;
  return PRESERVE_PATTERNS.some(p => p.test(trimmed));
}

/**
 * Build a sorted list of phrases from dictionary, longest first.
 * This ensures "Oscilações Acústicas de Bárions" matches before "Bárions".
 */
function buildSortedPhrases(dict: Record<string, string>): [string, string][] {
  return Object.entries(dict).sort((a, b) => b[0].length - a[0].length);
}

/**
 * Replace all occurrences of dictionary phrases within a text string.
 */
function translateText(text: string, sortedPhrases: [string, string][]): string {
  let result = text;
  for (const [pt, translated] of sortedPhrases) {
    if (result.includes(pt)) {
      result = result.split(pt).join(translated);
    }
  }
  return result;
}

/**
 * Walk the DOM tree and translate all visible text nodes.
 */
function translateDOM(dict: Record<string, string>): void {
  const sortedPhrases = buildSortedPhrases(dict);

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node: Text): number {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (SKIP_TAGS[parent.tagName]) return NodeFilter.FILTER_REJECT;
        // Skip language switcher itself
        if (parent.closest('#lang-switcher-menu, [data-no-translate]')) return NodeFilter.FILTER_REJECT;
        const text = node.textContent || '';
        if (!text.trim()) return NodeFilter.FILTER_REJECT;
        if (shouldPreserve(text)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

  for (const node of textNodes) {
    const original = node.textContent || '';
    const translated = translateText(original, sortedPhrases);
    if (translated !== original) {
      node.textContent = translated;
    }
  }

  // Translate <title>
  const title = document.querySelector('title');
  if (title) {
    title.textContent = translateText(title.textContent || '', sortedPhrases);
  }

  // Translate meta description
  const metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
  if (metaDesc?.content) {
    metaDesc.content = translateText(metaDesc.content, sortedPhrases);
  }

  // Translate alt attributes on images
  document.querySelectorAll('img[alt]').forEach((img) => {
    const el = img as HTMLImageElement;
    if (el.alt) {
      el.alt = translateText(el.alt, sortedPhrases);
    }
  });

  // Translate placeholder and title attributes
  document.querySelectorAll('[title]').forEach((el) => {
    const htmlEl = el as HTMLElement;
    if (htmlEl.title && !htmlEl.closest('#lang-switcher-menu, [data-no-translate]')) {
      htmlEl.title = translateText(htmlEl.title, sortedPhrases);
    }
  });
}

/**
 * Set the lang attribute on <html> to reflect the active language.
 */
function setDocumentLang(lang: Lang): void {
  document.documentElement.lang = lang;
}

/**
 * Get the stored language preference, or default to 'pt'.
 */
export function getStoredLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored && (stored === 'pt' || stored === 'en' || stored === 'zh')) {
      return stored;
    }
  } catch { /* localStorage unavailable */ }
  return 'pt';
}

/**
 * Store the language preference.
 */
export function setStoredLang(lang: Lang): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch { /* localStorage unavailable */ }
}

/**
 * Apply translation to the current page.
 * Always reloads to ensure clean translation from the PT source.
 * The initTranslator() will apply the correct language on next load.
 */
export function applyTranslation(lang: Lang): void {
  setStoredLang(lang);
  window.location.reload();
}

/**
 * Initialize the translator on page load.
 * Called from BaseLayout's inline script.
 */
export function initTranslator(): void {
  const lang = getStoredLang();
  setDocumentLang(lang);

  if (lang !== 'pt') {
    const dict = DICTIONARIES[lang];
    if (dict) {
      translateDOM(dict);
    }
  }
}
