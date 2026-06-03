#!/bin/bash
# ==========================================
# AI 分镜脚本生成系统 - 一键部署脚本
# 服务器：腾讯云 Ubuntu 24.04 | IP: 124.222.0.183
# ==========================================
set -e

echo "========================================"
echo " AI 分镜脚本生成系统 - 部署启动"
echo " 目标: http://124.222.0.183"
echo "========================================"

# 1. 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "[1/5] 安装 Docker..."
    curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://mirrors.aliyun.com/docker-ce/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    sudo systemctl enable docker --now
    sudo usermod -aG docker $USER
    echo "✓ Docker 安装完成（请重新登录使 docker 组生效）"
else
    echo "[1/5] Docker 已安装 ✓"
fi

# 2. 检查配置文件
if [ ! -f .env.production ]; then
    echo "[!] 错误：缺少 .env.production 文件"
    echo "    请复制 .env.production 并填入真实的 DEEPSEEK_API_KEY"
    exit 1
fi

if grep -q "sk-your-key-here" .env.production; then
    echo "[!] 警告：DEEPSEEK_API_KEY 仍是默认值，请编辑 .env.production"
fi

echo "[2/5] 配置文件检查完成 ✓"

# 3. 停止旧容器
echo "[3/5] 停止旧容器..."
docker compose down 2>/dev/null || true

# 4. 构建并启动
echo "[4/5] 构建镜像并启动（首次约 3-5 分钟）..."
docker compose up -d --build

# 5. 等待就绪
echo "[5/5] 等待服务就绪..."
sleep 5

if curl -s -o /dev/null -w "%{http_code}" http://localhost:80 | grep -q 200; then
    echo ""
    echo "========================================"
    echo " ✅ 部署成功！"
    echo " 访问地址: http://124.222.0.183"
    echo "========================================"
else
    echo ""
    echo "========================================"
    echo " ⚠ 服务启动中，请稍后访问"
    echo " 查看日志: docker compose logs -f app"
    echo "========================================"
fi
