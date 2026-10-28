// Public portfolio copy, curated from the user-supplied résumé dated 2026-10-28.
// Scope notes travel with each metric. Goals are never added to realized results.
export const profile = {
  title: '高级 AI 产品经理',
  experience: '5 年产品经验 · 3 年聚焦 AI 产品落地',
  focus: '出海内容增长 · B 端 AI 产品架构 · 业务 Agent',
  summary: '把业务经验变成可运行、可评测、可持续迭代的 AI 系统。从需求共创、产品架构到原型开发和评测回归，推动 AI 真正进入业务流程。',
};

export const metrics = [
  { value: '8000+', label: '条 / 日自动发布', scope: 'TripFlow · 批量混剪发布' },
  { value: '1.5h → 20min', label: '单条剪辑耗时', scope: 'TripFlow · AI 剪辑' },
  { value: '0%', label: '审核漏杀率', scope: 'AI 审核 · 5000+ 条评测集' },
  { value: '7% → 95%', label: '低价识别准确率', scope: '机票走查 · 616 / 649 项正确' },
];

export const experiences = [
  {
    id: 'trip', period: '2025 — 至今', company: '携程 · 火车票 AI Lab',
    legalName: '携程旅游网络技术（上海）有限公司',
    role: 'AI 产品经理 · AI 赋能内容增长业务转型产品负责人',
    intro: '0→1 规划、搭建和评测 TripFlow 内容增长 AI 中台与 TripYoyo Agent／Skill 平台，服务火车票／欧铁业务线内容运营团队。',
    points: [
      '从多层级访谈和共创会出发，把 7 步内容链路拆为 6 大业务域、38 类业务意图和 47 条用户旅程，收敛为「工作台＋Agent」。',
      '主导和交付 20+ 个 AI＋内容项目，AI 贯穿 7/7 环节；批量发布每日 8000+ 条、产量 ×10，相关内容单周千万级播放。',
      '用 Claude Code／Codex 交付 40+ 个可交互原型与业务 Skill，建立「固定评测集→BadCase 归因→迭代→同集回归」闭环。',
      'TripYoyo 完成 100 项任务离线评测、6 个完整日 7,091 次顶层 Run 日清；机票走查两批 649 项评测中 616 项正确。',
    ],
    tags: ['TripFlow', 'TripYoyo', 'MCP／Skill', 'Agentic Harness', 'T+7 新客归因'],
  },
  {
    id: 'maige', period: '2025', company: '北京更好玩 · Maige',
    legalName: '北京更好玩科技有限公司', role: '产品经理 · C 端出海 AI 社交',
    intro: '0→1 完成 AI 情感陪伴与社交破冰产品的架构、MVP 和初步商业验证，跑通付费转化。',
    points: [
      '基于 AARRR 设计信息提取、匹配推荐、小剧场破冰、闲聊促转化与记忆锚点的原子 Agent 矩阵。',
      '16 路意图路由、多轮对话、RAG 人设与用户记忆召回，按场景选择模型，并在输入侧设计防提示词注入。',
      '搭建 Dify＋ComfyUI 内容生产平台，冷启动内容生产效率提升 300%–500%；用留存和互动轮数验证体验。',
    ],
    tags: ['Multi-Agent', '长期记忆', 'AARRR', 'Dify', 'ComfyUI'],
  },
  {
    id: 'vidaxl', period: '2021 — 2025', company: 'vidaXL 中国 · 宁波荷贝',
    legalName: '宁波荷贝信息服务有限公司', role: '数字化项目主管',
    intro: '负责千人级跨境电商的数字化与 AI 化转型，覆盖客服、电商内容、ERP 业财融合及公司级信息安全项目。',
    points: [
      '智能客服「小 V」自动处理 80% 重复问题，客服编制优化 13 人，满意度 68%→84%。',
      '电商 AIGC 生图采纳率 65%→87%，核心品类生产效率 +30%，图文标注工作流效率 +40%。',
      '统筹 16 个部门、20+ 人跨部门团队，完成业务蓝图、PMO 审核、UAT、培训与 SOP、上线；向亚洲区总经理及 Global 信息安全官英文汇报。',
    ],
    tags: ['RAG＋Agent', 'ERP', 'PMP', '跨部门协作', '英文工作语言'],
  },
];

export const projects = [
  {
    id: 'editing', group: 'TripFlow', name: 'AI 剪辑与质检', status: '已交付',
    result: '1.5h → 约 20min', unit: '单条剪辑耗时',
    problem: '把运营的剪辑判断变成可以执行、可以复查的生产流程。',
    approach: '先用质检 Skill 定义质量规则，再把脚本、素材、配音、选镜与精剪拆成模块；交付可二次编辑的剪映原生工程。',
    note: '按单条剪辑项目口径，耗时从 1.5h 缩短到约 20min，良品率 85%。Q4 日产 5000 条为规划目标，单独统计。',
  },
  {
    id: 'publishing', group: 'TripFlow', name: '批量混剪发布', status: '已上线',
    result: '8000+ 条 / 日', unit: '自动发布 · 产量 ×10',
    problem: '多账号逐台上传成为渠道扩量的人力瓶颈。',
    approach: '将混剪系统直连 Geelark 云手机矩阵，批量发起、多账号分发、上传文案／视频／封面，发布结果回流平台。',
    note: '发布产能与获客结果分别度量；不把发布条数直接当作新增客户。',
  },
  {
    id: 'audit', group: 'TripFlow', name: 'AI 内容审核', status: '已上线',
    result: '漏杀 0%', unit: '误杀率 ≤10%',
    problem: '多国家、多平台规则持续变化，需要稳定的质量与风险控制。',
    approach: '5000+ 条固定评测集、100+ 条规则覆盖 10+ 渠道；跑批、归因、改规则／Prompt、同集回归。',
    note: '指标按简历所述评测口径展示，不代表对所有未来内容的零风险保证。',
  },
  {
    id: 'harness', group: 'TripYoyo', name: 'Agent／Skill 平台', status: '已交付',
    result: '7,091 次 Run', unit: '6 个完整日线上日清',
    problem: '业务能力需要被复用，运行结果需要被观察和持续评测。',
    approach: 'ReAct Harness＋领域 MCP＋业务 Skill，建设团队 Skill 商店；Trace 接入评测体系，按 Run／Case／Issue 分层去重归因。',
    note: '另有 100 项任务离线评测；运行次数与评测任务数使用不同统计单位。',
  },
  {
    id: 'fare', group: 'TripYoyo', name: '机票低价走查', status: '已交付',
    result: '7% → 95%', unit: '低价识别准确率',
    problem: '低价识别结果不稳定，人工走查耗时高。',
    approach: '抽帧、OCR、业务规则拆解与分层评测；BadCase 经业务确认后回归，迭代 20+ 个版本。',
    note: '两批 649 项评测，616 项正确（约 94.9%，页面取整为 95%）。起点为业务方原方案约 7% 的准确率。',
  },
  {
    id: 'growth', group: 'TripFlow', name: '灵感与增长数据闭环', status: '已交付',
    result: '约 80% 可用', unit: '灵感每日推送',
    problem: '选题依赖人工扫描，脚本效果难以回流。',
    approach: '榜单与竞品采集、相关性筛选、爆款结构拆解；按人／账号／脚本追踪播放、搜码、引流到 T+7 新客支付。',
    note: '选题由天级缩短到小时级；图文批量与多语言本地化已交付，营销海报工作流仍是测试环境跑通。',
  },
];
