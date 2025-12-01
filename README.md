# Korean Wordle 韩语猜词游戏

[English](./README_EN.md) | 简体中文

这是 Wordle 游戏的韩语版本。游戏采用随机题目模式，每次开始新游戏都会随机抽取一个单词作为答案，你可以无限次挑战！本游戏仅支持名词和标准语（不含方言或俚语）。

## 游戏模式

### 5 字模式（经典）
标准模式，猜测 5 个韩语字符组成的单词。

| 难度 | 说明 |
|------|------|
| **초급（简单）** | 使用常见词汇，适合初学者 |
| **중급（中等）** | 难度适中，词汇具有一定挑战性 |
| **고급（困难）** | 罕见的高难度词汇，适合高级玩家 |

### 6 字模式
进阶模式，猜测 6 个韩语字符组成的单词，挑战更长的词汇！

| 难度 | 说明 |
|------|------|
| **중급（中等）** | 中等难度的 6 字词汇 |
| **고급（困难）** | 高难度的 6 字词汇 |

> **注意：** 6 字模式不包含简单难度。

## 游戏玩法
1. **选择难度**：从简单、中等或困难中选择。
2. **猜测单词**：输入一个韩语单词并提交。
3. **理解提示**：方块会变色来引导你找到正确答案。
   - <img src="./readme/green_circle.svg" width="11" height="11"/> 绿色：字母正确，位置正确。
   - <img src="./readme/yellow_circle.svg" width="11" height="11"/> 黄色：字母正确，位置错误。
   - <img src="./readme/gray_circle.svg" width="11" height="11"/> 灰色：字母错误。
4. **获胜条件**：在有限的尝试次数内正确猜出单词即可获胜。

更多信息请参阅游戏内的*信息弹窗*。

## 功能特点
- **双模式选择**：支持 5 字模式（经典）和 6 字模式（进阶），满足不同挑战需求。
- **随机题目模式**：每局游戏随机生成答案，可无限次挑战。
- **深色模式**：使用更深的配色方案减少眼睛疲劳，非常适合夜间游戏。
- **色盲模式**：让色盲用户也能无障碍地享受游戏。
- **信息弹窗**：轻松了解游戏规则和技巧。
- **键盘支持**：支持键盘输入。
- **多语言支持**：支持韩语、英语、中文、德语和希腊语。
- **游戏状态保存**：你的游戏进度会自动保存。
- **PVP 对战模式**：与好友（2-10 人）实时对战，支持 5 字和 6 字模式，看谁最快猜出单词！
- **数据统计**：集成 Umami Analytics，追踪游戏数据和用户行为。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 |
| 路由 | React Router DOM v6 |
| 状态管理 | Recoil |
| 样式 | SCSS/Sass, Material UI, Styled Components |
| 图标 | FontAwesome |
| 构建工具 | CRACO (Create React App Configuration Override) |
| SEO | React Helmet |
| 数据统计 | Umami Analytics |
| 部署 | Vercel, Docker |

## Docker 部署

### 前置要求
- Docker
- Docker Compose

### 快速开始

1. **创建配置文件**

```bash
# Linux/Mac
cp env.example .env

# Windows
copy env.example .env
```

2. **配置环境变量**（可选）

编辑 `.env` 文件进行自定义配置：

```ini
# 镜像标签（选项：latest, main, 或特定版本如 1.2.0）
IMAGE_TAG=latest

# 容器名称
CONTAINER_NAME=korean-wordle

# 主机端口映射（通过 http://localhost:HOST_PORT 访问）
HOST_PORT=3000

# 时区
TZ=Asia/Shanghai

# Docker 网络名称
NETWORK_NAME=korean-wordle-network
```

3. **运行容器**

```bash
# 构建镜像并启动容器（前端 + PVP 后端集成在单个容器中）
docker-compose up -d --build

# 查看日志
docker-compose logs -f korean-wordle

# 停止容器
docker-compose down
```

4. **访问应用**

打开浏览器访问：`http://localhost:3000`（或你配置的端口）

### 从 Docker Hub 拉取

Docker Hub：https://hub.docker.com/r/chouann/korean-wordle

```bash
# 拉取最新镜像
docker pull chouann/korean-wordle:latest

# 直接运行（前端 + PVP 后端集成在单个容器中）
docker run -d -p 3000:80 chouann/korean-wordle:latest

# 或使用特定版本
docker pull chouann/korean-wordle:1.2.0
```

> **架构说明：** 镜像已集成前端静态文件服务（Nginx）和 PVP WebSocket 服务器（Node.js），通过 supervisord 管理多进程，只需暴露一个端口即可使用完整功能。

### 自定义域名部署（HTTPS）

如果你要把整套服务部署在自己的域名（例如 `https://koreanwordle.ningriri.cn/`），可以参考以下流程：

1. **启动容器**
   ```bash
   docker-compose up -d --build
   ```

2. **配置外层反向代理**（以 Nginx 为例，假设证书已就绪）
   ```nginx
   server {
       listen 80;
       server_name koreanwordle.ningriri.cn;
       return 301 https://$host$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name koreanwordle.ningriri.cn;
       ssl_certificate     /path/fullchain.pem;
       ssl_certificate_key /path/privkey.pem;

       # 所有请求代理到容器（容器内 Nginx 会处理静态文件和 WebSocket 路由）
       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

完成后访问 `https://koreanwordle.ningriri.cn/` 即可使用完整功能（前端页面与 WebSocket 均经过 HTTPS）。

> **注意：** 由于前端和 WebSocket 已集成在同一容器中，外层反向代理只需配置一个 location 即可，容器内部 Nginx 会自动将 `/socket.io` 请求路由到 Node.js 服务。

### CI/CD 自动构建

本项目使用 GitHub Actions 自动构建并推送 Docker 镜像到 Docker Hub。

**触发条件：**
| 事件 | 镜像标签 |
|------|----------|
| 推送到 main/master | `latest`, `main` |
| 创建标签 `v1.2.0` | `1.2.0`, `1.2`, `latest` |
| Pull Request | 仅构建，不推送 |
| 手动触发 | 基于分支 |

**设置（fork 后）：**
1. 在 [Docker Hub](https://hub.docker.com/) 创建仓库
2. 进入 GitHub 仓库 **Settings** → **Secrets and variables** → **Actions**
3. 添加 secrets：
   - `DOCKERHUB_USERNAME`：你的 Docker Hub 用户名
   - `DOCKERHUB_TOKEN`：Docker Hub 访问令牌（在 Docker Hub 账户设置 → Security 中生成）

### 版本管理

本项目使用自动化版本管理。发布新版本：

```bash
# 补丁版本 (1.1.1 → 1.1.2) - 修复 bug
npm run release:patch

# 次版本 (1.1.1 → 1.2.0) - 新功能
npm run release:minor

# 主版本 (1.1.1 → 2.0.0) - 重大变更
npm run release:major
```

这将自动：
1. 运行测试（如果有）
2. 更新 `package.json` 中的版本号
3. 同步版本到 `docker-compose.yml`
4. 创建 git 提交和标签
5. 推送到远程仓库（包含标签）
6. 触发 GitHub Actions 构建 Docker 镜像并创建 Release

## PVP 对战模式

PVP 模式允许 2-4 名玩家实时对战，同时猜测同一个单词。

### 如何进行 PVP 对战
1. **创建房间**：在首页点击"PVP 对战"，输入你的昵称，选择游戏模式（竞速/限时）、字数（5字/6字）和难度，然后创建房间。
2. **分享房间代码**：将 6 位房间代码或邀请链接分享给你的朋友。
3. **准备就绪**：所有玩家加入后，非房主玩家点击"准备"。房主在所有人准备好后开始游戏。
4. **竞速猜词**：所有人猜同一个单词，最先猜对的玩家获胜！
5. **查看结果**：所有玩家完成后，根据成功与否和用时查看排名。

> **提示：** PVP 模式同样支持 5 字和 6 字模式，6 字模式只有中级和高级难度可选。

### 本地运行 PVP 服务器

```bash
# 安装依赖并运行 WebSocket 服务器
cd server
npm install
npm start   # 默认端口：3001

# 在另一个终端运行前端（会代理到 localhost:3001）
cd ..
npm start
```

### PVP 环境变量

**本地开发时**，需要在项目根目录创建 `.env.local` 文件：

```ini
REACT_APP_SOCKET_SERVER=http://localhost:3001
```

**Docker 部署时**，无需配置任何 PVP 相关环境变量，前端会自动通过同域 `/socket.io` 路径连接 WebSocket 服务。

### 数据统计配置（可选）

本项目集成了 [Umami Analytics](https://umami.is/)，支持 Umami Cloud 和自部署实例。

在 `.env` 或 `.env.local` 中配置：

```ini
# Umami 网站 ID（必填，在 Umami 创建项目后获取）
REACT_APP_UMAMI_WEBSITE_ID=your-website-id

# Umami 脚本地址（可选，默认使用 Umami Cloud）
# 自部署时填写你的实例地址
REACT_APP_UMAMI_SRC=https://cloud.umami.is/script.js
```

> **注意：** 如果不配置 `REACT_APP_UMAMI_WEBSITE_ID`，统计功能将自动禁用。

#### 追踪的事件

| 事件名 | 说明 | 数据属性 |
|--------|------|----------|
| `game_start` | 开始单人游戏 | mode, wordLength |
| `game_end` | 游戏结束 | mode, wordLength, result, attempts |
| `guess_submit` | 提交猜测 | mode, wordLength, attemptNumber |
| `share_result` | 分享游戏结果 | mode, wordLength, result, attempts |
| `view_meaning` | 查看单词释义 | word, mode, wordLength |
| `game_resume` | 游戏恢复决策 | decision, mode, wordLength |
| `pvp_room_create` | 创建 PVP 房间 | gameMode, wordLength, difficulty, timeLimit |
| `pvp_room_join` | 加入 PVP 房间 | wordLength, difficulty |
| `pvp_game_start` | PVP 游戏开始 | gameMode, wordLength, difficulty, playerCount |
| `pvp_game_end` | PVP 游戏结束 | gameMode, wordLength, result, rank, playerCount |
| `pvp_share` | PVP 分享邀请 | type, roomCode |
| `pvp_play_again` | PVP 再来一局 | gameMode, playerCount |
| `info_modal_view` | 查看游戏规则 | - |
| `setting_change` | 设置变更 | setting, value |
| `language_change` | 语言切换 | language |

## 项目结构

```
src/
├── assets/                 # 静态资源
│   ├── flags/              # 语言国旗图标
│   ├── buttons-kor.json    # 韩语键盘按钮配置
│   ├── dictionary.json     # 5字词汇字典
│   ├── dictionary-6.json   # 6字词汇字典
│   ├── easy-mode.json      # 5字简单难度词库
│   ├── imdt-mode.json      # 5字中等难度词库
│   ├── hard-mode.json      # 5字困难难度词库
│   ├── imdt-mode-6.json    # 6字中等难度词库
│   ├── hard-mode-6.json    # 6字困难难度词库
│   ├── all-deposed-words.json    # 5字有效词汇字典
│   ├── all-deposed-words-6.json  # 6字有效词汇字典
│   └── *.svg               # UI 图标
│
├── components/             # 可复用 UI 组件
│   ├── Header.js           # 带导航的应用头部
│   ├── Keyboard.js         # 虚拟韩语键盘
│   ├── InfoModal.js        # 游戏规则弹窗
│   ├── Sidebar.js          # 设置面板
│   ├── LangBtn.js          # 语言选择器
│   ├── Toggle.js           # 切换开关组件
│   ├── AnswerModal.js      # 游戏结果展示
│   ├── CentralMessage.js   # Toast 通知
│   ├── ResumeGameModal.js  # 恢复保存游戏提示
│   └── pvp/                # PVP 模式组件
│
├── contexts/               # React Context 提供者
│   ├── LanguageContext.js  # 国际化 context
│   └── SocketContext.js    # PVP 用 WebSocket context
│
├── lang/                   # 本地化文件
│   ├── ko.js               # 韩语
│   ├── en.js               # 英语
│   ├── zh.js               # 中文
│   ├── de.js               # 德语
│   └── el.js               # 希腊语
│
├── pages/                  # 页面组件
│   ├── Home.js             # 带难度选择的首页
│   ├── WordleKor.js        # 5字模式游戏页面
│   ├── WordleKor6.js       # 6字模式游戏页面
│   ├── NotFound.js         # 404 页面
│   ├── PvpLobby.js         # PVP 大厅（创建/加入房间）
│   ├── PvpRoom.js          # PVP 等待室和游戏（支持5字/6字）
│   └── modal/              # 信息弹窗页面（7 个幻灯片）
│
├── state/                  # Recoil 状态原子
│   ├── themeState.js       # 深色模式、颜色模式、键盘模式
│   └── sidebarState.js     # 侧边栏开关状态
│
├── styles/                 # SCSS 样式表
│   ├── global.scss         # 全局样式和 CSS 变量
│   ├── _reset.scss         # CSS 重置
│   ├── _animations.scss    # 动画样式
│   ├── _design-tokens.scss # 设计令牌（颜色、间距等变量）
│   ├── components/         # 组件专用样式
│   └── pages/              # 页面专用样式
│
├── utils/                  # 工具函数
├── App.js                  # 带路由的根组件
└── index.js                # 应用入口点
```

## 数据集
Korean Wordle 使用精心策划的数据集，确保为玩家提供多样化且具有挑战性的词汇选择。以下是我们数据集的一些详情：
### [数据集预处理仓库](https://github.com/hwahyeon/py-wordle-kor-dataset)
- [우리말샘（韩语词典）](https://opendict.korean.go.kr/)
- [国立国语院韩语基础词典](https://krdict.korean.go.kr/)
- [国立国语研究院学习用词汇列表](https://www.korean.go.kr/front/etcData/etcDataView.do?mn_id=46&etc_seq=71)
