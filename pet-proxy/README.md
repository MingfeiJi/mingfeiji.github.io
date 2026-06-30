# pet-proxy · AI 数字分身后端代理

静态站（GitHub Pages）不能安全持有 DeepSeek 密钥。这个最小 Vercel 函数替前端持有密钥、调用 DeepSeek，并对 `mingfeiji.github.io` 开放 CORS。前端只调本函数，**永不接触密钥**。

## 部署（一次性，约 2 分钟）

```bash
cd pet-proxy
npx vercel            # 首次会让你登录 + 选项目；一路默认即可
npx vercel --prod     # 部署到生产，拿到 https://<project>.vercel.app
```

## 配置密钥（在 Vercel，不写进仓库）

在 Vercel 控制台 → 项目 → Settings → Environment Variables 添加：

| Name | Value |
|---|---|
| `DEEPSEEK_API_KEY` | 你的 DeepSeek 密钥（本机存于 `~/.config/mfj/secrets.env`） |

或命令行：
```bash
npx vercel env add DEEPSEEK_API_KEY production
# 粘贴密钥，回车
npx vercel --prod     # 重新部署使其生效
```

> 建议上线后在 DeepSeek 控制台**轮换一次**密钥（旧密钥曾在对话明文出现），新密钥只填到这里。

## 把端点接到站点

部署后拿到形如 `https://pet-proxy-xxx.vercel.app/api/pet` 的地址，写进站点构建环境变量：

```bash
# ~/sites/mingfeiji-site/.env （已被 .gitignore 忽略）
PUBLIC_PET_ENDPOINT=https://pet-proxy-xxx.vercel.app/api/pet
```

重新 `npm run build && git push` 后，线上宠物即接入真·AI。
未设置该变量时，宠物自动回落到"演示人格"（站内事实问答，零密钥暴露）。

## 接口

`POST /api/pet`，body：`{ "messages": [{ "role": "user", "content": "..." }] }`
返回：`{ "reply": "..." }`。系统人格与事实底座见 `api/pet.js`（只复述站内既有脱敏事实，禁编造）。
