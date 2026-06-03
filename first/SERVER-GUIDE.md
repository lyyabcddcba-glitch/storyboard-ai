# 腾讯云 Ubuntu 24.04 部署指南

## 服务器信息

| 项目 | 值 |
|------|-----|
| 公网 IP | 124.222.0.183 |
| 系统 | Ubuntu 24.04 |
| 访问地址 | http://124.222.0.183 |

## 一、首次 SSH 登录

```bash
# 本地电脑打开终端（PowerShell / Terminal）
ssh root@124.222.0.183

# 首次登录会提示指纹确认，输入 yes
# 输入腾讯云控制台设置的 root 密码
```

## 二、上传项目文件

```bash
# 方式A：从本地打包上传（在本地电脑执行）
cd d:\first-cc\first
tar --exclude='node_modules' --exclude='.next' --exclude='.git' -czf deploy.tar.gz .
scp deploy.tar.gz root@124.222.0.183:/root/

# 方式B：如果已用 Git 管理
ssh root@124.222.0.183
git clone <你的仓库地址> /root/storyboard-ai
```

## 三、服务器上解压并部署

```bash
# SSH 登录后
ssh root@124.222.0.183

# 创建项目目录
mkdir -p /root/storyboard-ai && cd /root/storyboard-ai
tar -xzf /root/deploy.tar.gz

# 配置 API Key（必须！）
cp .env.production .env.production.bak
nano .env.production
# 把 sk-your-key-here 替换为你的真实 DeepSeek API Key
# Ctrl+O 保存，Ctrl+X 退出

# 一键部署
chmod +x deploy.sh
./deploy.sh
```

## 四、验证部署

```bash
# 检查容器状态
docker compose ps

# 检查日志
docker compose logs -f app

# 测试访问
curl -I http://localhost:80

# 浏览器打开
# http://124.222.0.183
```

## 五、常用运维命令

```bash
# 查看日志
docker compose logs -f app       # 应用日志
docker compose logs -f nginx     # Nginx 日志

# 重启服务
docker compose restart

# 更新部署（代码改动后）
git pull                          # 拉取最新代码
docker compose up -d --build      # 重新构建

# 停止服务
docker compose down

# 查看资源占用
docker stats
```

## 六、环境变量清单

| 变量名 | 必填 | 位置 | 说明 |
|--------|------|------|------|
| `DEEPSEEK_API_KEY` | ✅ | `.env.production` | DeepSeek API 密钥 |
| `PORT` | 否 | `.env.production` | 应用端口，默认3000 |

## 七、安全建议

1. **启用腾讯云防火墙** — 仅开放 80 端口，SSH 22 端口建议改为密钥登录
2. **定期更新** — `apt update && apt upgrade -y`
3. **监控磁盘** — `df -h` 定期检查
4. **API Key 轮换** — 定期在 DeepSeek 后台生成新 Key
