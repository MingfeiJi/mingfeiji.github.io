// 从 Obsidian 导入"自有笔记"（概念库/来源摘要/哲学笔记）+ 生成知识图谱数据
// 仅导入本人撰写/编译的内容；外部转写、书摘、付费课程一律不碰。
// 用法：node scripts/import-notes.mjs
import { redact } from './redact.mjs';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const OBS = '/Users/temptrip/Library/Mobile Documents/iCloud~md~obsidian/Documents/知识库-鸣老师';
const DEST = new URL('../src/content/notes/', import.meta.url).pathname;
const GRAPH_OUT = new URL('../src/data/graph.json', import.meta.url).pathname;
const ARTICLES_DIR = new URL('../src/content/articles/', import.meta.url).pathname;

const SOURCES = [
  { dir: `${OBS}/WIKI/concepts`, cat: 'AI 概念', match: (f) => f.startsWith('C-AI') },
  { dir: `${OBS}/WIKI/concepts`, cat: '投资概念', match: (f) => f.startsWith('concepts-') },
  { dir: `${OBS}/WIKI/summaries`, cat: '来源摘要', match: () => true },
  { dir: `${OBS}/Knowledge/from-老库/哲学/概念模块`, cat: '哲学概念', match: () => true },
  { dir: `${OBS}/Knowledge/from-老库/哲学/命题模块`, cat: '哲学命题', match: () => true },
];

// 脱敏（与 import-articles 一致；词表在本机 ~/.config/mfj/redact-map.json，不入仓）
function desensitize(s) {
  return redact(s);
}

function titleFromFile(f, cat) {
  let t = f.replace(/\.md$/, '');
  if (cat === '投资概念') t = t.replace(/^concepts-/, '');
  if (cat === 'AI 概念') t = t.replace(/^C-AI\d+-/, '').replace(/-/g, ' ');
  if (cat === '来源摘要') t = t.replace(/^S-AI\d+-/, '').replace(/-/g, ' ');
  return t;
}

function parseFrontmatter(raw) {
  if (!raw.startsWith('---')) return [null, raw];
  const end = raw.indexOf('\n---', 3);
  if (end < 0) return [null, raw];
  return [raw.slice(4, end), raw.slice(end + 4).replace(/^\s*\n/, '')];
}

rmSync(DEST, { recursive: true, force: true });
mkdirSync(DEST, { recursive: true });
mkdirSync(new URL('../src/data/', import.meta.url).pathname, { recursive: true });

// ---------- 第一遍：收集所有笔记 ----------
const notes = [];
let n = 0;
for (const src of SOURCES) {
  let files;
  try {
    files = readdirSync(src.dir).filter((f) => f.endsWith('.md') && src.match(f));
  } catch { continue; }
  for (const f of files.sort()) {
    const raw = readFileSync(join(src.dir, f), 'utf8');
    if (raw.trim().length < 200) continue; // 跳过空壳
    n++;
    const slug = `k${String(n).padStart(3, '0')}`;
    let [fm, body] = parseFrontmatter(raw);
    // 投资概念有第二层爬虫元数据块，剥掉
    if (src.cat === '投资概念' && body.startsWith('---')) {
      const [, body2] = parseFrontmatter(body);
      body = body2;
    }
    const fmTitle = fm?.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1];
    const title = fmTitle || titleFromFile(f, src.cat);
    const shortTitle = title.replace(/[（(].*?[)）]/g, '').trim();
    const dateM = fm?.match(/^created:\s*(\S+)/m)?.[1];
    notes.push({ slug, title, shortTitle, cat: src.cat, body, date: dateM || '' });
  }
}

// ---------- 标题 → slug 索引（用于双链与提及检测）----------
const byTitle = new Map();
for (const note of notes) {
  byTitle.set(note.title, note.slug);
  if (note.shortTitle.length >= 2) byTitle.set(note.shortTitle, note.slug);
}

// ---------- 第二遍：建边 + 写文件 ----------
const edges = new Map(); // "a|b" -> weight
function addEdge(a, b, w = 1) {
  if (a === b) return;
  const key = a < b ? `${a}|${b}` : `${b}|${a}`;
  edges.set(key, (edges.get(key) || 0) + w);
}

const MENTION_TITLES = [...byTitle.entries()].filter(([t]) => t.length >= 2 && t.length <= 20);

for (const note of notes) {
  let body = desensitize(note.body);

  // [[wikilink]] → 站内链接（目标存在）/ 纯文本（不存在）
  body = body.replace(/\[\[([^\]|]+)(\|([^\]]+))?\]\]/g, (_, target, __, alias) => {
    const t = target.split('/').pop().replace(/\.md$/, '').replace(/^concepts-/, '').replace(/^C-AI\d+-/, '').replace(/^S-AI\d+-/, '');
    const text = alias || t;
    const dest = byTitle.get(t) || byTitle.get(text);
    if (dest && dest !== note.slug) {
      addEdge(note.slug, dest, 3);
      return `[${text}](/notes/${dest}/)`;
    }
    return text;
  });

  // 标题提及检测（正文里出现其他笔记标题 → 建边）
  for (const [t, slug] of MENTION_TITLES) {
    if (slug === note.slug) continue;
    if (body.includes(t)) addEdge(note.slug, slug, 1);
  }

  // "相关概念"区块内的纯文本概念名 → 链接化
  body = body.replace(/^(- )([^\n—:：]{2,18})(\s*[—:：])/gm, (m, dash, name, sep) => {
    const dest = byTitle.get(name.trim());
    if (dest && dest !== note.slug) {
      addEdge(note.slug, dest, 2);
      return `${dash}[${name.trim()}](/notes/${dest}/)${sep}`;
    }
    return m;
  });

  const fm = [
    '---',
    `title: ${JSON.stringify(note.title)}`,
    `category: ${JSON.stringify(note.cat)}`,
    note.date ? `created: ${note.date}` : null,
    '---',
    '',
  ].filter(Boolean).join('\n');
  writeFileSync(join(DEST, `${note.slug}.md`), fm + body);
}

// ---------- 文章节点也入图（按标题提及 + 标签共现）----------
const articleNodes = [];
try {
  const afiles = readdirSync(ARTICLES_DIR).filter((f) => f.endsWith('.md'));
  const arts = [];
  for (const f of afiles) {
    const raw = readFileSync(join(ARTICLES_DIR, f), 'utf8');
    const [fm, body] = parseFrontmatter(raw);
    const title = fm?.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1] || f;
    const tags = (fm?.match(/^tags:\s*\[(.*)\]/m)?.[1] || '').split(',').map((s) => s.trim()).filter(Boolean);
    const slug = f.replace(/\.md$/, '');
    arts.push({ slug, title, tags, body });
    articleNodes.push({ id: slug, title, cat: '文章', url: `/articles/${slug}/` });
  }
  // 文章 ↔ 笔记：标题提及
  for (const a of arts) {
    for (const [t, slug] of MENTION_TITLES) {
      if (a.body.includes(t)) addEdge(a.slug, slug, 1);
    }
  }
  // 文章 ↔ 文章：共享 ≥2 个标签
  for (let i = 0; i < arts.length; i++) {
    for (let j = i + 1; j < arts.length; j++) {
      const shared = arts[i].tags.filter((t) => arts[j].tags.includes(t)).length;
      if (shared >= 2) addEdge(arts[i].slug, arts[j].slug, shared - 1);
    }
  }
} catch {}

// ---------- 每节点限度数（防毛球）：保留权重最高的 6 条 ----------
const perNode = new Map();
const sortedEdges = [...edges.entries()].sort((a, b) => b[1] - a[1]);
const kept = [];
for (const [key, w] of sortedEdges) {
  const [a, b] = key.split('|');
  const da = perNode.get(a) || 0, db = perNode.get(b) || 0;
  if (da >= 6 && db >= 6) continue;
  kept.push({ source: a, target: b, w });
  perNode.set(a, da + 1);
  perNode.set(b, db + 1);
}

const nodes = [
  ...notes.map((nt) => ({ id: nt.slug, title: nt.shortTitle || nt.title, cat: nt.cat, url: `/notes/${nt.slug}/` })),
  ...articleNodes,
].map((node) => ({ ...node, deg: perNode.get(node.id) || 0 }));

writeFileSync(GRAPH_OUT, JSON.stringify({ nodes, links: kept }, null, 1));

const catCount = {};
for (const nt of nodes) catCount[nt.cat] = (catCount[nt.cat] || 0) + 1;
console.log(`笔记 ${notes.length} 篇 · 图谱节点 ${nodes.length} · 连线 ${kept.length}`);
console.log(catCount);
