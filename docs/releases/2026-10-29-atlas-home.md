# 首页优先展示 World Atlas

根据用户对首页作品区的反馈，将三维城市地图设为首要展示作品。首页原 Bloom 区块替换为 World Atlas，Bloom 的绽放与材质交互仍保留在 `/studio/`。

## 交互与展示

- 默认显示东京塔街区，提供巴黎埃菲尔铁塔街区、地球切换。
- 使用原站 GLB，在本站实时渲染；支持拖动环绕、缩放、线框／材质切换、视角复位。
- 地图区域进入视口至少 5% 才加载，避免城市模型与首屏背景争抢下载；未选择的场景不下载。按交互重绘，不持续运行动画。模型按会话缓存，快速切换以最新选择为准。
- 冷蓝色空间舞台配暖色建筑，地图约占桌面区块三分之二；手机按文字与地图纵向排列。
- 修复首页顶部导航文字挤压换行，宽度不足时可横向滚动。
- 保留完整地图原作入口与 OpenStreetMap 数据署名。城市为局部艺术建模；沿用原作地理位置，建筑高度和细节不声明为测绘精度。

## 公开原作与文件校验

原作：https://mingteck.com/atlas。以下文件本轮从原站公开静态路径下载，城市文件 SHA-256 与公开 `data/city-models.json` 一致。只复制这三项模型，不包含后台或配置。

| 本站文件 | 原站路径（https://mingteck.com/atlas-experience 下） | bytes | SHA-256 |
| --- | --- | ---: | --- |
| public/models/atlas/earth.glb | /models/earth.glb | 543588 | 85cc86ae63bc3972a403908f29ccb171a888125d4d7ebcdbe867041798f621bf |
| public/models/atlas/paris.glb | /models/v2/cities/paris.glb | 8958284 | 11d0b48276a3fadd381d668b8e0f232ddaae77270a17faa5421014ef2b6e0a8f |
| public/models/atlas/tokyo.glb | /models/v2/cities/tokyo.glb | 16109008 | 756c28152d73250a098273ac7bf212cb7e16283c49ff31b5ee2caf93e1419817 |

原作数据署名：© OpenStreetMap contributors，ODbL 1.0。详见 https://www.openstreetmap.org/copyright 。

## 发布边界

变更进入现有 PR #2 供预览与审阅；用户确认后才合并到 main、替换正式网站。mingteck.com 不变。

## 三主题与曜黑玻璃默认首页

- 参考 GitHub `agent/site-redesign` 分支的 `acd5aadf`（收敛三主题并加入水波交互）。保留曜黑玻璃、星辰大海、水波墨境；恢复该版本的 WaterRipple 和主题 CSS 差异，未覆盖当前简历内容。
- HTML 首次绘制即 `data-theme="klein"`；新主题偏好使用 `mfj-theme-v3`，没有新偏好时默认曜黑玻璃，用户选择后刷新保持。localStorage 不可用时仍正常显示默认主题。
- 曜黑玻璃沿用仓库原 `klein-fx.html` 的 Mux 光影视频，转为本站 H.264 MP4（960×672 / 24 fps / 约 14 秒），685,149 bytes；JPEG 首帧 31,366 bytes。原下载的 720p 视频 2,136,789 bytes，压缩后视频减少约 68%。MP4 的 moov 在 mdat 前，支持渐进播放。
- 去除 HLS 播放器 CDN 与外部视频流依赖；减少动态效果／节省流量时仅显示首帧。普通模式自动静音播放，页面后台、离开首屏即暂停。
- BaseV2 不再创建被隐藏的 Cosmos Three.js 背景；星辰主题只保留页面自己的星空。旧布局的 Cosmos 改为选中星辰主题才动态导入，隐藏时暂停。

## 本轮验证

- Astro 构建 160 页通过，134 项站内链接／锚点／静态资源检查通过；git diff --check 通过。
- 浏览器验证三场景、线框开关、复位；桌面和 390px 手机宽度无横向溢出。
- 三主题切换、切回曜黑与刷新记忆通过；默认页无隐藏 Cosmos canvas。
- 减少动态效果环境：首帧正常显示，video src 为空，不下载 MP4。
- 使用同一背景 HTML 的本地临时测试页模拟普通动效偏好：视频 readyState=4、paused=false、无媒体错误；本机首次 loadeddata 165ms。此值仅为 localhost 单次检查，不代表公网或手机网络延迟。
- 正式 main 尚未发布，最终仍需用户确认预览。

## 产品区作品入口调整

- 根据用户截图，将首页 `#products` 的编排器和奶糖卡片替换为 mingteck.com 的 World Atlas、沿途 YANTU、Bloom 三项作品，地图优先。
- 使用已核对的原站实景截图，每张卡片直接打开原站 `/atlas`、`/web`、`/flower`；移除原区块的 DeepSeek 宣传与 LIVE 标记。旧产品页面不删除。
- 首页与 `/v2/` 同步，桌面三列、窄屏单列；图片延迟加载，预留比例，保持曜黑玻璃和三主题样式。
