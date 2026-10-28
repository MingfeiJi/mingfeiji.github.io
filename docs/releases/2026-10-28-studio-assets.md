# V2 数字作品室 · 来源与实现

状态：V2 已提交公网预览，供用户确认实际访问效果后随作品站发版。未修改 mingteck.com。

用户明确要求把自己 mingteck.com 项目中的三维模型等整合到个人作品站。本次使用公开可访问的原作与截图，不新增第三方替代模型。

| 作品 | 来源 | 本次处理 |
| --- | --- | --- |
| Bloom 芍药 | https://mingteck.com/flower | 直接在本站渲染同一 GLB，支持绽放、环绕、自然／玻璃／宣纸；保留完整原作入口 |
| 芍药 GLB | https://mingteck.com/atlas-experience/models/peony.glb | 保存到 `public/models/peony.glb`，3,551,220 bytes；SHA-256 `471442eda7ea3973ef00c1dbd49e315ba37c7b98968fe345a920a1880ab17802` |
| World Atlas | https://mingteck.com/atlas | 展示本次原站实景截图，点击打开完整三维地图 |
| 沿途 YANTU | https://mingteck.com/web | 展示本次真实规划界面截图，点击进入原站产品 |

GLB 检查：114 个 mesh，其中 103 个含 morph targets；Bloom 形变 0 为闭合，1 为绽放。无必需压缩扩展。原作说明记载 Blender 建模；玻璃和宣纸为基于同一模型的 Web 艺术材质。

来源代码仅参考花朵渲染逻辑（源项目 `codex/world-atlas-release-20261003` 分支 `world-atlas-ai/frontend/src/flower/FlowerScene.tsx`）。本站使用独立的原生 Three.js 组件，无 React 运行时、第三方 CDN 或原站 iframe。未复制源项目的配置、凭证、后台接口或非公开数据。

## 页面与性能

- 新增 `/studio/`：深绿、米白、暖金色；字体沿用站内 Instrument Serif、Noto Serif SC 和 JetBrains Mono。
- 首页首屏按钮与导航可进入作品室，首屏后增加可交互模型；职业概览增加作品室链接。
- 模型在进入视口附近时加载，按交互重绘；离开视口或切换到后台时停止绽放动画。
- 不自动播放模型动画；尊重 reduced-motion，播放操作改为直接切换开闭状态。
- 加载失败提供原作截图和文字提示，页面始终保留原作链接。滑块、播放、复位与材质按钮支持键盘。
- 地图与旅行规划只展示截图和原站入口。本次没有独立复制或验证旅行规划后端，也未宣称真实订单、用户增长或营收成果。

## 版本

- V1 简历更新检查点：`44e8988cc891912ff5c7306dcaa705de0a5152d0`。
- V2 在 V1 基础上加入以上作品；本地构建和交互验证结果见审阅目录。
