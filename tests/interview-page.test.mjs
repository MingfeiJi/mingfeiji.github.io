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

test('interview page separates proof and provides verifiable artifacts', () => {
  assert.equal((html.match(/class="metric-card/g) || []).length, 4);
  assert.match(html, /已兑现结果/);
  assert.match(html, /在途目标/);
  assert.match(html, /查看架构/);
  assert.match(html, /查看产品形态/);
  assert.match(html, /查看用户旅程/);
  assert.match(html, /我负责/);
  assert.match(html, /问题/);
  assert.match(html, /决策/);
  assert.match(html, /结果/);
});
