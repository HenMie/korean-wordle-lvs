#!/usr/bin/env node
/**
 * 版本同步脚本
 * 将 package.json 中的版本号同步到其他配置文件
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');
const dockerComposePath = path.join(rootDir, 'docker-compose.yml');

// 读取 package.json 版本
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

console.log(`📦 同步版本号: ${version}`);

// 同步到 docker-compose.yml
if (fs.existsSync(dockerComposePath)) {
  let dockerCompose = fs.readFileSync(dockerComposePath, 'utf8');
  dockerCompose = dockerCompose.replace(
    /app\.version=[\d.]+/g,
    `app.version=${version}`
  );
  fs.writeFileSync(dockerComposePath, dockerCompose);
  console.log(`✅ docker-compose.yml 已更新`);
}

console.log(`🎉 版本同步完成: v${version}`);

