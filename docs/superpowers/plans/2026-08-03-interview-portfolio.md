# AI 产品架构师 / FDE 面试作品集 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新建 `/interview/` 独立页面，让面试官在 30 秒内理解定位、3 分钟内看完旗舰案例，并可继续验证原型、架构和联系方式。

**Architecture:** 保留现有 Astro 静态站结构，新增一个专属布局、一个页面、一个隔离样式表和一个轻量水波组件。页面不导入首页的 Cosmos、Three.js、iframe 或主题系统；通过 Node 内置测试校验构建产物和水波节流逻辑。

**Tech Stack:** Astro 5、原生 CSS、Canvas 2D、原生 JavaScript、Node `node:test`、GitHub Pages、Vercel。

## Global Constraints

- 页面路径固定为 `/interview/`，不得覆盖 `/`。
- 目标岗位固定为“AI 产品架构师 / Forward Deployed Engineer”。
- 首屏固定包含价值主张、四个已兑现指标、“3 分钟看旗舰案例”和“联系我 / 获取完整简历”。
- 已兑现结果与在途目标必须分区呈现。
- 不新增数据库、后台、iframe、Three.js 或主题切换。
- 页面使用 Apple 编辑式暗色风格，但不复制 Apple 资产或页面结构。
- 鼠标划过产生中等强度冷蓝细波，点击产生双层扩散水波；触屏和减少动态效果可用。
- 外部项目在新标签页打开，键盘焦点可见。
- 新页面不得改变现有首页和其他静态路由。

---

## File Structure

- Create `src/pages/interview/index.astro`：页面内容、语义结构、证据链接和少量页面内行为。
- Create `src/layouts/Interview.astro`：独立 head、导航、页脚、阅读进度和水波挂载。
- Create `src/components/interview/InterviewRipple.astro`：Canvas 初始化、指针事件、渲染循环和降级策略。
- Create `src/lib/interview-ripple.js`：可测试的水波节流、速度和强度计算。
- Create `src/styles/interview.css`：只作用于 `.interview-page` 的视觉、响应式、焦点和减少动态效果规则。
- Create `tests/interview-page.test.mjs`：验证构建产物的信息架构、内容、链接和禁用项。
- Create `tests/interview-ripple.test.mjs`：验证水波节流和强度边界。
- Modify `package.json`：增加 `test:interview` 脚本，不新增依赖。

---

### Task 1: 建立页面验收测试与最小路由

**Files:**
- Create: `tests/interview-page.test.mjs`
- Create: `src/pages/interview/index.astro`
- Modify: `package.json`

**Interfaces:**
- Consumes: Astro 的静态输出目录 `dist/interview/index.html`。
- Produces: `/interview/` 可构建路由和 `npm run test:interview` 命令。

- [ ] **Step 1: 写构建产物验收测试**

```js
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
```

- [ ] **Step 2: 增加测试脚本**

在 `package.json` 的 `scripts` 中加入：

```json
"test:interview": "node --test tests/interview-page.test.mjs tests/interview-ripple.test.mjs"
```

在水波测试尚未创建前，先临时使用：

```json
"test:interview": "node --test tests/interview-page.test.mjs"
```

- [ ] **Step 3: 运行测试并确认 RED**

Run: `npm run build && npm run test:interview`  
Expected: FAIL，原因是 `dist/interview/index.html` 不存在。

- [ ] **Step 4: 创建最小页面骨架**

```astro
---
import Interview from '../../layouts/Interview.astro';
---

<Interview>
  <div class="interview-page">
    <main>
      <section class="interview-hero" id="top">
        <p>AI 产品架构师 / Forward Deployed Engineer</p>
        <h1>把复杂 AI 能力，做成真正跑起来的业务系统。</h1>
        <a href="#flagship">3 分钟看旗舰案例</a>
        <a href="mailto:1966315939@qq.com">联系我 / 获取完整简历</a>
      </section>
      <section id="flagship" data-proof="realized"></section>
      <section data-proof="target"></section>
      <section id="cases"></section>
      <section id="method"></section>
      <section id="about"></section>
    </main>
  </div>
</Interview>
```

- [ ] **Step 5: 建立最小独立布局并复跑测试**

创建 `src/layouts/Interview.astro`，包含正确的 `lang="zh-CN"`、viewport、页面标题、description、canonical、跳转到主要内容的链接和 `<slot />`。运行：

`npm run build && npm run test:interview`

Expected: PASS，且现有页面继续生成。

- [ ] **Step 6: 提交**

```bash
git add package.json tests/interview-page.test.mjs src/pages/interview/index.astro src/layouts/Interview.astro
git commit -m "test: 建立面试作品集验收路径"
```

---

### Task 2: 完成面试决策信息架构与案例内容

**Files:**
- Modify: `src/pages/interview/index.astro`
- Modify: `tests/interview-page.test.mjs`

**Interfaces:**
- Consumes: 已有原型 URL、邮箱和 GitHub 地址。
- Produces: `#top`、`#flagship`、`#cases`、`#method`、`#about` 五段导航锚点。

- [ ] **Step 1: 扩充失败测试**

在页面测试中加入：

```js
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
```

- [ ] **Step 2: 运行并确认 RED**

Run: `npm run build && npm run test:interview`  
Expected: FAIL，提示缺少指标卡、证据入口和案例字段。

- [ ] **Step 3: 实现完整内容结构**

在页面中使用 Astro 数据数组渲染：

```js
const realizedMetrics = [
  { value: '¥百万级', label: '智能客服年化降本' },
  { value: '68% → 84%', label: '客户满意度' },
  { value: '65% → 87%', label: 'AIGC 生图采纳率' },
  { value: '+60%', label: '制造业核心流程效率' },
];

const artifactLinks = [
  { label: '查看架构', href: '/prototypes/tripflow-arch.html' },
  { label: '查看产品形态', href: '/prototypes/tripflow-product-form.html' },
  { label: '查看用户旅程', href: 'https://mingfeiji.github.io/tripflow-experience-map/' },
];
```

旗舰案例必须覆盖业务背景、约束、研究洞察、用户旅程、系统方案、关键取舍、已兑现结果、在途目标、“我负责”和证据链接。辅助案例使用“问题—决策—结果—证据”四段式。

- [ ] **Step 4: 复跑测试**

Run: `npm run build && npm run test:interview`  
Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add src/pages/interview/index.astro tests/interview-page.test.mjs
git commit -m "feat: 构建面试官三分钟决策旅程"
```

---

### Task 3: 实现 Apple 编辑式视觉和响应式布局

**Files:**
- Create: `src/styles/interview.css`
- Modify: `src/layouts/Interview.astro`
- Modify: `src/pages/interview/index.astro`

**Interfaces:**
- Consumes: `.interview-page` 根节点与各语义区块。
- Produces: `interview-*` 样式命名空间、桌面与 390px 移动端布局。

- [ ] **Step 1: 给页面补齐稳定样式钩子**

所有新增类使用 `interview-` 前缀；指标卡保留 `metric-card` 作为验收钩子。布局导入：

```astro
---
import '../styles/interview.css';
---
```

- [ ] **Step 2: 实现视觉令牌和布局**

在 `interview.css` 定义：

```css
.interview-page {
  --interview-bg: #050505;
  --interview-surface: rgba(255,255,255,.055);
  --interview-text: #f5f5f7;
  --interview-muted: #a1a1a6;
  --interview-blue: #2997ff;
  color: var(--interview-text);
  background: var(--interview-bg);
}
```

完成悬浮胶囊导航、最大 1200px 内容宽度、最大 760px 阅读宽度、超大标题、四列指标、案例分段、证据按钮、轻量卡片和底部联系区。

- [ ] **Step 3: 实现移动端和可访问状态**

在 `@media (max-width: 760px)` 下将导航、指标、案例和证据链接改为单列；确保 390px 无横向滚动。加入：

```css
.interview-page :focus-visible {
  outline: 2px solid var(--interview-blue);
  outline-offset: 4px;
}

@media (prefers-reduced-motion: reduce) {
  .interview-page *, .interview-page *::before, .interview-page *::after {
    scroll-behavior: auto !important;
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

- [ ] **Step 4: 构建验证**

Run: `npm run build && npm run test:interview && git diff --check`  
Expected: 全部退出码 0。

- [ ] **Step 5: 提交**

```bash
git add src/styles/interview.css src/layouts/Interview.astro src/pages/interview/index.astro
git commit -m "style: 打造编辑式暗色面试作品集"
```

---

### Task 4: 通过 TDD 实现中等强度水波

**Files:**
- Create: `tests/interview-ripple.test.mjs`
- Create: `src/lib/interview-ripple.js`
- Create: `src/components/interview/InterviewRipple.astro`
- Modify: `src/layouts/Interview.astro`
- Modify: `package.json`

**Interfaces:**
- Produces: `computeRippleInput({ distance, elapsed, kind }) -> { shouldSpawn, strength, radius }`。
- Consumes: `pointermove` 和 `pointerdown` 的距离、间隔与事件类型。

- [ ] **Step 1: 写失败的水波逻辑测试**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { computeRippleInput } from '../src/lib/interview-ripple.js';

test('pointer movement is throttled for small or rapid moves', () => {
  assert.equal(computeRippleInput({ distance: 8, elapsed: 60, kind: 'move' }).shouldSpawn, false);
  assert.equal(computeRippleInput({ distance: 30, elapsed: 20, kind: 'move' }).shouldSpawn, false);
});

test('medium movement produces bounded subtle ripples', () => {
  const result = computeRippleInput({ distance: 60, elapsed: 60, kind: 'move' });
  assert.equal(result.shouldSpawn, true);
  assert.ok(result.strength >= 0.35 && result.strength <= 0.9);
  assert.ok(result.radius >= 90 && result.radius <= 180);
});

test('click produces a stronger but bounded ripple', () => {
  assert.deepEqual(computeRippleInput({ distance: 0, elapsed: 0, kind: 'down' }), {
    shouldSpawn: true,
    strength: 1.15,
    radius: 230,
  });
});
```

- [ ] **Step 2: 运行并确认 RED**

Run: `node --test tests/interview-ripple.test.mjs`  
Expected: FAIL，提示 `src/lib/interview-ripple.js` 不存在。

- [ ] **Step 3: 写最小计算模块**

```js
export function computeRippleInput({ distance, elapsed, kind }) {
  if (kind === 'down') return { shouldSpawn: true, strength: 1.15, radius: 230 };
  if (distance <= 12 || elapsed < 42) return { shouldSpawn: false, strength: 0, radius: 0 };
  const speed = Math.min(2, distance / Math.max(elapsed, 1));
  return {
    shouldSpawn: true,
    strength: Math.min(0.9, 0.38 + speed * 0.34),
    radius: Math.min(180, 92 + speed * 70),
  };
}
```

- [ ] **Step 4: 运行并确认 GREEN**

Run: `node --test tests/interview-ripple.test.mjs`  
Expected: 3 tests PASS。

- [ ] **Step 5: 实现 Canvas 组件**

组件必须：

- 使用 `#interview-ripple` 全屏 Canvas。
- DPR 上限 1.5。
- 划过时调用 `computeRippleInput`，点击时生成 230px 主波并在约 110ms 后生成较小次波。
- 使用 `screen` / `lighter` 合成冷蓝、蓝紫和白色高光。
- 同时保留最多 24 个 ripple、16 个 wake。
- 页面隐藏时暂停；`prefers-reduced-motion` 下不注册连续移动效果。
- Canvas 使用 `pointer-events:none`，内容层高于 Canvas。

- [ ] **Step 6: 挂载组件并完成测试脚本**

在布局中渲染 `<InterviewRipple />`，将 `test:interview` 更新为同时运行两个测试文件。

- [ ] **Step 7: 完整验证与提交**

Run: `npm run build && npm run test:interview && git diff --check`  
Expected: 全部退出码 0。

```bash
git add package.json tests/interview-ripple.test.mjs src/lib/interview-ripple.js src/components/interview/InterviewRipple.astro src/layouts/Interview.astro
git commit -m "feat: 加入面试页冷蓝水波交互"
```

---

### Task 5: 浏览器验收、提交与发布

**Files:**
- Modify only if verification finds a defect: interview page files above.

**Interfaces:**
- Consumes: 本地 Astro dev server 和最终静态构建。
- Produces: 可访问的 GitHub 分支更新和 Vercel 预览 URL。

- [ ] **Step 1: 启动开发服务器**

Run: `npm run dev -- --host 127.0.0.1`  
Expected: 输出健康的本地 URL。

- [ ] **Step 2: 桌面端浏览器验证**

验证：

- 首屏能看见岗位、价值主张、四项结果和两个 CTA。
- “3 分钟看旗舰案例”跳到 `#flagship`。
- 阅读进度随滚动更新。
- 鼠标划过出现细波，点击出现双层水波，按钮仍可点击。
- 架构、产品形态、用户旅程、邮箱和 GitHub 链接正确。
- 控制台无页面错误。

- [ ] **Step 3: 390×844 移动端验证**

验证：

- 无横向滚动。
- 首屏主 CTA 在首屏或一次自然滚动内可见。
- 导航可用、文字不截断、指标与案例为单列。
- 触屏点击不会被 Canvas 拦截。

- [ ] **Step 4: 最终自动化验证**

Run: `npm run build && npm run test:interview && git diff --check && git status --short`  
Expected: 构建成功、全部测试通过、无 whitespace error，只包含计划内修改。

- [ ] **Step 5: 提交验证修复**

若浏览器验证产生修复：

```bash
git add src/pages/interview/index.astro src/layouts/Interview.astro src/components/interview/InterviewRipple.astro src/lib/interview-ripple.js src/styles/interview.css tests package.json
git commit -m "fix: 完善面试页响应式与可访问体验"
```

- [ ] **Step 6: 推送并部署预览**

- 推送 `agent/site-redesign` 到现有 GitHub PR 分支。
- 将当前构建部署到 Vercel 项目 `mingfeiji-vibe-site`。
- 核对部署状态为 `READY`，并返回 `/interview/` 预览 URL。

