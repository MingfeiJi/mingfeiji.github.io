// 公开站脱敏：替换词表不入仓（公开仓明文映射会让脱敏被反查）。
// 词表在本机 ~/.config/mfj/redact-map.json，格式 { rules: [{pattern, replace}] }。
// 找不到词表时报错退出——宁可导入失败，不可漏脱敏。
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const MAP_PATH = process.env.MFJ_REDACT_MAP || join(homedir(), '.config/mfj/redact-map.json');

let rules;
try {
  rules = JSON.parse(readFileSync(MAP_PATH, 'utf8')).rules;
} catch (e) {
  console.error(`[redact] 读取脱敏词表失败: ${MAP_PATH}\n宁可失败不可漏脱敏，已中止。`);
  process.exit(1);
}

export function redact(text) {
  let out = text;
  for (const r of rules) out = out.replace(new RegExp(r.pattern, 'g'), r.replace);
  return out;
}
