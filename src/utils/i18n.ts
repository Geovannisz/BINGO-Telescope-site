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
    'hero.title': 'Desvendando o Universo Escuro',
    'hero.title.line1': 'Desvendando o',
    'hero.title.line2': 'Universo Escuro',
    'hero.subtitle': 'O Telescópio BINGO: Mapeando Oscilações Acústicas de Bárions e desvendando a Energia Escura através do mapeamento de intensidade do hidrogênio neutro.',
    'hero.cta1': 'Conheça a Ciência',
    'hero.cta2': 'Últimas Notícias',
    'hero.badge': 'Aguiar, Paraíba — Brasil',
    'hero.stat.mirrors': 'Espelhos',
    'hero.stat.horns': 'Cornetas',
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
    'footer.copyright': '© BINGO Telescope Consortium. Todos os direitos reservados.',
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
    'hero.title': 'Unveil the Dark Universe',
    'hero.title.line1': 'Unveil the',
    'hero.title.line2': 'Dark Universe',
    'hero.subtitle': 'The BINGO Telescope: Mapping Baryon Acoustic Oscillations and Unraveling Dark Energy through Neutral Hydrogen Intensity Mapping.',
    'hero.cta1': 'Discover the Science',
    'hero.cta2': 'Latest News',
    'hero.badge': 'Aguiar, Paraíba — Brasil',
    'hero.stat.mirrors': 'Mirrors',
    'hero.stat.horns': 'Horns',
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
    'footer.copyright': '© BINGO Telescope Consortium. All rights reserved.',
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
    'hero.title': '揭开暗宇宙的面纱',
    'hero.title.line1': '揭开',
    'hero.title.line2': '暗宇宙的面纱',
    'hero.subtitle': 'BINGO望远镜：通过中性氢强度映射绘制重子声学振荡图谱，揭示暗能量的本质。',
    'hero.cta1': '了解科学',
    'hero.cta2': '最新新闻',
    'hero.badge': 'Aguiar, Paraíba — Brasil',
    'hero.stat.mirrors': '反射镜',
    'hero.stat.horns': '馈源',
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
    'footer.copyright': '© BINGO 望远镜联盟。版权所有。',
    'lang.label': '语言',
    'lang.switchTo': '切换语言',
  },
} as const;

export const roleTranslations = {
  pt: {
    // Singular roles
    'role.Coordenador Geral': 'Coordenador Geral',
    'role.Pesquisador Sênior': 'Pesquisador Sênior',
    'role.Professor Associado': 'Professor Associado',
    'role.Pós-doc': 'Pós-doc',
    'role.Doutorando': 'Doutorando',
    'role.Mestrando': 'Mestrando',
    'role.Iniciação Científica': 'Iniciação Científica',
    'role.Engenheiro': 'Engenheiro',
    'role.Colaborador Externo': 'Colaborador Externo',
    // Plural labels
    'label.Coordenador Geral': 'Coordenação Geral',
    'label.Pesquisador Sênior': 'Pesquisadores Seniores',
    'label.Professor Associado': 'Professores Associados',
    'label.Pós-doc': 'Pós-Doutorandos',
    'label.Doutorando': 'Doutorandos',
    'label.Mestrando': 'Mestrandos',
    'label.Iniciação Científica': 'Iniciação Científica',
    'label.Engenheiro': 'Engenheiros',
    'label.Colaborador Externo': 'Colaboradores Externos',
    // Descriptions
    'desc.Coordenador Geral': 'Liderança e direção estratégica do projeto BINGO',
    'desc.Pesquisador Sênior': 'Pesquisadores com doutorado que lideram linhas de pesquisa',
    'desc.Professor Associado': 'Professores associados de universidades e institutos de pesquisa parceiros',
    'desc.Pós-doc': 'Pesquisadores em estágio pós-doutoral',
    'desc.Doutorando': 'Estudantes desenvolvendo teses de doutorado',
    'desc.Mestrando': 'Estudantes desenvolvendo dissertações de mestrado',
    'desc.Iniciação Científica': 'Estudantes de graduação em projetos de IC',
    'desc.Engenheiro': 'Profissionais de engenharia e infraestrutura',
    'desc.Colaborador Externo': 'Parceiros e colaboradores de outras instituições',
  },
  en: {
    // Singular roles
    'role.Coordenador Geral': 'General Coordinator',
    'role.Pesquisador Sênior': 'Senior Researcher',
    'role.Professor Associado': 'Associate Professor',
    'role.Pós-doc': 'Postdoc',
    'role.Doutorando': 'PhD Student',
    'role.Mestrando': 'Master\'s Student',
    'role.Iniciação Científica': 'Undergraduate Researcher',
    'role.Engenheiro': 'Engineer',
    'role.Colaborador Externo': 'External Collaborator',
    // Plural labels
    'label.Coordenador Geral': 'General Coordination',
    'label.Pesquisador Sênior': 'Senior Researchers',
    'label.Professor Associado': 'Associate Professors',
    'label.Pós-doc': 'Postdoctoral Researchers',
    'label.Doutorando': 'PhD Students',
    'label.Mestrando': 'Master\'s Students',
    'label.Iniciação Científica': 'Undergraduate Research',
    'label.Engenheiro': 'Engineers',
    'label.Colaborador Externo': 'External Collaborators',
    // Descriptions
    'desc.Coordenador Geral': 'Leadership and strategic direction of the BINGO project',
    'desc.Pesquisador Sênior': 'PhD researchers leading specific research lines',
    'desc.Professor Associado': 'Associate professors from partner universities and research institutes',
    'desc.Pós-doc': 'Researchers in postdoctoral stages',
    'desc.Doutorando': 'Students developing doctoral theses',
    'desc.Mestrando': 'Students developing master\'s dissertations',
    'desc.Iniciação Científica': 'Undergraduate students in scientific initiation projects',
    'desc.Engenheiro': 'Engineering and infrastructure professionals',
    'desc.Colaborador Externo': 'Partners and collaborators from other institutions',
  },
  zh: {
    // Singular roles
    'role.Coordenador Geral': '总协调人',
    'role.Pesquisador Sênior': '资深研究员',
    'role.Professor Associado': '副教授',
    'role.Pós-doc': '博士后',
    'role.Doutorando': '博士生',
    'role.Mestrando': '硕士生',
    'role.Iniciação Científica': '本科生研究员',
    'role.Engenheiro': '工程师',
    'role.Colaborador Externo': '外部合作者',
    // Plural labels
    'label.Coordenador Geral': '总协调',
    'label.Pesquisador Sênior': '资深研究员',
    'label.Professor Associado': '副教授',
    'label.Pós-doc': '博士后研究员',
    'label.Doutorando': '博士生',
    'label.Mestrando': '硕士生',
    'label.Iniciação Científica': '本科生科研',
    'label.Engenheiro': '工程师',
    'label.Colaborador Externo': '外部合作者',
    // Descriptions
    'desc.Coordenador Geral': 'BINGO项目的领导与战略方向',
    'desc.Pesquisador Sênior': '领导特定研究方向 of BINGO 的博士研究人员',
    'desc.Professor Associado': '来自合作大学及研究机构的副教授',
    'desc.Pós-doc': '处于博士后阶段的研究人员',
    'desc.Doutorando': '正在撰写博士论文的博士研究生',
    'desc.Mestrando': '正在撰写硕士论文的硕士研究生',
    'desc.Iniciação Científica': '参与科研启蒙项目的在读本科生',
    'desc.Engenheiro': '工程与基础设施专业人员',
    'desc.Colaborador Externo': '来自其他机构的合作伙伴和合作者',
  }
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
