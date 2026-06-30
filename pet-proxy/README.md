# pet-proxy · AI 数字分身后端代理

静态站（GitHub Pages）不能安全持有 DeepSeek 密钥。这个最小 Vercel 函数替前端持有密钥、调用 DeepSeek，并对 `mingfeiji.github.io` 开放 CORS。前端只调本函数，**永不接触密钥**。

## 云端部署（全程网页，无需本地命令）

1. 打开 **https://vercel.com** → 用 GitHub 登录。
2. **Add New → Project** → 导入仓库 `MingfeiJi/mingfeiji.github.io`。
3. 配置项目：
   - **Root Directory** 选 `pet-proxy`（关键！只部署这个子目录）。
   - Framework Preset 选 **Other**，Build/Output 留空。
4. 展开 **Environment Variables**，添加：

   | Name | Value |
   |---|---|
   | `DEEPSEEK_API_KEY` | 你的 DeepSeek 密钥（建议先去 DeepSeek 控制台**轮换一个新的**再填，旧的曾在对话明文出现） |

5. **Deploy** → 部署完成后拿到形如 `https://xxx.vercel.app` 的地址。
6. 把 `https://xxx.vercel.app/api/pet` 发给我，我直接写进站点（**端点 URL 不是机密**，只有密钥是机密，密钥只在 Vercel 里），再 build + push，线上宠物即接入真·AI。

> 未接端点时，宠物自动跑"演示人格"（站内事实问答，零密钥暴露）。

## 本地联调（可选，给开发者）

`dev-proxy.py` 是与本函数等价的本地流式代理，仅供本地测试：
```bash
export $(grep -v '^#' ~/.config/mfj/secrets.env | xargs)
python3 pet-proxy/dev-proxy.py    # http://localhost:8787/api/pet
```

## 接口

`POST /api/pet`，body：`{ "messages": [{ "role": "user", "content": "..." }] }`
返回：`{ "reply": "..." }`。系统人格与事实底座见 `api/pet.js`（只复述站内既有脱敏事实，禁编造）。
