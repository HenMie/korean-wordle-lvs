#!/bin/sh

# 生成运行时配置文件
# 这允许用户在运行容器时通过环境变量注入配置，而不是构建时

cat > /usr/share/nginx/html/config.js << EOF
// 运行时配置（由 docker-entrypoint.sh 生成）
window.__RUNTIME_CONFIG__ = {
  UMAMI_WEBSITE_ID: "${REACT_APP_UMAMI_WEBSITE_ID:-}",
  UMAMI_SRC: "${REACT_APP_UMAMI_SRC:-https://cloud.umami.is/script.js}",
  UMAMI_API_URL: "${REACT_APP_UMAMI_API_URL:-}",
  UMAMI_API_TOKEN: "${REACT_APP_UMAMI_API_TOKEN:-}",
  ADMIN_USERNAME: "${REACT_APP_ADMIN_USERNAME:-}",
  ADMIN_PASSWORD: "${REACT_APP_ADMIN_PASSWORD:-}"
};
EOF

echo "✅ Runtime config generated"

# 启动 supervisord
exec supervisord -c /etc/supervisord.conf

