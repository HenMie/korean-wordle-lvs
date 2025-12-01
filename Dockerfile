# ==========================================
# Stage 1: Build Frontend
# ==========================================
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci --legacy-peer-deps

# 复制源代码
COPY . .

# 构建生产版本（WebSocket 使用相对路径，通过 nginx 代理）
# 注意：Umami 配置在运行时通过 config.js 注入，不在构建时烘焙
RUN npm run build

# ==========================================
# Stage 2: Build Backend Dependencies
# ==========================================
FROM node:20-alpine AS backend-builder

WORKDIR /app/server

# 复制 server 目录的 package 文件
COPY server/package*.json ./

# 安装生产依赖
RUN npm ci --only=production

# ==========================================
# Stage 3: Production
# ==========================================
FROM node:20-alpine AS production

# 安装 nginx 和 supervisor
RUN apk add --no-cache nginx supervisor

# 创建必要的目录
RUN mkdir -p /var/log/supervisor /run/nginx /var/log/nginx

# 复制 nginx 配置（覆盖默认配置）
COPY nginx.conf /etc/nginx/http.d/default.conf

# 确保 nginx 主配置包含 http.d 目录
RUN sed -i 's|include /etc/nginx/http.d/\*.conf;|include /etc/nginx/http.d/*.conf;|g' /etc/nginx/nginx.conf || true

# 复制前端构建产物
COPY --from=frontend-builder /app/build /usr/share/nginx/html

# 复制后端代码和依赖
WORKDIR /app/server
COPY server/ ./
COPY --from=backend-builder /app/server/node_modules ./node_modules

# 复制词库（供 PVP 服务器使用）
COPY src/assets /app/src/assets

# 复制 supervisord 配置
COPY supervisord.conf /etc/supervisord.conf

# 暴露端口（只需要 80）
EXPOSE 80

# 复制启动脚本
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=10s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

# 使用启动脚本（生成运行时配置后启动 supervisord）
CMD ["/docker-entrypoint.sh"]
