const science: Record<string, { en: string; zh: string }> = {
  'header.label': { en: 'Science', zh: '科学' },
  'header.title': { en: 'Science of <span class="gradient-text-cyan">BINGO</span>', zh: '<span class="gradient-text-cyan">BINGO</span>的科学' },
  'header.desc': { en: 'Exploring the cosmos through Radio Cosmology, neutral hydrogen intensity mapping, and the detection of transient phenomena such as Fast Radio Bursts.', zh: '通过射电宇宙学、中性氢强度映射以及快速射电暴等瞬变现象的探测来探索宇宙。' },
  'bao.label': { en: 'Cosmology', zh: '宇宙学' },
  'bao.title': { en: 'Baryon Acoustic <span class="gradient-text-cyan">Oscillations</span> (BAO)', zh: '重子声学<span class="gradient-text-cyan">振荡</span>（BAO）' },
  'bao.p1': {
    en: 'In the primordial universe, less than 380,000 years after the Big Bang, all matter and radiation were joined in an extremely hot and dense plasma. In this plasma, gravity pulled matter inward while radiation pressure pushed it outward — creating <strong class="text-cyan-400">spherical sound waves</strong> that traveled at speeds close to that of light.',
    zh: '在原始宇宙中，大爆炸后不到38万年，所有物质和辐射结合在一个极其炽热和致密的等离子体中。在这个等离子体中，引力将物质向内拉，而辐射压力将其向外推——产生了以接近光速传播的<strong class="text-cyan-400">球面声波</strong>。',
  },
  'bao.p2': {
    en: 'When the universe cooled enough for atoms to form (the so-called <strong class="text-white">recombination era</strong>), these waves "froze" instantly. The distance they traveled — approximately <strong class="text-cyan-400">~150 Megaparsecs (490 million light-years)</strong> — became permanently imprinted in the distribution of matter, like wrinkles in the fabric of the cosmos.',
    zh: '当宇宙冷却到足以形成原子时（即所谓的<strong class="text-white">复合时期</strong>），这些波"瞬间冻结"。它们传播的距离——约<strong class="text-cyan-400">150百万秒差距（4.9亿光年）</strong>——被永久地铭刻在物质分布中，如同宇宙织物上的褶皱。',
  },
  'bao.p3': {
    en: 'This distance works as a <strong class="text-white">"cosmic standard ruler"</strong>: we know its real size, so by measuring how it appears at different cosmic epochs, we can precisely calculate the expansion rate of the universe and the properties of the Dark Energy that accelerates it.',
    zh: '这一距离充当<strong class="text-white">"宇宙标准尺"</strong>：我们已知其真实大小，因此通过测量它在不同宇宙时期的表观大小，就能精确计算宇宙膨胀速率以及加速膨胀的暗能量的性质。',
  },
  'bao.p4': {
    en: 'To capture such a faint and delicate cosmological signal, BINGO uses a transit design with no moving parts. This extreme structural stability reduces vibrations and spurious noise, being fundamental for the success of Radio Cosmology measurements.',
    zh: '为了捕获如此微弱精细的宇宙学信号，BINGO采用了无运动部件的凝视设计。这种极高的结构稳定性减少了振动和杂散噪声，是射电宇宙学测量成功的关键。',
  },
  'im.label': { en: 'Observational Technique', zh: '观测技术' },
  'im.title': { en: 'Intensity Mapping at <span class="gradient-text-cyan">21\u00a0cm</span>', zh: '<span class="gradient-text-cyan">21厘米</span>强度映射' },
  'im.p1': {
    en: '<strong class="text-white">Neutral hydrogen (HI)</strong>, the most abundant element in the universe, naturally emits electromagnetic radiation at a frequency of 1420\u00a0MHz — corresponding to a wavelength of 21 centimeters. This emission occurs when the electron spin "flips" relative to the proton spin, releasing a radio photon.',
    zh: '<strong class="text-white">中性氢（HI）</strong>是宇宙中最丰富的元素，自然发射频率为1420 MHz的电磁辐射——对应21厘米波长。这种发射发生在电子自旋相对于质子自旋"翻转"时，释放出一个射电光子。',
  },
  'im.p2': {
    en: 'Due to cosmic expansion, HI signals emitted at more remote epochs of the universe reach us with lower frequencies (redshift). By measuring the exact frequency of the received signal, we know from what distance/epoch it came — allowing us to create a <strong class="text-cyan-400">three-dimensional map</strong> of matter in the universe.',
    zh: '由于宇宙膨胀，在更遥远时期发出的HI信号以更低的频率到达我们（红移）。通过测量接收信号的精确频率，我们可以知道它来自什么距离/时期——从而创建宇宙物质的<strong class="text-cyan-400">三维地图</strong>。',
  },
  'im.p3': {
    en: 'The <strong class="text-cyan-400">Intensity Mapping</strong> technique is a fundamental innovation: unlike optical surveys that identify individual galaxies (a slow and expensive process), Intensity Mapping measures the <em>total</em> intensity of HI emission in large volumes (voxels) at once. This allows covering enormous cosmological volumes much more rapidly.',
    zh: '<strong class="text-cyan-400">Intensity Mapping</strong>技术是一项根本性创新：与逐个识别星系的光学巡天（缓慢且昂贵的过程）不同，Intensity Mapping同时测量大体积（体素）中HI发射的<em>总</em>强度，从而能够更快速地覆盖巨大的宇宙学体积。',
  },
  'im.p4': {
    en: 'BINGO operates in the <strong class="text-white">980–1260\u00a0MHz</strong> band, detecting HI signals emitted when the universe was between 72% and 88% of its current age (redshift <strong class="text-cyan-400">0.127\u00a0≤\u00a0z\u00a0≤\u00a00.449</strong>). The survey will cover a vast sky area of approximately <strong class="text-white">6,000 square degrees</strong>, achieving an angular resolution of <strong class="text-cyan-400">≈\u00a040\u00a0arcmin</strong>.',
    zh: 'BINGO工作于<strong class="text-white">980–1260 MHz</strong>频段，探测宇宙年龄为当前72%至88%时发出的HI信号（红移<strong class="text-cyan-400">0.127 ≤ z ≤ 0.449</strong>）。巡天将覆盖约<strong class="text-white">6000平方度</strong>的广阔天区，角分辨率达<strong class="text-cyan-400">≈40角分</strong>。',
  },
  'pipeline.label': { en: 'Data Analysis', zh: '数据分析' },
  'pipeline.title': { en: 'Pipeline & <span class="gradient-text-cyan">Simulations</span>', zh: 'Pipeline与<span class="gradient-text-cyan">模拟</span>' },
  'pipeline.p1': {
    en: 'BINGO data processing is supported by a robust computational infrastructure. The main objective of the <strong class="text-white">Pipeline</strong> is to process the raw data and produce clean time series, which are subsequently transformed into maps that reconstruct the cosmic signal captured by the telescope over its operational period.',
    zh: 'BINGO的数据处理依托强大的计算基础设施。<strong class="text-white">Pipeline</strong>的主要目标是处理原始数据并生成干净的时间序列，随后将其转化为重建望远镜在运行期间捕获的宇宙信号的天图。',
  },
  'pipeline.p2': {
    en: 'In parallel, <strong class="text-cyan-400">Simulations</strong> serve as fundamental tools for the mission. They allow exhaustive investigation of different construction and operational scenarios for BINGO, as well as the performance of its future outrigger antenna network, ensuring mitigation of artifacts before light even reaches the receivers.',
    zh: '与此同时，<strong class="text-cyan-400">模拟</strong>作为基础工具服务于整个任务。它们可以详尽地研究BINGO不同的建设和运行方案，以及未来outrigger天线网络的性能，确保在信号到达接收机之前就消除伪影。',
  },
  'frb.label': { en: 'High-Energy Astrophysics', zh: '高能天体物理' },
  'frb.title': { en: 'Fast Radio Bursts <span class="gradient-text">(FRBs)</span>', zh: 'Fast Radio Bursts <span class="gradient-text">(FRBs)</span>' },
  'frb.intro': {
    en: 'Fast Radio Bursts are one of the greatest mysteries of modern astronomy. They are extremely intense and brief radio wave pulses — lasting only milliseconds — that release as much energy as the Sun emits over several days. First detected in 2007, FRBs originate from billions of light-years away and their origin is still debated.',
    zh: '快速射电暴是现代天文学最大的谜团之一。它们是极其强烈而短暂的射电脉冲——仅持续几毫秒——释放的能量相当于太阳数天的辐射总量。2007年首次被探测到，FRB来自数十亿光年之外，其起源仍在争论中。',
  },
  'frb.discovery.title': { en: 'The Discovery — Lorimer Burst (2007)', zh: '发现——Lorimer Burst（2007）' },
  'frb.discovery.desc': {
    en: 'The first FRB was discovered by Duncan Lorimer and David Narkevic in 2007, analyzing archival data from the Parkes radio telescope in Australia. The signal, named "Lorimer Burst" (FRB 010724), lasted only 5 milliseconds, but its dispersion measure was so high that it could only have come from a cosmological distance — hundreds of millions of light-years away.',
    zh: '首个FRB由Duncan Lorimer和David Narkevic于2007年在分析澳大利亚Parkes射电望远镜的存档数据时发现。该信号被命名为"Lorimer Burst"（FRB 010724），仅持续5毫秒，但其色散量极高，只可能来自宇宙学距离——数亿光年之外。',
  },
  'frb.repeaters.title': { en: 'Repeaters vs. One-offs', zh: 'Repeaters与一次性事件' },
  'frb.repeaters.desc': {
    en: 'Most FRBs are one-off events — a single bright pulse that never repeats. However, since the discovery of FRB 121102 in 2012 (the first "repeater"), we know that some sources emit hundreds or thousands of pulses repeatedly. Curiously, FRB 180916 repeats in cycles of 16.35 days, suggesting an orbital or precessional mechanism.',
    zh: '大多数FRB是一次性事件——一个明亮的脉冲永不重复。然而，自2012年发现FRB 121102（首个"重复暴"）以来，我们知道某些源会反复发出数百甚至数千个脉冲。有趣的是，FRB 180916以16.35天为周期重复，暗示可能存在轨道或进动机制。',
  },
  'frb.magnetar.title': { en: 'Magnetars — The 2020 Evidence', zh: '磁星——2020年的证据' },
  'frb.magnetar.desc': {
    en: 'In April 2020, astronomers detected an FRB from magnetar SGR 1935+2154, <em>within our own galaxy</em> — the first time an FRB was observed from a known source. Magnetars are neutron stars with magnetic fields trillions of times stronger than Earth\'s. When stress in the magnetic field accumulates and "snaps," it can release enormous radio pulses in milliseconds.',
    zh: '2020年4月，天文学家探测到一个来自磁星SGR 1935+2154的FRB，<em>就在我们自己的银河系内</em>——这是首次从已知天体源观测到FRB。磁星是磁场强度为地球万亿倍的中子星。当磁场中的应力积累并"断裂"时，可以在毫秒内释放巨大的射电脉冲。',
  },
  'frb.probes.title': { en: 'FRBs as Cosmological Probes', zh: 'FRB作为宇宙学探针' },
  'frb.probes.desc': {
    en: 'FRBs are not just astrophysical curiosities — they are powerful cosmological tools. As the radio pulse traverses intergalactic space, it is dispersed by ionized gas (plasma) along the path. The <strong class="text-white">dispersion measure (DM)</strong> of the pulse reveals the total amount of baryonic matter between us and the source, mapping the "missing baryon problem" of the universe.',
    zh: 'FRB不仅是天体物理的奇观——它们还是强大的宇宙学工具。当射电脉冲穿越星系际空间时，会被沿途的电离气体（等离子体）色散。脉冲的<strong class="text-white">色散量（DM）</strong>揭示了我们与源之间重子物质的总量，为宇宙的"缺失重子问题"提供线索。',
  },
  'frb.bingo.title': { en: 'The Role of BINGO in FRB and Transient Detection', zh: 'BINGO在FRB和瞬变源探测中的作用' },
  'frb.bingo.p1': {
    en: 'With its vast field of view (~14.75°\u00a0×\u00a06°) and high temporal sensitivity, BINGO is an excellent platform for detecting FRBs. The <strong class="text-cyan-400">BINGO Interferometry System (BIS)</strong>, proposed in Paper IX, will use a network of outriggers — smaller 4–6 meter antennas spread geographically — to precisely localize FRB sources in the sky.',
    zh: '凭借其广阔的视场（约14.75°×6°）和高时间灵敏度，BINGO是探测FRB的理想平台。Paper IX中提出的<strong class="text-cyan-400">BINGO Interferometry System（BIS）</strong>将利用一系列outrigger——地理上分散的4至6米小型天线——精确定位天空中的FRB源。',
  },
  'frb.bingo.p2': {
    en: 'Beyond FRBs, the telescope aims to study other periodic and transient radio phenomena, such as <strong class="text-white">Pulsars</strong> and <strong class="text-white">RRATs (Rotating Radio Transients)</strong>, greatly expanding the astrophysical return of the project.',
    zh: '除FRB外，望远镜还旨在研究其他周期性和瞬变射电现象，如<strong class="text-white">脉冲星</strong>和<strong class="text-white">RRATs（旋转射电瞬变源）</strong>，极大地扩展了项目的天体物理学成果。',
  },
  'frb.bingo.p3': {
    en: 'Simulations predict that the BIS will be capable of detecting and localizing <strong class="text-white">~23 FRBs per year</strong>, with arc-minute precision. BINGO-Uirapuru, at UFCG, will be one of the outriggers of this interferometric network.',
    zh: '模拟预测BIS每年可探测和定位<strong class="text-white">约23个FRB</strong>，精度达角分级。UFCG的BINGO-Uirapuru将成为该干涉网络的outrigger之一。',
  },
  'frb.bingo.p4': {
    en: 'The combination of FRB detection with DM measurements will allow BINGO to contribute to solving one of the fundamental problems of cosmology: locating the "missing" baryons in the present-day universe.',
    zh: 'FRB探测与DM测量的结合将使BINGO能够为解决宇宙学的基本问题之一做出贡献：找到当今宇宙中"缺失"的重子。',
  },
  'de.label': { en: 'Fundamental Cosmology', zh: '基础宇宙学' },
  'de.title': { en: 'Dark Energy and the <span class="gradient-text-cyan">ΛCDM</span> Model', zh: '暗能量与<span class="gradient-text-cyan">ΛCDM</span>模型' },
  'de.accel.title': { en: 'The Accelerating Universe', zh: '加速膨胀的宇宙' },
  'de.accel.p1': {
    en: 'In 1998, two independent teams discovered, studying distant Type Ia supernovae, that the expansion of the universe is <em>accelerating</em> — a discovery that earned the 2011 Nobel Prize in Physics. The agent of this acceleration was named <strong class="text-white">Dark Energy</strong>.',
    zh: '1998年，两个独立团队通过研究遥远的Ia型超新星发现宇宙膨胀正在<em>加速</em>——这一发现获得了2011年诺贝尔物理学奖。这种加速的推动力被命名为<strong class="text-white">暗能量</strong>。',
  },
  'de.accel.p2': {
    en: 'The standard model of cosmology — <strong class="text-cyan-400">ΛCDM</strong> (Lambda Cold Dark Matter) — describes a universe composed of ~68% Dark Energy, ~27% Dark Matter, and only ~5% ordinary baryonic matter. The "cosmological constant" Λ is the simplest form of Dark Energy.',
    zh: '宇宙学标准模型——<strong class="text-cyan-400">ΛCDM</strong>（Lambda冷暗物质）——描述了一个由约68%暗能量、约27%暗物质和仅约5%普通重子物质组成的宇宙。"宇宙学常数"Λ是暗能量的最简形式。',
  },
  'de.bingo.title': { en: 'BINGO\'s Contribution', zh: 'BINGO的贡献' },
  'de.bingo.p1': {
    en: 'BINGO will provide independent constraints on the <strong class="text-white">equation of state of Dark Energy</strong>, parameterized by w₀ and wₐ: whether w\u00a0=\u00a0−1 (cosmological constant) or whether w varies with time (dynamic dark energy).',
    zh: 'BINGO将为<strong class="text-white">暗能量状态方程</strong>提供独立约束，参数化为w₀和wₐ：w = −1（宇宙学常数）还是w随时间变化（动态暗能量）。',
  },
  'de.bingo.p2': {
    en: 'Combining Intensity Mapping data with CMB (Planck), gravitational lensing surveys (LSST/Rubin), and supernovae, BINGO will contribute to resolving the <strong class="text-cyan-400">H₀ tension</strong> — the discrepancy between different measurements of the Hubble constant — and testing alternative gravity models. Papers VII and X detail the cosmological forecasts.',
    zh: '将Intensity Mapping数据与CMB（Planck）、引力透镜巡天（LSST/Rubin）和超新星数据结合，BINGO将为解决<strong class="text-cyan-400">H₀张力</strong>——不同哈勃常数测量之间的差异——以及检验替代引力模型做出贡献。Papers VII和X详述了宇宙学预测。',
  },
  'de.dark_energy': { en: 'Dark Energy', zh: '暗能量' },
  'de.dark_matter': { en: 'Dark Matter', zh: '暗物质' },
  'de.ordinary': { en: 'Ordinary Matter', zh: '普通物质' },
  'pbh.label': { en: 'Research Frontier', zh: '研究前沿' },
  'pbh.title': { en: 'Primordial Black Holes and <span class="gradient-text-cyan">Dark Matter</span>', zh: '原初黑洞与<span class="gradient-text-cyan">暗物质</span>' },
  'pbh.p1': {
    en: 'One of the most intriguing hypotheses of modern cosmology suggests that <strong class="text-white">Primordial Black Holes (PBHs)</strong> — formed in the very first moments of the universe from extreme density fluctuations — could make up a significant fraction of dark matter.',
    zh: '现代宇宙学最引人注目的假说之一认为，<strong class="text-white">原初黑洞（PBH）</strong>——在宇宙最初时刻由极端密度涨落形成——可能构成暗物质的重要组成部分。',
  },
  'pbh.p2': {
    en: 'BINGO-ABDUS will investigate this possibility through <strong class="text-cyan-400">gravitational lensing</strong> of the HI signal: if PBHs exist in sufficient numbers, they would distort the light/radio from distant sources in ways measurable by high-resolution intensity mapping.',
    zh: 'BINGO-ABDUS将通过HI信号的<strong class="text-cyan-400">引力透镜</strong>效应来研究这一可能性：如果PBH数量足够多，它们将以高分辨率强度映射可测量的方式扭曲来自遥远源的光/射电信号。',
  },
  'pbh.p3': {
    en: 'This research sits at the frontier between observational cosmology and fundamental physics, with the potential to revolutionize our understanding of the dark sector of the universe.',
    zh: '这项研究处于观测宇宙学和基础物理学的前沿，有望彻底革新我们对宇宙暗物质领域的认识。',
  },
};
export default science;
