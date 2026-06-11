// 档案柜清单生成：备份目录顶层文档名 → 脱敏列表（站上仅展示名称，不展示内容）
// 排除：4-30 备份（他人文件，整目录不收）、课程类（藏书阁单独分类）、同名多版本（留一）
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BK = '/Users/temptrip/Library/Mobile Documents/iCloud~md~obsidian/Documents/知识库-鸣老师/raw/backups';
const OUT = new URL('../src/data/archive-list.json', import.meta.url).pathname;
const EXT = new Set(['.html', '.pdf', '.docx', '.pptx', '.md', '.xlsx']);
const EXCLUDE = /实战进阶|VibeCoding|刘小排|如何获得产品idea|做能收钱|视觉样张|哲学对话整理|两天.*小班课/;

const seen = new Set();
const items = [];
for (const bk of ['Downloads-2026-06-10', 'Downloads-2026-05-25', 'Downloads-2026-05-09']) {
  let files;
  try { files = readdirSync(join(BK, bk)); } catch { continue; }
  for (const f of files.sort()) {
    const dot = f.lastIndexOf('.');
    if (dot < 1) continue;
    const ext = f.slice(dot).toLowerCase();
    if (!EXT.has(ext)) continue;
    if (EXCLUDE.test(f)) continue;
    try { if (!statSync(join(BK, bk, f)).isFile()) continue; } catch { continue; }
    let name = f.slice(0, dot)
      .replace(/TripFlow/gi, '中台')
      .replace(/携程/g, '大厂')
      .replace(/纪鸣飞/g, '')
      .replace(/-[0-9a-f]{10,}$/, '')
      .replace(/\s*\(\d+\)$/, '')
      .trim()
      .replace(/^[-_·\s]+|[-_·\s]+$/g, '');
    if (!name || seen.has(name)) continue;
    seen.add(name);
    items.push({ n: name, e: ext.slice(1) });
  }
}
writeFileSync(OUT, JSON.stringify({ items, count: items.length }, null, 1));
console.log('档案柜：', items.length, '项（已排除课程/他人文件/重复版本）');
