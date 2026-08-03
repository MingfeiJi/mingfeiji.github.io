import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../dist/interview/index.html', import.meta.url), 'utf8');

test('interview page exposes the interview decision journey', () => {
  assert.match(html, /AI 产品架构师/);
  assert.match(html, /3 分钟看旗舰案例/);
  assert.match(html, /data-proof="realized"/);
  assert.match(html, /data-proof="target"/);
  assert.match(html, /id="flagship"/);
  assert.match(html, /id="cases"/);
  assert.match(html, /id="method"/);
  assert.match(html, /id="about"/);
});

test('interview page stays focused and lightweight', () => {
  assert.doesNotMatch(html, /theme-fab/);
  assert.doesNotMatch(html, /<iframe/i);
  assert.doesNotMatch(html, /three\.module|three\.min/i);
  assert.match(html, /mailto:1966315939@qq\.com/);
  assert.match(html, /github\.com\/MingfeiJi/);
});
