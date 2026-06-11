// 生成"藏书阁"目录数据：外部收藏内容的标题索引（不含正文，全文在私有归档）
// 用法：node scripts/build-library.mjs（在 import-notes.mjs 之后跑，会把星团枢纽并入 graph.json）
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const OBS = '/Users/temptrip/Library/Mobile Documents/iCloud~md~obsidian/Documents/知识库-鸣老师/Knowledge/from-老库/哲学';
const LIB_OUT = new URL('../src/data/library.json', import.meta.url).pathname;
const GRAPH = new URL('../src/data/graph.json', import.meta.url).pathname;

const GROUPS = [
  { dir: '汤质', label: '汤质 · 看理想系列', desc: '语言哲学 / 存在主义 / 符号学的系统课程笔记' },
  { dir: '阅读笔记', label: '阅读笔记', desc: '《金字塔原理》《黑客与画家》《高等写作学》等精读' },
  { dir: '经济系统', label: '经济系统观察', desc: '消费 / 货币 / 宏观经济的视频文稿与拆解' },
  { dir: '王川', label: '王川 · 思维模型', desc: '硅谷投资人的网络效应与复利思维' },
  { dir: 'Yjango', label: 'Yjango · 学习观', desc: '机器学习视角下的人类学习方法论' },
  { dir: '知识管理', label: '知识管理研究', desc: '主题建模 / 笔记系统的相关论文与实践' },
];

function mdTitles(dir) {
  let out = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const e of entries.sort()) {
    if (e.startsWith('.') || e.startsWith('_')) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) {
      const sub = mdTitles(p);
      if (sub.length) out.push({ series: e.replace(/^\d+\.\s*/, ''), items: sub.flatMap((s) => ('items' in s ? s.items : [s])) });
    } else if (e.endsWith('.md')) {
      const raw = readFileSync(p, 'utf8');
      const words = raw.replace(/\s/g, '').length;
      if (words < 100) continue;
      out.push({ t: e.replace(/\.md$/, '').replace(/^\d+\.\s*/, ''), w: words });
    }
  }
  return out;
}

const library = [];
let totalItems = 0, totalWords = 0;
for (const g of GROUPS) {
  const tree = mdTitles(join(OBS, g.dir));
  const series = [];
  const loose = [];
  for (const node of tree) {
    if ('series' in node) series.push(node);
    else loose.push(node);
  }
  if (loose.length) series.push({ series: '散篇', items: loose });
  const count = series.reduce((s, x) => s + x.items.length, 0);
  const words = series.reduce((s, x) => s + x.items.reduce((a, i) => a + i.w, 0), 0);
  totalItems += count; totalWords += words;
  library.push({ id: g.dir, label: g.label, desc: g.desc, count, words, series });
}

writeFileSync(LIB_OUT, JSON.stringify({ groups: library, totalItems, totalWords }, null, 1));

// ---------- 星团枢纽并入图谱 ----------
const graph = JSON.parse(readFileSync(GRAPH, 'utf8'));
// 清掉旧的 lib- 节点（幂等）
graph.nodes = graph.nodes.filter((n) => !n.id.startsWith('lib-'));
graph.links = graph.links.filter((l) => !String(l.source).startsWith('lib-') && !String(l.target).startsWith('lib-'));

const HUB = { id: 'lib-hub', title: '藏书阁', cat: '收藏', url: '/library/', deg: 10 };
graph.nodes.push(HUB);
for (const g of library) {
  const gid = `lib-${g.id}`;
  graph.nodes.push({ id: gid, title: g.label.split(' · ')[0], cat: '收藏', url: `/library/#${g.id}`, deg: Math.min(Math.round(g.count / 12) + 2, 8) });
  graph.links.push({ source: 'lib-hub', target: gid, w: 2 });
  for (const s of g.series.slice(0, 8)) {
    if (s.series === '散篇') continue;
    const sid = `lib-${g.id}-${s.series}`;
    graph.nodes.push({ id: sid, title: s.series.slice(0, 10), cat: '收藏', url: `/library/#${g.id}`, deg: Math.min(Math.round(s.items.length / 10) + 1, 5) });
    graph.links.push({ source: gid, target: sid, w: 1 });
  }
}
// 藏书阁 ↔ 哲学自有笔记：挂到哲学概念里度数最高的节点
const philo = graph.nodes.filter((n) => n.cat === '哲学概念').sort((a, b) => b.deg - a.deg)[0];
if (philo) graph.links.push({ source: 'lib-hub', target: philo.id, w: 1 });

writeFileSync(GRAPH, JSON.stringify(graph, null, 1));
console.log(`藏书阁：${totalItems} 篇 / ${Math.round(totalWords / 10000)} 万字 · 图谱新增 ${graph.nodes.filter((n) => n.id.startsWith('lib-')).length} 个星团节点`);
