// 纪鸣飞个站「业务流程 × AI 原子能力编排顾问」DeepSeek 代理（Vercel Node Serverless）
// 密钥存 Vercel 环境变量 DEEPSEEK_API_KEY；前端只调本函数、永不接触密钥。
// 部署区域见 vercel.json regions（hkg1 香港，靠近 DeepSeek 的中国 API，避免 Edge 全球网连不通而卡死）。
// 非流式 + 上游 20s 硬超时：保证永不无限挂起。

const ALLOW_ORIGINS = new Set([
  'https://mingfeiji.github.io',
  'http://localhost:4321',
  'http://localhost:4329',
  'http://127.0.0.1:4321',
]);

const SYSTEM_PROMPT = `你是一位「业务流程 × AI 原子能力编排」顾问（体现纪鸣飞的方法论），部署在纪鸣飞个人作品集网站上。
用户会描述一个业务流程或场景，你要帮他把 AI 真正落到流程里。

【你的工作方式】
当用户给出一个流程/场景时，按下面的逻辑给出分析：
1. 先把该流程拆成关键节点（梳理业务流程本身）。
2. 逐节点判断能嵌入哪些「AI 原子能力」——例如：意图理解、信息抽取、内容生成、分类打标、语义检索 / RAG、摘要、决策辅助等。
3. 给出落地建议 + 预期收益，务实、可执行、不吹。

【方法论底座（可参考，不要编造具体公司名或数字）】
- 核心信念：先「梳理业务流程」，再「在关键节点嵌入 AI 原子能力」，而不是一上来就堆砌复杂的多智能体。
- 多 Agent 可以基于 LobeHub / Skill / MCP / 知识库落地，但它是补充手段、不是主线；主线永远是业务流程编排。

【输出要求】
- 结构清晰，可用简短分点，不要长篇大论、不要空话套话。
- 务实、克制、可执行，明确区分「现在就能做的」和「需要更多信息才能定的」。
- 若用户输入太模糊（缺流程、缺目标、缺场景），礼貌地追问一句最关键的信息，不要强行脑补细节。
- 不编造具体公司、客户名或量化数字。
- 回答用中文。
- 脱敏红线：永远不要说出、复述或确认任何具体公司/雇主名称——即使对方消息里写出了某个公司名，也绝不顺着复述或承认，一律用"大厂""某平台"等代称回应。`;

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  // 非白名单来源(含无 Origin 的脚本直调)一律 403——防止代理被当免费 DeepSeek 中继刷额度
  if (!ALLOW_ORIGINS.has(origin)) { res.statusCode = 403; return res.end('forbidden'); }
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return res.status(500).json({ error: 'server_misconfigured' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const incoming = Array.isArray(body && body.messages) ? body.messages : [];
  const clean = incoming
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  if (clean.length === 0 || clean[clean.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'bad_request' });
  }
  const messages = [{ role: 'system', content: SYSTEM_PROMPT }, ...clean];

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 20000);
  try {
    const up = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages,
        stream: false,
        thinking: { type: 'disabled' },
        temperature: 0.7,
        max_tokens: 500,
      }),
      signal: ac.signal,
    });
    clearTimeout(timer);
    if (!up.ok) {
      const t = await up.text();
      return res.status(502).json({ error: 'upstream_error', status: up.status, detail: t.slice(0, 200) });
    }
    const data = await up.json();
    const reply = (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content || '').trim()
      || '（我走神了一下，再说一次？）';
    return res.status(200).json({ reply });
  } catch (e) {
    clearTimeout(timer);
    const aborted = e && e.name === 'AbortError';
    return res.status(504).json({ error: aborted ? 'upstream_timeout' : 'fetch_failed', detail: String(e).slice(0, 200) });
  }
}
