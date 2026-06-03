# ==========================================
# AI 分镜脚本生成系统 - 生产级 Docker 镜像
# 目标：腾讯云 Ubuntu 24.04 | IP: 124.222.0.183
# ==========================================

# ---- Stage 1: 依赖安装 ----
FROM node:20-alpine AS deps
WORKDIR /app

# 使用淘宝镜像加速（国内服务器必备）
RUN npm config set registry https://registry.npmmirror.com

COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# ---- Stage 2: 构建 ----
FROM node:20-alpine AS builder
WORKDIR /app

RUN npm config set registry https://registry.npmmirror.com

COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force

COPY . .
RUN npm run build

# ---- Stage 3: 运行时 ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3000 || exit 1

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
