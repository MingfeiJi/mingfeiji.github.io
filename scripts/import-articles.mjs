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
  let cleaned = raw.replace(/\[\[([^\]|]+)(\|([^\]]+))?\]\]/g, (_, a, __, b) => b || a);
  // 公开站脱敏：公司真名 → 通用描述
  cleaned = cleaned
    .replace(/在携程独自研究/g, '在大厂独自研究')
    .replace(/在携程通过合规审核/g, '在我们公司通过合规审核')
    .replace(/携程/g, '大厂')
    .replace(/vidaXL|荷贝/g, '某跨境电商')
    .replace(/北京更好玩科技?/g, '某AI初创');
  writeFileSync(join(DEST, `${slug}.md`), cleaned);
  console.log(`${slug}  ←  ${f}`);
}
console.log(`\n共导入 ${n} 篇`);
