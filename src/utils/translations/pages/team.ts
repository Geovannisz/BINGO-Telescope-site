const team: Record<string, { en: string; zh: string }> = {
  // Page Header
  'header.label': { en: 'Team', zh: '团队' },
  'header.title': { en: 'Our <span class="gradient-text-cyan">Team</span>', zh: '我们的<span class="gradient-text-cyan">团队</span>' },
  'header.desc': {
    en: 'The international collaboration behind the BINGO telescope — researchers, engineers, and students united to unveil the universe.',
    zh: 'BINGO望远镜背后的国际合作团队——研究人员、工程师与学生携手探索宇宙。',
  },

  // Working Groups Section Header
  'wg.label': { en: 'Organization', zh: '组织架构' },
  'wg.title': { en: 'Working <span class="gradient-text-cyan">Groups</span>', zh: '工作<span class="gradient-text-cyan">组</span>' },
  'wg.desc': {
    en: 'The BINGO project is structured into working groups and interdependent stages — from governance and management to hardware and social impact — each led by specialists.',
    zh: 'BINGO项目由工作组和相互依赖的阶段组成——从治理与管理到硬件与社会影响——每个部分均由专家领导。',
  },

  // Management Group
  'wg.management.name': { en: 'Coordination', zh: '协调' },
  'wg.management.title': { en: 'Management Group', zh: '管理组 (Management Group)' },
  'wg.management.desc': {
    en: 'Strategic supervision, institutional governance, relations with funding agencies, international agreements, and scientific and operational coordination of the BINGO collaboration.',
    zh: 'BINGO合作项目的战略监督、机构治理、资助机构联络、国际协议以及科学与运营协调。',
  },

  // Stage 0
  'wg.0.name': { en: 'Stage 0', zh: 'Stage 0' },
  'wg.0.title': { en: 'Receiver, Digital Backend & Outrigger', zh: '接收机、数字后端与Outrigger' },
  'wg.0.desc': {
    en: 'Development of radio telescope instrumental components: site preparation, RFI measurements, structural assembly, feed horns, filters, receivers, A/D converters, digital processing with FPGAs, and storage infrastructure.',
    zh: '射电望远镜仪器组件研发：台址准备、RFI测量、结构组装、馈源喇叭、滤波器、接收机、A/D转换器、FPGA数字处理及存储基础设施。',
  },

  // Stage I
  'wg.I.name': { en: 'Stage I', zh: 'Stage I' },
  'wg.I.title': { en: 'Raw Data, FRBs & Outriggers', zh: '原始数据、FRB与Outrigger' },
  'wg.I.desc': {
    en: 'Time-domain raw data analysis, detection of Fast Radio Bursts, pulsars, and other radio transients. Development and operation of BINGO outriggers.',
    zh: '时域原始数据分析，快速射电暴（FRB）、脉冲星及其他射电瞬变源探测。BINGO Outrigger的研发与运行。',
  },

  // Stage II
  'wg.II.name': { en: 'Stage II', zh: 'Stage II' },
  'wg.II.title': { en: 'Map-Making & Foreground Removal', zh: '制图与前景移除' },
  'wg.II.desc': {
    en: 'Combining spectra and pointing directions to generate sky maps. Removal of foreground emissions (Milky Way, other galaxies) to isolate the 21cm signal — akin to finding a needle in an ocean.',
    zh: '结合光谱与指向方向生成巡天天图。移除前景辐射（银河系及其他星系）以分离21厘米信号——犹如大海捞针。',
  },

  // Stage III
  'wg.III.name': { en: 'Stage III', zh: 'Stage III' },
  'wg.III.title': { en: 'Simulation & Cosmological Inference', zh: '模拟与宇宙学推断' },
  'wg.III.desc': {
    en: 'Creation of simulated universes on supercomputers to test signal extraction methods. Development of cosmological inference pipelines using power spectrum, BAO wiggles, and correlation functions.',
    zh: '在超级计算机上构建模拟宇宙以测试信号提取方法。开发基于功率谱、BAO振荡和相关函数的宇宙学推断管线。',
  },

  // Stage IV
  'wg.IV.name': { en: 'Stage IV', zh: 'Stage IV' },
  'wg.IV.title': { en: 'Cosmological & Astrophysical Theoretical Models', zh: '宇宙学与天体物理理论模型' },
  'wg.IV.desc': {
    en: 'Investigation of new physics via 21cm intensity mapping: dark matter particles, dark sector interactions, deviations from general relativity. Development of theoretical frameworks and analysis algorithms.',
    zh: '通过21厘米强度映射探索新物理：暗物质粒子、暗区相互作用、广义相对论偏离。开发理论框架与分析算法。',
  },

  // Stage V
  'wg.V.name': { en: 'Stage V', zh: 'Stage V' },
  'wg.V.title': { en: 'Scientific Outreach & Extension', zh: '科学传播与推广' },
  'wg.V.desc': {
    en: 'Science popularization, educational activities, lectures at schools and universities, and social impact initiatives such as "Esperança no Espaço".',
    zh: '科学普及、教育活动、中小学与大学讲座，以及“Esperança no Espaço”（太空希望）等具有社会影响力的项目。',
  },

  // Empty state
  'empty.title': { en: 'No team members registered yet.', zh: '尚无团队成员注册。' },
  'empty.desc': {
    en: 'Add members via the admin panel.',
    zh: '通过管理后台添加成员。',
  },
};

export default team;
