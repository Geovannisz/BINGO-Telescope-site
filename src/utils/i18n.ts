/**
 * ═══════════════════════════════════════════════════════════════════════
 *  BINGO Telescope — Internationalization (i18n) System
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  Architecture:
 *    1. Static UI strings (nav, hero, footer labels) are translated at
 *       build-time via `useTranslations()` — used in Astro components.
 *    2. All page body content is translated client-side via a DOM walker
 *       that replaces Portuguese text nodes with pre-built translations.
 *    3. The client-side translator preserves technical terms that must
 *       NOT be translated (BINGO, BAO, FRB, Stage names, etc.).
 *    4. Language preference is persisted in localStorage.
 *
 *  Supported languages:
 *    pt — Português (source/default)
 *    en — English
 *    zh — 简体中文 (Simplified Chinese, chosen because BINGO's Chinese
 *         partners are mainland institutions: FAST, Tianlai, etc.)
 *
 *  Adding a new language:
 *    1. Add a new key to `languages` and `ui`
 *    2. Add a new dictionary to `src/utils/translations/xx.ts`
 *    3. Register it in `src/utils/translator.ts`
 * ═══════════════════════════════════════════════════════════════════════
 */

export type Lang = 'pt' | 'en' | 'zh';

export const languages: Record<Lang, string> = {
  pt: 'Português',
  en: 'English',
  zh: '简体中文',
};

/** ISO flag codes for visual selectors */
export const langFlags: Record<Lang, string> = {
  pt: '🇧🇷',
  en: '🇬🇧',
  zh: '🇨🇳',
};

export const defaultLang: Lang = 'pt';

/**
 * Static UI strings used by Astro components at build time.
 * These cover navigation, hero, footer, and other structural elements.
 */
export const ui = {
  pt: {
    'nav.home': 'Início',
    'nav.about': 'Sobre',
    'nav.science': 'Ciência',
    'nav.instrumentation': 'Instrumentação',
    'nav.team': 'Equipe',
    'nav.news': 'Notícias',
    'nav.publications': 'Publicações',
    'nav.extensions': 'Extensões',
    'nav.uirapuru': 'BINGO-Uirapuru',
    'nav.abdus': 'BINGO-ABDUS',
    'nav.outreach': 'Divulgação',
    'nav.location': 'Localização',
    'hero.title': 'Explorando o Universo Oculto',
    'hero.subtitle': 'O Telescópio BINGO: Mapeando Oscilações Acústicas de Bárions e desvendando a Energia Escura através do mapeamento de intensidade do hidrogênio neutro.',
    'hero.cta1': 'Conheça a Ciência',
    'hero.cta2': 'Últimas Notícias',
    'hero.badge': 'Aguiar, Paraíba — Brasil',
    'footer.partners': 'Financiadores e Parceiros',
    'footer.project': 'O Projeto',
    'footer.extensions': 'Extensões',
    'footer.contact': 'Contato',
    'footer.about': 'Sobre',
    'footer.science': 'Ciência',
    'footer.instrumentation': 'Instrumentação',
    'footer.location': 'Localização',
    'footer.team': 'Equipe',
    'footer.outreach': 'Divulgação Científica',
    'footer.news': 'Notícias',
    'footer.publications': 'Publicações',
    'footer.rights': 'Todos os direitos reservados.',
    'footer.successor': 'Sucessor de',
    'footer.description': 'Baryon Acoustic Oscillations from Integrated Neutral Gas Observations. Mapeando o universo em rádio para entender a energia escura.',
    'lang.label': 'Idioma',
    'lang.switchTo': 'Mudar idioma',
  },
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.science': 'Science',
    'nav.instrumentation': 'Instrumentation',
    'nav.team': 'Team',
    'nav.news': 'News',
    'nav.publications': 'Publications',
    'nav.extensions': 'Extensions',
    'nav.uirapuru': 'BINGO-Uirapuru',
    'nav.abdus': 'BINGO-ABDUS',
    'nav.outreach': 'Outreach',
    'nav.location': 'Location',
    'hero.title': 'Exploring the Hidden Universe',
    'hero.subtitle': 'The BINGO Telescope: Mapping Baryon Acoustic Oscillations and unveiling Dark Energy through neutral hydrogen intensity mapping.',
    'hero.cta1': 'Discover the Science',
    'hero.cta2': 'Latest News',
    'hero.badge': 'Aguiar, Paraíba — Brazil',
    'footer.partners': 'Funders and Partners',
    'footer.project': 'The Project',
    'footer.extensions': 'Extensions',
    'footer.contact': 'Contact',
    'footer.about': 'About',
    'footer.science': 'Science',
    'footer.instrumentation': 'Instrumentation',
    'footer.location': 'Location',
    'footer.team': 'Team',
    'footer.outreach': 'Scientific Outreach',
    'footer.news': 'News',
    'footer.publications': 'Publications',
    'footer.rights': 'All rights reserved.',
    'footer.successor': 'Successor to',
    'footer.description': 'Baryon Acoustic Oscillations from Integrated Neutral Gas Observations. Mapping the universe in radio to understand dark energy.',
    'lang.label': 'Language',
    'lang.switchTo': 'Switch language',
  },
  zh: {
    'nav.home': '首页',
    'nav.about': '关于',
    'nav.science': '科学',
    'nav.instrumentation': '仪器',
    'nav.team': '团队',
    'nav.news': '新闻',
    'nav.publications': '出版物',
    'nav.extensions': '扩展项目',
    'nav.uirapuru': 'BINGO-Uirapuru',
    'nav.abdus': 'BINGO-ABDUS',
    'nav.outreach': '科普',
    'nav.location': '位置',
    'hero.title': '探索隐藏的宇宙',
    'hero.subtitle': 'BINGO望远镜：通过中性氢强度映射绘制重子声学振荡图谱，揭示暗能量的本质。',
    'hero.cta1': '了解科学',
    'hero.cta2': '最新新闻',
    'hero.badge': 'Aguiar, Paraíba — 巴西',
    'footer.partners': '资助机构与合作伙伴',
    'footer.project': '项目概览',
    'footer.extensions': '扩展项目',
    'footer.contact': '联系方式',
    'footer.about': '关于',
    'footer.science': '科学',
    'footer.instrumentation': '仪器',
    'footer.location': '位置',
    'footer.team': '团队',
    'footer.outreach': '科学传播',
    'footer.news': '新闻',
    'footer.publications': '出版物',
    'footer.rights': '版权所有。',
    'footer.successor': '继承自',
    'footer.description': 'Baryon Acoustic Oscillations from Integrated Neutral Gas Observations — 通过射电波段绘制宇宙地图以理解暗能量。',
    'lang.label': '语言',
    'lang.switchTo': '切换语言',
  },
} as const;

export type UiKey = keyof (typeof ui)[typeof defaultLang];

/**
 * Build-time translation helper for Astro components.
 * Usage: `const t = useTranslations(lang); t('nav.home')`
 */
export function useTranslations(lang: Lang) {
  return function t(key: UiKey): string {
    return (ui[lang] as Record<string, string>)[key] || (ui[defaultLang] as Record<string, string>)[key] || key;
  };
}
