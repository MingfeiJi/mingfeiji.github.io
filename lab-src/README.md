# /lab WebGL 粒子实验室（源码）

activetheory 风格的 React + Three.js + GSAP 粒子站，作为主站 `/lab/` 子路由。

## 改内容
- `src/data.ts` — 项目/实验/导航数据
- `src/App.tsx` — 姓名/品牌/坐标/邮箱等硬编码文案
- `src/ParticleStage.tsx` — 粒子舞台（Three.js，谨慎改）

## 构建并部署到主站
```
npm install
npm run build            # 产物在 dist/，vite base 已设为 /lab/
cp -R dist/* ../public/lab/
```
然后在主站根目录 `npm run build && git push` 即可。
