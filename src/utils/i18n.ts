export const languages = {
  pt: 'Português',
  en: 'English',
  zh: '中文',
};

export const defaultLang = 'pt';

export const ui = {
  pt: {
    'nav.home': 'Início',
    'nav.about': 'Sobre',
    'nav.science': 'Ciência',
    'nav.instrumentation': 'Instrumentação',
    'nav.team': 'Equipe',
    'nav.news': 'Notícias',
    'nav.publications': 'Publicações',
    'nav.subprojects': 'Subprojetos',
    'nav.uirapuru': 'BINGO-Uirapuru',
    'nav.abdus': 'BINGO-ABDUS',
    'nav.outreach': 'Divulgação',
    'nav.location': 'Localização',
    'hero.title': 'Explorando o Universo Oculto',
    'hero.subtitle': 'O Telescópio BINGO: Mapeando Oscilações Acústicas de Bárions e desvendando a Energia Escura através do mapeamento de intensidade do hidrogênio neutro.',
    'hero.cta1': 'Conheça a Ciência',
    'hero.cta2': 'Últimas Notícias',
    'hero.badge': 'Aguiar, Paraíba — Brasil',
  },
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.science': 'Science',
    'nav.instrumentation': 'Instrumentation',
    'nav.team': 'Team',
    'nav.news': 'News',
    'nav.publications': 'Publications',
    'nav.subprojects': 'Subprojects',
    'nav.uirapuru': 'BINGO-Uirapuru',
    'nav.abdus': 'BINGO-ABDUS',
    'nav.outreach': 'Outreach',
    'nav.location': 'Location',
    'hero.title': 'Exploring the Hidden Universe',
    'hero.subtitle': 'The BINGO Telescope: Mapping Baryon Acoustic Oscillations and unveiling Dark Energy through neutral hydrogen intensity mapping.',
    'hero.cta1': 'Discover the Science',
    'hero.cta2': 'Latest News',
    'hero.badge': 'Aguiar, Paraíba — Brazil',
  },
  zh: {
    'nav.home': '首页',
    'nav.about': '关于',
    'nav.science': '科学',
    'nav.instrumentation': '仪器',
    'nav.team': '团队',
    'nav.news': '新闻',
    'nav.publications': '出版物',
    'nav.subprojects': '子项目',
    'nav.uirapuru': 'BINGO-Uirapuru',
    'nav.abdus': 'BINGO-ABDUS',
    'nav.outreach': '科普',
    'nav.location': '位置',
    'hero.title': '探索隐藏的宇宙',
    'hero.subtitle': 'BINGO望远镜：通过中性氢强度映射绘制重子声波振荡并揭示暗能量。',
    'hero.cta1': '了解科学',
    'hero.cta2': '最新新闻',
    'hero.badge': 'Aguiar, Paraíba — 巴西',
  }
} as const;

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof typeof ui[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  }
}
