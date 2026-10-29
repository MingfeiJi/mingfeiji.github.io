// Public aggregates only. Source scope and verification are documented in docs/releases/.
export const knowledgeSnapshot = {
  date: '2026-10-29',
  markdown: 14109,
  concepts: 151,
  methods: 32,
  outputs: 2799,
};

export const knowledgeLayers = [
  { code: '01', name: '原始资料', count: '8,929', unit: 'Markdown 文件', description: '录音与会议、文章与论文、课程、业务资料与采集记录。保存原文，供后续判断回查。' },
  { code: '02', name: 'Wiki', count: '310', unit: 'Markdown 文件', description: '概念、方法、来源摘要与任务导航。以定义、实例、适用边界和来源组织可复用知识。' },
  { code: '03', name: '产出物', count: '2,799', unit: 'Markdown 文件', description: '文章、脚本、课程、分析与交付报告。让知识进入具体作品，再接收使用中的反馈。' },
  { code: '04', name: '项目', count: '1,773', unit: 'Markdown 文件', description: '项目资料、推进记录与决策上下文。连接当下的问题、采用的方法和可核验的交付。' },
  { code: '05', name: '软件与工具', count: '298', unit: 'Markdown 文件', description: 'Skills、提示词、工作流与工具说明。把重复出现的方法沉淀为下一次可调用的能力。' },
  { code: 'RSI', name: '个人演化', count: '独立私域', unit: '不公开正文', description: '连接目标、证据、行动与复盘。记录判断的变化，核心观点由本人逐条确认。' },
];

export const ontologyNodes = [
  { id: 'source', en: 'SOURCE', name: '来源与证据', x: 25, y: 19, title: '让判断有出处', detail: '保留原文、录音转写与采集资料。摘要可以帮助定位，重要判断仍回到可归属、可追溯的来源。', relation: '来源 → 支持或反驳 → 概念', fields: ['原始来源', '上下文', '来源版本'], note: '同一来源的转写、摘要与分析，属于同一个证据家族。' },
  { id: 'concept', en: 'CONCEPT', name: '概念与命题', x: 75, y: 19, title: '把材料变成可解释的知识', detail: '为概念留下稳定标识、定义、解释、实例与边界。关联不止是一条线，还要说明关系类型和连接理由。', relation: '概念 → 组织为 → 方法', fields: ['稳定 ID', '定义与边界', '来源与关系'], note: 'AI 提炼进入候选与复核，不自动成为本人确认的观点。' },
  { id: 'method', en: 'METHOD', name: '方法与技能', x: 85, y: 54, title: '把理解变成可以使用的方法', detail: '从任务导航找到方法，再接到 Skills、提示词和工作流。保留适用条件，让下一次调用知道何时有效。', relation: '方法 → 应用于 → 项目', fields: ['适用问题', '执行步骤', '验证条件'], note: '文档存在与技能可运行分别核验，不以收录数量代替效果。' },
  { id: 'project', en: 'PROJECT', name: '项目与行动', x: 75, y: 86, title: '把知识带回真实问题', detail: '围绕一个明确目标组织上下文、决策与行动。原型、产品与内容交付，保留采用了什么、改了什么。', relation: '项目 → 产出 → 作品', fields: ['目标与问题', '行动与决策', '当前状态'], note: '例如本次个人站改版：需求、实现、预览与发布确认分开记录。' },
  { id: 'work', en: 'OUTPUT', name: '作品与交付', x: 25, y: 86, title: '让想法留下可检查的结果', detail: '文章、课程、产品与代码形成具体版本。通过预览、测试和本人审阅，确认交付是否解决了原来的问题。', relation: '作品 → 接收 → 反馈', fields: ['具体版本', '验收结果', '使用反馈'], note: '一份生成稿不等于已采用，一次测试通过不等于业务结果。' },
  { id: 'feedback', en: 'FEEDBACK', name: '反馈与修订', x: 15, y: 54, title: '让每一轮都改变下一轮', detail: '把纠错、反例和实际结果带回知识库。修订方法与判断，并保留旧版本、修改原因和仍待验证的部分。', relation: '反馈 → 修订 → 概念与方法', fields: ['纠错与反例', '前后变化', '下一次检验'], note: '有实质变化才推进；没有新增证据时，保留待验证状态。' },
];

export const collaborationLoop = [
  { step: '01', title: '捕获问题', owner: '本人 · Grokbot', description: '从对话、观察与任务中，明确这轮要解决什么。' },
  { step: '02', title: '找回上下文', owner: 'Obsidian', description: '按任务导航找到概念、项目记录与原始来源。' },
  { step: '03', title: '执行与生成', owner: 'Codex · Skills', description: '把需求变成代码、内容或可审阅的具体交付。' },
  { step: '04', title: '校验与确认', owner: 'Codex · 本人', description: '检查来源、测试和前后差异，区分生成、采用与结果。' },
  { step: '05', title: '回写与复盘', owner: 'Obsidian · RSI', description: '将有效反馈连回方法、知识与下一次行动。' },
];
