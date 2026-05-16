/**
 * ═══════════════════════════════════════════════════════════════════════
 *  BINGO Telescope — Translation Engine (Google Translate Integration)
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  Uses Google Translate Element (free, no API key) to translate the
 *  entire page including dynamic CMS content. The default Google widget
 *  is hidden and controlled programmatically via the custom language
 *  switcher in the header.
 *
 *  Scientific terms (BINGO, BAO, FRB, Stage 0-V, etc.) are protected
 *  from translation by wrapping them in <span class="notranslate">.
 *
 *  Language preference is persisted in localStorage + googtrans cookie.
 * ═══════════════════════════════════════════════════════════════════════
 */

export type Lang = 'pt' | 'en' | 'zh-CN';

const STORAGE_KEY = 'bingo-lang';

/** Map our internal lang codes to Google Translate codes */
const LANG_MAP: Record<string, string> = {
  pt: 'pt',
  en: 'en',
  'zh-CN': 'zh-CN',
  zh: 'zh-CN',
};

/**
 * Scientific terms and proper nouns that must NEVER be translated.
 * These will be wrapped in <span class="notranslate"> before
 * Google Translate processes the page.
 */
const PROTECTED_TERMS = [
  // Project names (order matters: longer first)
  'BINGO-ABDUS', 'BINGO-Uirapuru', 'BINGO',
  // Scientific acronyms
  'BAO', 'FRB', 'FRBs', 'ΛCDM', 'ABDUS',
  // Stage names
  'Stage 0', 'Stage I', 'Stage II', 'Stage III', 'Stage IV', 'Stage V',
  // Technical terms that should stay in English/original
  'Intensity Mapping', 'Crossed-Dragone',
  'Fast Radio Bursts', 'Fast Radio Burst',
  // Instruments & projects
  'FAST', 'Tianlai', 'LOFAR', 'SKARABs2', 'OSKAR', 'HFSS',
  'Planck', 'LSST', 'Rubin', 'ASTRON',
  // Technical acronyms
  'RFI', 'HI', 'CMB', 'DM', 'LNA', 'FPGA', 'GPU', 'FFT',
  'PCB', 'FWHM', 'PSF', 'BIS', 'PAF', 'PAFs',
  // Scientific notation preserved
  'w₀', 'wₐ', 'H₀', 'Tsys',
  // Paper references
  'Paper I', 'Paper II', 'Paper III', 'Paper IV', 'Paper V',
  'Paper VI', 'Paper VII', 'Paper VIII', 'Paper IX', 'Paper X',
  // Names that should not be translated
  'Abdus Salam', 'Elcio Abdalla', 'Carlos Alexandre Wuensche',
  'Duncan Lorimer', 'David Narkevic', 'Lorimer Burst',
  'Sheldon Glashow', 'Steven Weinberg',
  // Portuguese proper nouns to keep
  'Uirapuru', 'Serra do Urubu', 'Aguiar',
  // Institutions
  'USP', 'INPE', 'UFCG', 'Fapesq', 'MCTI', 'Fapesp', 'Finep',
  'Secties', 'Seap', 'ICTP',
];

/** Tags whose children should be skipped during term protection */
const SKIP_TAGS: Record<string, boolean> = {
  SCRIPT: true, STYLE: true, NOSCRIPT: true, TEXTAREA: true,
  CODE: true, PRE: true, SVG: true, IFRAME: true, INPUT: true,
};

/**
 * Build a regex that matches any protected term (longest first).
 * Uses word boundaries where possible.
 */
function buildProtectionRegex(): RegExp {
  const sorted = [...PROTECTED_TERMS].sort((a, b) => b.length - a.length);
  const escaped = sorted.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  // Join with | and use non-capturing group
  return new RegExp(`(${escaped.join('|')})`, 'g');
}

/**
 * Walk the DOM and wrap all occurrences of protected terms in
 * <span class="notranslate"> so Google Translate skips them.
 * This runs BEFORE Google Translate initializes.
 */
export function protectScientificTerms(): void {
  const regex = buildProtectionRegex();

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node: Text): number {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (SKIP_TAGS[parent.tagName]) return NodeFilter.FILTER_REJECT;
        if (parent.classList?.contains('notranslate')) return NodeFilter.FILTER_REJECT;
        if (parent.closest('[data-no-translate], .notranslate')) return NodeFilter.FILTER_REJECT;
        const text = node.textContent || '';
        if (!text.trim()) return NodeFilter.FILTER_REJECT;
        // Only accept if it contains at least one protected term
        regex.lastIndex = 0;
        if (regex.test(text)) return NodeFilter.FILTER_ACCEPT;
        return NodeFilter.FILTER_REJECT;
      },
    }
  );

  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

  for (const textNode of textNodes) {
    const text = textNode.textContent || '';
    regex.lastIndex = 0;

    // Split text by protected terms
    const parts = text.split(regex);
    if (parts.length <= 1) continue;

    const frag = document.createDocumentFragment();
    for (const part of parts) {
      regex.lastIndex = 0;
      if (regex.test(part)) {
        // This part is a protected term — wrap in notranslate span
        const span = document.createElement('span');
        span.className = 'notranslate';
        span.translate = false;
        span.textContent = part;
        frag.appendChild(span);
      } else if (part) {
        frag.appendChild(document.createTextNode(part));
      }
    }
    textNode.parentNode?.replaceChild(frag, textNode);
  }
}

/**
 * Get the stored language preference.
 */
export function getStoredLang(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ['pt', 'en', 'zh-CN'].includes(stored)) {
      return stored;
    }
  } catch { /* localStorage unavailable */ }
  return 'pt';
}

/**
 * Store the language preference.
 */
export function setStoredLang(lang: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch { /* localStorage unavailable */ }
}

/**
 * Set the googtrans cookie that Google Translate reads.
 */
function setGoogTransCookie(targetLang: string): void {
  if (targetLang === 'pt') {
    // Clear cookie to show original content
    document.cookie = 'googtrans=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    document.cookie = `googtrans=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=.${location.hostname}`;
  } else {
    const val = `/pt/${LANG_MAP[targetLang] || targetLang}`;
    document.cookie = `googtrans=${val};path=/;`;
    document.cookie = `googtrans=${val};path=/;domain=.${location.hostname}`;
  }
}

/**
 * Trigger Google Translate to switch language by manipulating
 * the hidden select element that GTE creates.
 */
function triggerGoogleTranslate(targetLang: string): void {
  const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
  if (combo) {
    combo.value = LANG_MAP[targetLang] || targetLang;
    combo.dispatchEvent(new Event('change'));
  }
}

/**
 * Switch language: save preference, set cookie, trigger translation.
 */
export function switchLanguage(lang: string): void {
  const current = getStoredLang();
  if (lang === current) return;

  setStoredLang(lang);
  setGoogTransCookie(lang);

  if (lang === 'pt') {
    // Restore to Portuguese: clear translation and reload
    // Google Translate doesn't have a clean "restore" API, reload is cleanest
    window.location.reload();
  } else {
    // Try to trigger directly first
    const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (combo) {
      triggerGoogleTranslate(lang);
    } else {
      // Google Translate not loaded yet, reload to let it init with cookie
      window.location.reload();
    }
  }
}

/**
 * Initialize the translation system.
 * Called from BaseLayout on DOMContentLoaded.
 *
 * 1. Protects scientific terms from translation
 * 2. Sets the googtrans cookie before GTE loads
 * 3. Loads the Google Translate Element script
 */
export function initTranslator(): void {
  const lang = getStoredLang();

  // 1. Protect scientific terms BEFORE Google Translate loads
  protectScientificTerms();

  // 2. Set cookie so GTE auto-translates on load
  if (lang !== 'pt') {
    setGoogTransCookie(lang);
  }

  // 3. Set html lang attribute
  document.documentElement.lang = lang === 'zh-CN' ? 'zh' : lang;

  // 4. Create hidden container for Google Translate widget
  let container = document.getElementById('google_translate_element');
  if (!container) {
    container = document.createElement('div');
    container.id = 'google_translate_element';
    container.style.display = 'none';
    document.body.appendChild(container);
  }

  // 5. Define the callback and load GTE script
  (window as any).googleTranslateElementInit = function () {
    new (window as any).google.translate.TranslateElement(
      {
        pageLanguage: 'pt',
        includedLanguages: 'en,pt,zh-CN',
        autoDisplay: false,
        layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
      },
      'google_translate_element'
    );
  };

  // Load the script (only once)
  if (!document.getElementById('google-translate-script')) {
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.head.appendChild(script);
  }
}
