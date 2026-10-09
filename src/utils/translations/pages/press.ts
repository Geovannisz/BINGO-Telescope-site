const press: Record<string, { en: string; zh: string }> = {
  'header.label': { en: 'Press', zh: '媒体' },
  'header.title': {
    en: 'Press &amp; <span class="gradient-text-cyan">Communications</span>',
    zh: '媒体与<span class="gradient-text-cyan">传播</span>',
  },
  'header.desc': {
    en: 'Official press resources, institutional contacts, and communication guidelines for journalists and media professionals covering the BINGO Telescope project.',
    zh: '面向新闻记者和媒体专业人士的官方新闻资源、机构联系方式及传播指南。',
  },
  'releases.label': { en: 'Official Releases', zh: '官方发布' },
  'releases.title': { en: 'Press Releases', zh: '新闻稿' },
  'releases.empty': {
    en: 'No press releases published yet. Check back soon.',
    zh: '暂无新闻稿发布，请稍后再来查看。',
  },
  'about.label': { en: 'About the Project', zh: '关于项目' },
  'about.title': {
    en: 'About <span class="gradient-text-cyan">BINGO</span>',
    zh: '关于 <span class="gradient-text-cyan">BINGO</span>',
  },
  'about.desc': {
    en: 'BINGO (Baryon Acoustic Oscillations from Integrated Neutral Gas Observations) is an innovative international radio telescope under construction in Brazil, designed to perform the first detection of Baryon Acoustic Oscillations (BAO) at radio frequencies and study the nature of Dark Energy. The project is led by Brazil — through USP, INPE and UFCG — in collaboration with institutions from China, the United Kingdom, France, and the Netherlands. The telescope is being built at Serra do Urubu, Aguiar, Paraíba.',
    zh: 'BINGO（Baryon Acoustic Oscillations from Integrated Neutral Gas Observations）是一台正在巴西建设中的创新国际射电望远镜，旨在首次通过射电频率探测重子声学振荡（BAO），研究暗能量的本质。该项目由巴西（通过USP、INPE和UFCG）牵头，与中国、英国、法国和荷兰等国机构合作。望远镜正在Paraíba州Aguiar市Serra do Urubu建造。',
  },
  'about.readmore': { en: 'Read more about the project', zh: '了解更多项目信息' },
  'contacts.label': { en: 'Contacts', zh: '联系方式' },
  'contacts.title': { en: 'Contact Information', zh: '联系信息' },
  'contacts.social.title': { en: 'Social Networks', zh: '社交媒体' },
  'contacts.addresses.title': { en: 'Physical Addresses', zh: '实体地址' },
  'contacts.addresses.ufcg': {
    en: 'Universidade Federal de Campina Grande — Physics Department<br/>R. Aprígio Veloso, 882 — Bodocongó<br/>Campina Grande — PB, 58429-900 — Brazil',
    zh: '坎皮纳格兰德联邦大学（UFCG）— 物理系<br/>R. Aprígio Veloso, 882 — Bodocongó<br/>Campina Grande — PB, 58429-900 — 巴西',
  },
  'contacts.addresses.usp': {
    en: 'Universidade de São Paulo — Instituto de Física<br/>Rua do Matão, 1371 — Cidade Universitária<br/>São Paulo — SP, 05508-090 — Brazil',
    zh: '圣保罗大学（USP）— 物理研究所<br/>Rua do Matão, 1371 — Cidade Universitária<br/>São Paulo — SP, 05508-090 — 巴西',
  },
  'contacts.addresses.inpe': {
    en: 'Instituto Nacional de Pesquisas Espaciais (INPE)<br/>Av. dos Astronautas, 1758 — Jardim da Granja<br/>São José dos Campos — SP, 12227-010 — Brazil',
    zh: '国家空间研究所（INPE）<br/>Av. dos Astronautas, 1758 — Jardim da Granja<br/>São José dos Campos — SP, 12227-010 — 巴西',
  },
  'contacts.emails.title': { en: 'Institutional Email Addresses', zh: '机构邮箱' },
  'contacts.emails.general': { en: 'General', zh: '通用' },
  'contribute.label': { en: 'Contribute', zh: '参与贡献' },
  'contribute.title': { en: 'I Want to Contribute', zh: '我想参与' },
  'contribute.desc': {
    en: 'Interested in contributing to the BINGO project? Reach out through our official channels or contact the team directly.',
    zh: '有意参与BINGO项目？请通过官方渠道联系我们，或直接联系团队成员。',
  },
  'contribute.channels.title': { en: 'Official Channels', zh: '官方渠道' },
  'contribute.team.title': { en: 'Contact the Team', zh: '联系团队' },
  'interviews.label': { en: 'Media', zh: '媒体采访' },
  'interviews.title': { en: 'Interview Contacts', zh: '采访联系人' },
  'interviews.desc': {
    en: 'For interview requests, please use the institutional email addresses below. Our team will respond as soon as possible.',
    zh: '如需采访，请使用以下机构邮箱联系。我们的团队将尽快回复。',
  },
  'graphics.label': { en: 'Graphic Material', zh: '图像资料' },
  'graphics.title': { en: 'Images and Graphic Material', zh: '图片与图像资料' },
  'graphics.desc': {
    en: 'Images, photos, and graphic resources about the BINGO Telescope project can be found in our Scientific Outreach section. The gallery includes construction photos, telescope renders, and scientific diagrams.',
    zh: '与BINGO望远镜项目相关的图片、照片及图像资源可在科学传播页面找到，涵盖施工照片、望远镜渲染图及科学示意图。',
  },
  'graphics.cta': { en: 'Browse Gallery', zh: '浏览图库' },
  'cite.label': { en: 'Citation', zh: '引用方式' },
  'cite.title': { en: 'How to Cite BINGO', zh: '如何引用BINGO' },
  'cite.desc': {
    en: 'To cite the BINGO project in academic or scientific work, please consult the official consortium publications. The main reference is the series of papers published in Astronomy &amp; Astrophysics. Follow the citation guidelines of your institution or the journal to which the material will be submitted.',
    zh: '在学术或科学工作中引用BINGO项目时，请参阅联合体的官方出版物。主要参考文献是发表于《天文与天体物理》（A&amp;A）的系列论文。请遵循您所在机构或目标期刊的引用规范。',
  },
  'cite.bibtex.title': { en: 'Example BibTeX entry (Paper I)', zh: 'BibTeX示例条目（论文一）' },
  'cite.link': { en: 'View all publications', zh: '查看全部出版物' },
};
export default press;
