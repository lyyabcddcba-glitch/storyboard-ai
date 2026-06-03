# AI 分镜脚本生成系统 — 部署指南

## 环境变量

| 变量名 | 必填 | 说明 | 获取地址 |
|--------|------|------|---------|
| `DEEPSEEK_API_KEY` | ✅ 是 | DeepSeek 大模型 API 密钥 | https://platform.deepseek.com |

## 部署方式

### 方式一：Docker（推荐，15分钟）

```bash
# 1. 配置密钥
cp .env.example .env.local
# 编辑 .env.local，填入真实的 DEEPSEEK_API_KEY

# 2. 构建并启动
docker compose up -d

# 3. 验证
curl http://localhost:3000/api/storyboard
```

### 方式二：Vercel（免费，最快）

```bash
# 1. 安装并登录
npx vercel login

# 2. 在 Vercel 后台设置环境变量
#    Settings → Environment Variables → 添加 DEEPSEEK_API_KEY

# 3. 部署
npx vercel --prod
```

### 方式三：传统服务器（阿里云/腾讯云）

```bash
# 1. 安装 Node.js 20+
# 2. 克隆项目
# 3. 配置 .env.local
# 4. 构建并启动
npm install
npm run build
npm start
```

## 安全注意事项

- **API Key 绝不写在前端代码中** — 所有 LLM 请求通过 `/api/storyboard/*` 后端路由中转
- `.env.local` 已在 `.gitignore` 中，不会被提交到 Git
- 小程序端：API Key 放在独立的 `utils/config.js` 中（不提交 Git），未来应改为调用后端 API

## 验证部署成功

```bash
# 检查首页
curl -I https://你的域名.com

# 检查 API
curl -X POST https://你的域名.com/api/storyboard \
  -H "Content-Type: application/json" \
  -d '{"theme":"测试","style":"王家卫","shotCount":3}'
```

## 小程序对接

部署后端后，修改 `miniapp/utils/config.js`：

```js
module.exports = {
  deepseekKey: '',  // 清空，不再直连
  apiBaseUrl: 'https://你的域名.com'  // 改为后端地址
}
```

然后修改 `miniapp/pages/storyboard/storyboard.js` 中的 `handleGenerate`，
将 `wx.request` 的 URL 从 `api.deepseek.com` 改为 `apiBaseUrl + '/api/storyboard/stream'`，
并从请求头中移除 `Authorization`（密钥由后端持有）。
