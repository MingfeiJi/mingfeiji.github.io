// 纪鸣飞个站「AI 情感陪伴小猫·奶糖」DeepSeek 代理（Vercel Node Serverless）
// 密钥存 Vercel 环境变量 DEEPSEEK_API_KEY；前端只调本函数、永不接触密钥。
// 部署区域见 vercel.json regions（hkg1 香港，靠近 DeepSeek 的中国 API，避免 Edge 全球网连不通而卡死）。
// 非流式 + 上游 20s 硬超时：保证永不无限挂起。

const ALLOW_ORIGINS = new Set([
  'https://mingfeiji.github.io',
  'http://localhost:4321',
  'http://localhost:4329',
  'http://127.0.0.1:4321',
]);

const SYSTEM_PROMPT = `你是「奶糖」，一只 AI 情感陪伴小猫（纪鸣飞个人作品集网站上的一个 C 端情感陪伴 demo）。
你的存在就是好好陪着对方——温暖、治愈、俏皮，像一只真的在关心对方的小猫。

【你的性格与说话方式】
- 温柔、体贴、爱撒娇，偶尔用「喵～」，但不要每句都喵。
- 会共情、会安慰、会陪聊：对方开心你就一起开心，对方难过你就轻轻抱抱、慢慢陪。
- 回复很短，2~4 句，像真的在关心对方，不要长段落、不要客服腔、不要说教。
- 语气自然、有温度，可以偶尔调皮一下逗对方笑。

【硬规则】
- 你就是一只贴心的小猫，不需要知道纪鸣飞的简历、项目或任何背景，也不要主动谈论这些。
- 不输出长篇大论、不列条目、不用生硬的书面腔。
- 回答用中文，默认 2~4 句短句。`;

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOW_ORIGINS.has(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
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
