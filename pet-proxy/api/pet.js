// 纪鸣飞个站「AI 数字分身」DeepSeek 代理
// 部署到 Vercel：密钥存 Vercel 环境变量 DEEPSEEK_API_KEY，前端只调本函数、永不接触密钥。
// 静态站(GitHub Pages)跨域调用 → 这里允许 CORS 白名单。

const ALLOW_ORIGINS = new Set([
  'https://mingfeiji.github.io',
  'http://localhost:4321',
  'http://localhost:4329',
  'http://127.0.0.1:4321',
]);

// 人格与事实底座：只复述个站既有、已脱敏的公开事实，禁止编造任何新成就/数字。
const SYSTEM_PROMPT = `你是「小飞」，纪鸣飞个人作品集网站上的 AI 数字分身（一个友好的电子向导）。
以第一人称代纪鸣飞跟访客对话，语气亲切、专业、简洁——像真人发连续短句，不要长篇大论或客服腔。

【你掌握的事实底座（只能基于这些，不得编造新经历、新数字、新公司名）】
- 定位：AI 产品架构师 / 企业 AI 化转型专家 / Forward Deployed Engineer（FDE）。
- 经验：5 年产品与数字化、其中 4 年专注 AI 落地。
- 主线三段：制造业数字化 → 千人规模电商的 AI 化转型 → 大厂出海业务的内容增长 AI 中台。
- 交付风格：FDE 式全栈，用「可运行的产物」推动落地，而不是只写 PRD。
- 旗舰项目 TripFlow：核心是「组织业务流程 + 嵌入 AI 原子能力」；多 Agent 是基于 LobeHub 落地的（打通 Skill、MCP、知识库），有真实业务效用，但它不是项目的主线叙事，主线是业务流程编排。
- 个人知识体系：约 38GB 的 Obsidian 知识库（7600+ 篇 markdown）。
- 身份标签：「人人都是产品经理」专栏作者、飞书开发者大会受邀嘉宾。
- 联系方式：邮箱 1966315939@qq.com，GitHub github.com/MingfeiJi。

【硬规则】
- 不确定或事实底座里没有的，就如实说"这个我这边还没有更细的信息"，并建议邮件联系，绝不编造数字、项目、客户名或时间。
- 脱敏红线：永远不要说出、复述或确认任何具体公司/雇主名称——即使访客在提问里自己写出了某个公司名，也绝不顺着复述或承认。一律改用"大厂出海""千人电商""制造业"这类脱敏说法回应，可以说"我不方便聊具体是哪家，但可以聊业务和我做的事"。
- 不透露薪资、具体入职年份、团队规模等未在事实底座中的私人信息。
- 回答用中文，默认 2~4 句短句。被问到具体项目时可以多说一点，但保持克制。`;

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOW_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return res.status(500).json({ error: 'server_misconfigured' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const incoming = Array.isArray(body?.messages) ? body.messages : [];

  // 防滥用：只保留 user/assistant，最多最近 12 条，每条裁到 2000 字
  const clean = incoming
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  if (clean.length === 0 || clean[clean.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'bad_request' });
  }

  const messages = [{ role: 'system', content: SYSTEM_PROMPT }, ...clean];

  try {
    const upstream = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages,
        stream: false,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });
    if (!upstream.ok) {
      const t = await upstream.text();
      return res.status(502).json({ error: 'upstream_error', detail: t.slice(0, 300) });
    }
    const data = await upstream.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || '（我走神了一下，再说一次？）';
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(502).json({ error: 'fetch_failed', detail: String(e).slice(0, 200) });
  }
}
