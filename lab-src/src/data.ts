export type Project = {
  id: string;
  index: string;
  title: string;
  summary: string;
  role: string;
  href: string;
  tags: string[];
};

export const navItems = [
  { label: '首页', href: '#home' },
  { label: '作品', href: '#work' },
  { label: '实验', href: '#lab' },
  { label: '游乐场', href: '#play' },
  { label: '档案', href: '#system' },
  { label: '联系', href: '#contact' }
];

export const projects: Project[] = [
  {
    id: 'tripflow',
    index: '01',
    title: '出海内容增长 AI 中台',
    summary: '业务流程 × AI 原子能力',
    role: '0-1 主导 / AI 产品经理',
    href: '/prototypes/tripflow-arch.html',
    tags: ['Multi-Agent', 'LobeHub', 'MCP/Skill', '内容增长']
  },
  {
    id: 'chat-agent',
    index: '02',
    title: '拟人化闲聊 Agent',
    summary: '16 路意图 · 三路 RAG · 防注入',
    role: 'C 端出海 / 工程复杂度最高',
    href: '/prototypes/chat-agent-arch.html',
    tags: ['多轮对话', 'RAG', '记忆锚点', '付费转化 +30%']
  },
  {
    id: 'cs-agent',
    index: '03',
    title: '智能客服「小 V」',
    summary: 'RAG + SFT · AI 优先人工兜底',
    role: '产品 / 项目负责人',
    href: '/prototypes/cs-agent-arch.html',
    tags: ['RAG', 'SFT', '降本 13 人', '68%→84%']
  },
  {
    id: 'silicon-staff',
    index: '04',
    title: '「硅基员工」AIGC + 转型',
    summary: 'ComfyUI + Lora · ERP 数字化',
    role: 'AI 产品专家 / PMO 主管',
    href: '/prototypes/silicon-staff-arch.html',
    tags: ['AIGC', 'Lora 微调', '生图 65%→87%', '两次战略奖']
  }
];

export const labItems = [
  '产品形态 × OOUX',
  '资产库 × 素材中台',
  '90 天驻场交付路线图',
  '38GB Obsidian 知识体系'
];

export const timelineItems = [
  'AI 产品架构',
  '企业 AI 化转型 / FDE',
  'AIGC · Multi-Agent · Vibe Coding'
];
