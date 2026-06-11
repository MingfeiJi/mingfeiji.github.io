// 从 Obsidian 公众号草稿导入文章到 src/content/articles/
// 用法：node scripts/import-articles.mjs
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const SRC = '/Users/temptrip/Library/Mobile Documents/iCloud~md~obsidian/Documents/知识库-鸣老师/Writing/公众号/草稿';
const DEST = new URL('../src/content/articles/', import.meta.url).pathname;

rmSync(DEST, { recursive: true, force: true });
mkdirSync(DEST, { recursive: true });

const files = readdirSync(SRC)
  .filter((f) => f.endsWith('.md'))
  .sort();

let n = 0;
for (const f of files) {
  const raw = readFileSync(join(SRC, f), 'utf8');
  if (!raw.startsWith('---')) {
    console.log(`SKIP（无 frontmatter）: ${f}`);
    continue;
  }
  n++;
  const slug = `p${String(n).padStart(3, '0')}`;
  // 移除 Obsidian 专属语法 [[...]] → 纯文本
  const cleaned = raw.replace(/\[\[([^\]|]+)(\|([^\]]+))?\]\]/g, (_, a, __, b) => b || a);
  writeFileSync(join(DEST, `${slug}.md`), cleaned);
  console.log(`${slug}  ←  ${f}`);
}
console.log(`\n共导入 ${n} 篇`);
