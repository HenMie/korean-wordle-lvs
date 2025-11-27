# ==========================================
# Stage 1: Build
# ==========================================
FROM node:18-alpine AS builder

ARG REACT_APP_SOCKET_SERVER=http://localhost:3001
ENV REACT_APP_SOCKET_SERVER=${REACT_APP_SOCKET_SERVER}

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci --legacy-peer-deps

# 复制源代码
COPY . .

# 构建生产版本
RUN npm run build

# ==========================================
# Stage 2: Production
# ==========================================
FROM nginx:alpine AS production

# 复制自定义 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建产物
COPY --from=builder /app/build /usr/share/nginx/html

# 暴露端口（实际端口由 docker-compose 映射）
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]

