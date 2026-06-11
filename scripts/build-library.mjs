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

// ---------- 站点策展类目（仅站上分类，不对应 vault 文件移动）----------
library.push({
  id: 'liuxiaopai',
  label: '刘小排 · VibeCoding 课程（外部）',
  desc: 'AI 编程变现课的完整学习档案，以及我基于它再设计的两天小班课方案',
  count: 12,
  words: 0,
  series: [
    { series: '原课 · 实战进阶（4 讲）', items: [
      { t: '实战进阶 1/4 · 前后端、源代码、数据库、用户认证' },
      { t: '实战进阶 2/4 · IDE 工具、GitHub、API' },
      { t: '实战进阶 3/4 · 数据库进阶、产品设计、Bug 调试' },
      { t: '实战进阶 4/4 · 综合实战' },
    ]},
    { series: '原课 · 主题课', items: [
      { t: '如何获得产品 idea' },
      { t: '【商业化】做能收钱的海外 AI 产品' },
      { t: '两天 VibeCoding 小班课 · 原课资料包' },
    ]},
    { series: '我的拆解与再设计', items: [
      { t: '课程完整拆解 · 思维导图' },
      { t: '课程框架与两天一夜小班课设计' },
      { t: 'VibeCoding 小班课设计方案' },
      { t: '两天小班课学生讲义 · 案例增强版' },
      { t: '两天小班课详细课程设计' },
    ]},
  ],
});
library.push({
  id: 'aipm-course',
  label: 'AI 产品体系课程（自研）',
  desc: '自己研发并讲授的 AI 产品课程资产——从大纲到逐字稿到视觉样张',
  count: 9,
  words: 0,
  series: [
    { series: '课程大纲（6 节）', items: [
      { t: '01 · AI 产研工作流' },
      { t: '02 · 模型训练原理' },
      { t: '03 · 模型选型方法论' },
      { t: '04 · Claude Code / CLI 工具进阶' },
      { t: '05 · 需求分析与 PRD' },
      { t: '06 · 飞书多维表格 × 面试数据库' },
    ]},
    { series: '课程资产', items: [
      { t: '讲课逐字稿 v2 · 23 节全集' },
      { t: '课程视觉样张 · 12 页' },
      { t: '口播四步法改写样本' },
    ]},
  ],
});
totalItems += 21;

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
// 学习来源书柜：课程类节点（无目录页的纯来源背书，也入图谱）
const COURSES = [
  ['lib-c-liangning1', '产品思维30讲·梁宁'],
  ['lib-c-liangning2', '增长思维·梁宁'],
  ['lib-c-dedao', '经济学课·得到'],
  ['lib-c-liurun', '商业课·刘润'],
  ['lib-c-zhaoyue', '开心领导力·赵越'],
  ['lib-c-philosophy', '通识哲学'],
  ['lib-c-buffett', '巴菲特股东信'],
];
for (const [id, title] of COURSES) {
  graph.nodes.push({ id, title, cat: '收藏', url: '/library/', deg: 2 });
  graph.links.push({ source: 'lib-hub', target: id, w: 1 });
}
// 巴菲特股东信 ↔ 投资概念簇（它是 50 个投资概念的来源）
const invest = graph.nodes.filter((n) => n.cat === '投资概念').sort((a, b) => b.deg - a.deg)[0];
if (invest) graph.links.push({ source: 'lib-c-buffett', target: invest.id, w: 2 });
// 通识哲学 ↔ 哲学概念簇
const philoTop = graph.nodes.filter((n) => n.cat === '哲学概念').sort((a, b) => b.deg - a.deg)[0];
if (philoTop) graph.links.push({ source: 'lib-c-philosophy', target: philoTop.id, w: 2 });

// 藏书阁 ↔ 哲学自有笔记：挂到哲学概念里度数最高的节点
const philo = graph.nodes.filter((n) => n.cat === '哲学概念').sort((a, b) => b.deg - a.deg)[0];
if (philo) graph.links.push({ source: 'lib-hub', target: philo.id, w: 1 });

writeFileSync(GRAPH, JSON.stringify(graph, null, 1));
console.log(`藏书阁：${totalItems} 篇 / ${Math.round(totalWords / 10000)} 万字 · 图谱新增 ${graph.nodes.filter((n) => n.id.startsWith('lib-')).length} 个星团节点`);
