import { initTranslator, switchLanguage, getStoredLang } from './translator';
import { initNativeTranslator } from './nativeTranslator';

/**
 * Initializes all global UI behavior and interactivity:
 * - Native vs Google Translator initialization
 * - Scroll-triggered animations via IntersectionObserver
 * - Language Switcher UI & dropdown events
 * - 3D Tilt & Magnetic Glow on interactive cards
 */
export function initUIEffects() {
  // Detect whether this page uses native (hardcoded) translation
  const nativeMeta = document.querySelector('meta[name="bingo-native-i18n"]');

  if (nativeMeta) {
    // ── NATIVE TRANSLATION (fixed pages) ──
    const pageId = nativeMeta.getAttribute('content') || '';
    initNativeTranslator(pageId);
  } else {
    // ── GOOGLE TRANSLATE (CMS pages: news, team, publications) ──
    initTranslator();
  }

  // 2. Scroll-triggered animations via IntersectionObserver
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.animate-on-scroll').forEach((el) => {
    observer.observe(el);
  });

  // 3. Language Switcher Logic
  const currentLang = getStoredLang();
  const langLabels: Record<string, string> = { pt: 'PT', en: 'EN', 'zh-CN': 'ZH' };
  const langFlags: Record<string, string> = { pt: '🇧🇷', en: '🇬🇧', 'zh-CN': '🇨🇳' };

  // Desktop switcher
  const langBtn = document.getElementById('lang-switcher-btn');
  const langMenu = document.getElementById('lang-switcher-menu');
  const langLabel = document.getElementById('lang-switcher-label');
  const langFlag = document.getElementById('lang-switcher-flag');
  const langChevron = document.getElementById('lang-chevron');

  // Blink logic for first access on home page
  const isHomePage = nativeMeta && nativeMeta.getAttribute('content') === 'index';
  if (isHomePage && !localStorage.getItem('bingo-lang-hint')) {
    if (langBtn) {
      langBtn.style.transition = 'all 0.8s ease';
      let blinks = 0;
      const blinkInterval = setInterval(() => {
        if (blinks % 2 === 0) {
          langBtn.style.boxShadow = '0 0 15px rgba(34, 211, 238, 0.4)';
          langBtn.style.borderColor = 'rgba(34, 211, 238, 0.6)';
        } else {
          langBtn.style.boxShadow = 'none';
          langBtn.style.borderColor = '';
        }
        blinks++;
        if (blinks > 5) {
          // 3 full pulses
          clearInterval(blinkInterval);
          langBtn.style.boxShadow = '';
          langBtn.style.borderColor = '';
          localStorage.setItem('bingo-lang-hint', 'true');
        }
      }, 800);
    }
  }

  if (langLabel) langLabel.textContent = langLabels[currentLang] || 'PT';
  if (langFlag) langFlag.textContent = langFlags[currentLang] || '🇧🇷';

  // Mark current language as active
  document.querySelectorAll('.lang-option').forEach((btn) => {
    const lang = (btn as HTMLElement).dataset.lang;
    const check = btn.querySelector('.lang-check') as HTMLElement;
    if (lang === currentLang) {
      btn.classList.add('text-cyan-400');
      if (check) check.style.opacity = '1';
    }
  });

  // Mobile switcher: mark active
  document.querySelectorAll('.mobile-lang-btn').forEach((btn) => {
    const lang = (btn as HTMLElement).dataset.lang;
    if (lang === currentLang) {
      btn.classList.add('bg-cyan-500/15', 'text-cyan-400', 'border-cyan-500/30');
    } else {
      btn.classList.add('bg-white/5', 'text-slate-400', 'border-slate-700/30');
    }
  });

  // Desktop dropdown toggle
  if (langBtn && langMenu && langChevron) {
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !langMenu.classList.contains('invisible');
      if (isOpen) {
        langMenu.classList.add('opacity-0', 'invisible', '-translate-y-2');
        langMenu.classList.remove('opacity-100', 'visible', 'translate-y-0');
        langChevron.style.transform = '';
        langBtn.setAttribute('aria-expanded', 'false');
      } else {
        langMenu.classList.remove('opacity-0', 'invisible', '-translate-y-2');
        langMenu.classList.add('opacity-100', 'visible', 'translate-y-0');
        langChevron.style.transform = 'rotate(180deg)';
        langBtn.setAttribute('aria-expanded', 'true');
      }
    });

    document.addEventListener('click', () => {
      langMenu.classList.add('opacity-0', 'invisible', '-translate-y-2');
      langMenu.classList.remove('opacity-100', 'visible', 'translate-y-0');
      if (langChevron) langChevron.style.transform = '';
      langBtn.setAttribute('aria-expanded', 'false');
    });

    // Close dropdown on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const isOpen = !langMenu.classList.contains('invisible');
        if (isOpen) {
          langMenu.classList.add('opacity-0', 'invisible', '-translate-y-2');
          langMenu.classList.remove('opacity-100', 'visible', 'translate-y-0');
          if (langChevron) langChevron.style.transform = '';
          langBtn.setAttribute('aria-expanded', 'false');
          langBtn.focus();
        }
      }
    });
  }

  // Handle language option clicks — native pages reload to apply translations
  const isNativePage = !!nativeMeta;
  document.querySelectorAll('.lang-option').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = (btn as HTMLElement).dataset.lang;
      if (lang && lang !== currentLang) {
        if (isNativePage) {
          // For native pages: save lang and reload (no Google Translate)
          localStorage.setItem('bingo-lang', lang);
          window.location.reload();
        } else {
          switchLanguage(lang);
        }
      }
    });
  });

  // Handle mobile language button clicks
  document.querySelectorAll('.mobile-lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = (btn as HTMLElement).dataset.lang;
      if (lang && lang !== currentLang) {
        if (isNativePage) {
          localStorage.setItem('bingo-lang', lang);
          window.location.reload();
        } else {
          switchLanguage(lang);
        }
      }
    });
  });

  // 4. Tilt 3D & Magnetic Glow
  document
    .querySelectorAll(
      '.glass-card, .glass-card-glow, .subproject-card, .info-card, .news-card, .team-card'
    )
    .forEach((el) => {
      const card = el as HTMLElement;
      card.addEventListener('mousemove', (ev) => {
        const e = ev as MouseEvent;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Set coordinates for radial gradient glow
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        // Calculate 3D tilt (max 4 degrees)
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -4;
        const rotateY = ((x - centerX) / centerX) * 4;

        card.style.setProperty('--rotate-x', `${rotateX}deg`);
        card.style.setProperty('--rotate-y', `${rotateY}deg`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--rotate-x', '0deg');
        card.style.setProperty('--rotate-y', '0deg');
      });
    });
}
