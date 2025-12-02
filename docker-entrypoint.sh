#!/bin/sh

# 转义 .env 值中的特殊字符，避免 dotenv 解析失败
escape_env_value() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g; s/\$/\\$/g; s/`/\\`/g'
}

# 使用 Node.js 生成 JSON 安全的字符串字面量
json_escape() {
  node -e 'process.stdout.write(JSON.stringify(process.argv[1] ?? ""))' -- "$1"
}

# 生成运行时配置文件（前端）
UMAMI_WEBSITE_ID_JSON=$(json_escape "${REACT_APP_UMAMI_WEBSITE_ID:-}")
UMAMI_SRC_JSON=$(json_escape "${REACT_APP_UMAMI_SRC:-https://cloud.umami.is/script.js}")

cat > /usr/share/nginx/html/config.js << EOF
// 运行时配置（由 docker-entrypoint.sh 生成）
window.__RUNTIME_CONFIG__ = {
  UMAMI_WEBSITE_ID: $UMAMI_WEBSITE_ID_JSON,
  UMAMI_SRC: $UMAMI_SRC_JSON
};
EOF

echo "✅ Frontend runtime config generated"

# 生成后端环境变量文件
REACT_APP_UMAMI_WEBSITE_ID_ESC=$(escape_env_value "${REACT_APP_UMAMI_WEBSITE_ID:-}")
UMAMI_API_URL_ESC=$(escape_env_value "${UMAMI_API_URL:-}")
UMAMI_API_TOKEN_ESC=$(escape_env_value "${UMAMI_API_TOKEN:-}")
ADMIN_USERNAME_ESC=$(escape_env_value "${ADMIN_USERNAME:-}")
ADMIN_PASSWORD_ESC=$(escape_env_value "${ADMIN_PASSWORD:-}")

cat > /app/server/.env << ENVFILE
NODE_ENV="production"
PORT="3001"
REACT_APP_UMAMI_WEBSITE_ID="$REACT_APP_UMAMI_WEBSITE_ID_ESC"
UMAMI_API_URL="$UMAMI_API_URL_ESC"
UMAMI_API_TOKEN="$UMAMI_API_TOKEN_ESC"
ADMIN_USERNAME="$ADMIN_USERNAME_ESC"
ADMIN_PASSWORD="$ADMIN_PASSWORD_ESC"
ENVFILE

echo "✅ Backend environment configured"

# 启动 supervisord
exec supervisord -c /etc/supervisord.conf

