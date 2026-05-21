const index: Record<string, { en: string; zh: string }> = {
  'overview.label': { en: 'Overview', zh: '概览' },
  'overview.title': { en: 'A Window into the Early Universe', zh: '通往早期宇宙的窗口' },
  'overview.desc': {
    en: 'The BINGO telescope was designed to measure Baryon Acoustic Oscillations (BAO) in the universe at radio frequencies, helping to unravel the mysteries of Dark Energy and mapping the distribution of neutral hydrogen across vast cosmic volumes.',
    zh: 'BINGO望远镜旨在通过射电频率测量宇宙中的重子声学振荡（BAO），助力揭示暗能量之谜，并绘制中性氢在广阔宇宙体积中的分布图。',
  },
  'bao.title': { en: 'BAO Mapping', zh: 'BAO巡天' },
  'bao.desc': {
    en: 'Measuring the distribution of neutral hydrogen at 21\u00a0cm to understand the expansion rate of the universe and the nature of Dark Energy — providing an independent cosmic "standard ruler."',
    zh: '通过21厘米波段测量中性氢分布，以理解宇宙膨胀速率和暗能量的本质——提供独立的宇宙"标准尺"。',
  },
  'frb.title': { en: 'FRBs & Transients', zh: 'FRBs与瞬变源' },
  'frb.desc': {
    en: 'Detecting Fast Radio Bursts — millisecond explosions of radio waves from billions of light-years away — and pulsars with the BIS interferometric system.',
    zh: '探测快速射电暴（FRB）——来自数十亿光年外的毫秒级射电脉冲——并利用BIS干涉系统监测脉冲星。',
  },
  'abdus.title': { en: 'BINGO-ABDUS Consortium', zh: 'BINGO-ABDUS联合体' },
  'abdus.desc': {
    en: 'Joint operations with global observatories such as FAST and Tianlai, extending the reach to z\u00a0~\u00a02.1 and investigating Primordial Black Holes.',
    zh: '与FAST和天籁等全球天文台联合观测，将探测范围扩展至z~2.1，并探索原初黑洞。',
  },
  'about.label': { en: 'About the Project', zh: '关于项目' },
  'about.title': {
    en: 'What is <span class="gradient-text-cyan">BINGO</span>?',
    zh: '什么是<span class="gradient-text-cyan">BINGO</span>？',
  },
  'about.p1': {
    en: '<strong class="text-white">BINGO</strong> (Baryon Acoustic Oscillations from Integrated Neutral Gas Observations) is an innovative radio telescope located at Serra do Urubu, in Aguiar, Paraíba. Designed to perform the first BAO mapping at radio frequencies, it employs the <strong class="text-cyan-400">Intensity Mapping</strong> technique of the 21\u00a0cm neutral hydrogen line.',
    zh: '<strong class="text-white">BINGO</strong>（Baryon Acoustic Oscillations from Integrated Neutral Gas Observations）是一台创新的射电望远镜，位于Paraíba州Aguiar市的Serra do Urubu。它旨在利用中性氢21厘米谱线的<strong class="text-cyan-400">Intensity Mapping</strong>技术，实现首次射电频率BAO巡天。',
  },
  'about.p2': {
    en: 'With two massive ~40\u00a0m mirrors in a Crossed-Dragone configuration and 28 corrugated horns in the focal plane, BINGO operates between 980 and 1260\u00a0MHz. As a "transit" telescope with no moving parts, it provides extreme structural and pointing stability — ideal for detecting the faint HI signal emitted when the universe was between 72% and 88% of its current age.',
    zh: 'BINGO采用Crossed-Dragone构型的两面巨大的（约40米）反射镜和焦平面上的28个波纹馈源，工作频率为980至1260 MHz。作为一台没有移动部件的“中天”望远镜，它提供了极高的结构和指向稳定性——非常适合探测宇宙年龄为当前72%至88%时发出的微弱HI信号。',
  },
  'about.p3': {
    en: 'It is a project led by Brazil (USP, INPE, UFCG) in international collaboration with China, the United Kingdom, France, the Netherlands, and South Africa, bringing together more than 60 researchers.',
    zh: '该项目由巴西（USP、INPE、UFCG）牵头，与中国、英国、法国、荷兰和南非开展国际合作，汇聚了60多位研究人员。',
  },
  'about.link': { en: 'Learn more about the project', zh: '了解更多项目信息' },
  'status.label': { en: 'Current Status', zh: '当前状态' },
  'status.title': { en: 'Assembly and Commissioning Phase', zh: '组装与调试阶段' },
  'status.structure.title': { en: 'Main Structure', zh: '主体结构' },
  'status.structure.desc': {
    en: 'The metallic mirror structure, manufactured in China, has been shipped to Brazil and is being assembled at the site in Aguiar, Paraíba. The control house and support infrastructure are complete.',
    zh: '在中国制造的反射镜金属结构已运抵巴西，正在Paraíba州Aguiar站址进行组装。控制室和配套基础设施已竣工。',
  },
  'status.receivers.title': { en: 'Receivers and Backend', zh: '接收机与后端' },
  'status.receivers.desc': {
    en: 'Low-noise receivers and the FPGA/GPU-based digital backend are in the integration and testing phase. BINGO-Uirapuru at UFCG serves as a testbed for ongoing validation.',
    zh: '低噪声接收机和基于FPGA/GPU的数字后端正处于集成测试阶段。UFCG的BINGO-Uirapuru作为测试平台持续进行验证。',
  },
  'status.obs.title': { en: 'First Observations', zh: '首次观测' },
  'status.obs.desc': {
    en: 'The telescope is expected to begin its first scientific measurements in 2026. The commissioning phase will include calibration, beam pattern validation, and sensitivity tests.',
    zh: '望远镜预计于2026年开始首次科学观测。调试阶段将包括校准、波束方向图验证和灵敏度测试。',
  },
  'stats.mirrors': { en: 'Mirror Diameter', zh: '反射镜口径' },
  'stats.horns': { en: 'Horns in the Focal Plane', zh: '焦平面馈源' },
  'stats.publications': { en: 'Scientific Publications', zh: '科学论文' },
  'stats.countries': { en: 'Collaborating Countries', zh: '合作国家' },
  'ext.label': { en: 'Extensions', zh: '扩展项目' },
  'ext.title': { en: 'Beyond the Telescope', zh: '超越望远镜' },
  'ext.desc': {
    en: 'BINGO is more than a telescope — it is an ecosystem of science, technology, and social impact that spans multiple research fronts and community action.',
    zh: 'BINGO不仅仅是一台望远镜——它是一个涵盖科学、技术和社会影响的生态系统，横跨多个研究前沿和社区行动。',
  },
  'ext.uirapuru.desc': {
    en: 'Prototype radio telescope at UFCG, testbed for receivers and future outrigger network for FRB detection and localization.',
    zh: 'UFCG的原型射电望远镜，作为接收机测试平台和未来FRB探测与定位的outrigger网络。',
  },
  'ext.abdus.desc': {
    en: 'Advanced BINGO Dark Universe Studies — pushing frontiers in collaboration with ASTRON and Nançay Observatory, reaching z\u00a0~\u00a02.1.',
    zh: 'Advanced BINGO Dark Universe Studies——与ASTRON和Nançay天文台合作拓展前沿，探测范围达z~2.1。',
  },
  'ext.esperanca.title': { en: 'Hope in Space', zh: '太空中的希望' },
  'ext.esperanca.desc': {
    en: 'Science outreach and social inclusion project in Paraíba — building telescopes with recycled materials and popularizing astronomy.',
    zh: 'Paraíba州的科学传播和社会融入项目——利用回收材料制造望远镜，普及天文学知识。',
  },
  'news.title': { en: 'Latest Updates', zh: '最新动态' },
  'news.subtitle': { en: 'Follow the progress of the project.', zh: '关注项目最新进展。' },
  'news.viewall': { en: 'View all', zh: '查看全部' },
  'news.viewall.mobile': { en: 'View all updates', zh: '查看全部动态' },
  'about.link.explore': { en: 'Explore', zh: '探索' },
  'news.label': { en: 'News', zh: '新闻' },
  'hero.video.caption': { en: 'BINGO Project presentation video', zh: 'BINGO项目介绍视频' },
};
export default index;
