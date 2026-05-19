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
const SUBPROJECTS = [
  'BINGO: Esperança no Espaço',
  'Esperança no Espaço',
  'BINGO-ABDUS',
  'BINGO-Uirapuru'
];

const BRAND_TERMS = [
  'BINGO'
];

const HERO_TERMS = [
  'Science', 'News', 'Mirrors', 'Horns', 'Redshift', 'Dark Energy', 'Baryon Acoustic Oscillations'
];

const PROTECTED_TERMS = [
  ...SUBPROJECTS,
  ...BRAND_TERMS,
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
  'Uirapuru', 'Serra do Urubu', 'Aguiar, Paraíba — Brasil', 'Aguiar, Paraíba', 'Aguiar', 'Paraíba', 'Brasil',
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
 * Traverses the DOM to isolate and shield scientific terminology from Google Translate.
 * It strictly wraps occurrences of terms defined in `PROTECTED_TERMS` within 
 * `<span class="notranslate">` elements.
 * 
 * Crucially, it replaces standard spaces with non-breaking spaces (`\u00A0`) inside
 * the protected spans. This tricks Google Translate's neural engine into treating 
 * multi-word scientific names (like "Baryon Acoustic Oscillations") as single, 
 * indivisible tokens, preventing severe sentence fragmentation or hallucinated 
 * grammatical re-orderings across the DOM boundary.
 * 
 * This function must run **before** the Google Translate element initializes.
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
        if (parent.closest('[data-no-translate], .notranslate, [translate="no"]')) return NodeFilter.FILTER_REJECT;
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
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      regex.lastIndex = 0;
      if (regex.test(part)) {
        const span = document.createElement('span');
        const isSubproject = SUBPROJECTS.includes(part);

        if (isSubproject || HERO_TERMS.includes(part)) {
          span.className = 'notranslate';
          span.translate = false;
          
          // Replace internal spaces with non-breaking spaces (\u00A0).
          // This tricks Google Translate's neural engine into treating the entire block
          // as a single continuous noun token, preventing it from severing the
          // surrounding sentence grammar into hallucinated disconnected clauses.
          const tokenizedPart = part.replace(/ /g, '\u00A0');
          
          let prefixSpace = '';
          if (parts[i - 1].length > 0) {
            if (/\s$/.test(parts[i - 1])) prefixSpace = ' ';
          } else {
            // Term is at the very beginning of the text node.
            // Check adjacent DOM nodes if isolated in an element (like <strong>)
            const prev = textNode.previousSibling || textNode.parentElement?.previousSibling;
            if (prev && prev.nodeType === Node.TEXT_NODE && /\s$/.test(prev.textContent || '')) {
              prefixSpace = ' ';
            }
          }

          let suffixSpace = '';
          if (parts[i + 1].length > 0) {
            if (/^\s/.test(parts[i + 1])) suffixSpace = ' ';
          } else {
            // Term is at the very end of the text node.
            // Check adjacent DOM nodes if isolated in an element (like <strong>)
            const next = textNode.nextSibling || textNode.parentElement?.nextSibling;
            if (next && next.nodeType === Node.TEXT_NODE && /^\s/.test(next.textContent || '')) {
              suffixSpace = ' ';
            }
          }
          
          if (isSubproject) {
            // Apply font-bingo to the word BINGO inside the untranslated block
            const innerHTML = tokenizedPart.replace(/BINGO/g, '<span class="font-bingo">BINGO</span>');
            span.innerHTML = prefixSpace + innerHTML + suffixSpace;
          } else {
            span.textContent = prefixSpace + tokenizedPart + suffixSpace;
          }
        } else if (BRAND_TERMS.includes(part)) {
          // Normal BINGO terms (without notranslate)
          span.className = 'font-bingo';
          span.textContent = part;
        } else {
          // Normal scientific terms (without notranslate)
          span.className = 'scientific-term';
          span.textContent = part;
        }
        
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
  return 'en';
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
  } else {
    const val = `/pt/${LANG_MAP[targetLang] || targetLang}`;
    document.cookie = `googtrans=${val};path=/;`;
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
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.head.appendChild(script);
  }

  // 6. Apply correct translations to [data-i18n] elements
  //    (header/footer are marked translate="no", so we handle them ourselves)
  // 6. Apply correct translations to [data-i18n] elements
  //    (header/footer/hero are marked translate="no", so we handle them ourselves)
  translateUIElements(lang);
}

/**
 * Translate structural UI elements (header, footer) that are marked
 * with translate="no" and have data-i18n attributes.
 * Uses the curated i18n.ts dictionary instead of Google Translate
 * to avoid literal mistranslations (e.g. "Sobre" → "On" vs "About").
 */
export function translateUIElements(lang: string): void {
  // Import the UI translations inline to avoid circular deps
  // Map our lang codes to i18n.ts codes
  const i18nLang = lang === 'zh-CN' ? 'zh' : lang;

  // Fetch the UI dictionary dynamically
  import('../utils/i18n').then(({ ui }) => {
    const dict = (ui as Record<string, Record<string, string>>)[i18nLang];
    if (!dict) return;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = (el as HTMLElement).dataset.i18n;
      if (!key || !dict[key]) return;

      const htmlEl = el as HTMLElement;

      // For elements with children (like buttons with icons, or copyright with spans),
      // we need to update only the text content, not destroy child elements
      if (key === 'footer.copyright') {
        // Special: copyright has a year + BINGO span, just set the full text
        const year = new Date().getFullYear();
        // Find the existing BINGO span if any
        const bingoSpan = htmlEl.querySelector('.font-bingo');
        if (bingoSpan) {
          // Rebuild: © YEAR <span>BINGO</span> Telescope Consortium. Rights text.
          const copyrightText = dict[key].replace('© BINGO', `© ${year} BINGO`).replace('BINGO', '');
          const parts = copyrightText.split('©');
          if (parts.length > 1) {
            htmlEl.innerHTML = `© ${year} <span class="font-bingo notranslate">BINGO</span> ${dict[key].replace(/© BINGO /, '').replace('©', '')}`;
          }
        }
        return;
      }

      // For the extensions button with a chevron SVG, update only the first text node
      if (key === 'nav.extensions' && htmlEl.tagName === 'BUTTON') {
        const textNode = Array.from(htmlEl.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
        if (textNode) {
          textNode.textContent = dict[key] + ' ';
        }
        return;
      }

      // Standard case: text replacement, but we need to preserve the font-bingo span
      // if the translated text contains BINGO.
      const text = dict[key];
      if (text.includes('BINGO')) {
        // Basic replacement preserving BINGO styling and preventing Google Translate from touching it
        htmlEl.innerHTML = text.replace(/BINGO(-ABDUS|-Uirapuru)?/g, match => `<span class="font-bingo notranslate">${match}</span>`);
      } else {
        htmlEl.textContent = text;
      }
    });
  });
}
