# Korean Wordle

[简体中文](./README.md) | English

This is the Korean version of Wordle. The game uses a random word mode - each time you start a new game, a random word is selected as the answer, allowing unlimited play! This Wordle game only supports nouns and standard language (no dialect or slang).

## Game Modes

### 5-Letter Mode (Classic)
The standard mode where you guess words made of 5 Korean characters.

| Difficulty | Description |
|------------|-------------|
| **초급 (Easy)** | Common words, great for beginners |
| **중급 (Medium)** | A balanced challenge with moderately difficult words |
| **고급 (Hard)** | Rare difficult words for advanced players |

### 6-Letter Mode
Advanced mode where you guess words made of 6 Korean characters - a greater challenge with longer words!

| Difficulty | Description |
|------------|-------------|
| **중급 (Medium)** | Medium difficulty 6-letter words |
| **고급 (Hard)** | Hard difficulty 6-letter words |

> **Note:** 6-letter mode does not include Easy difficulty.

## How to Play
1. **Choose Difficulty**: Select from Easy, Medium, or Hard.
2. **Guess the Word**: Type in a Korean word and submit your guess.
3. **Interpret the Hints**: Tiles change color to guide you to the correct word.
   - <img src="./readme/green_circle.svg" width="11" height="11"/> Green: Right letter, right spot.
   - <img src="./readme/yellow_circle.svg" width="11" height="11"/> Yellow: Right letter, wrong spot.
   - <img src="./readme/gray_circle.svg" width="11" height="11"/> Gray: Wrong letter.
4. **Winning the Game**: Correctly guess the word within the limited attempts to win.

For more information, see *Information Modal* in the game.

## Features
- **Dual Mode Selection**: Supports 5-letter mode (classic) and 6-letter mode (advanced) to meet different challenge needs.
- **Random Word Mode**: Each game generates a random answer, allowing unlimited challenges.
- **Dark Mode**: Reduce eye strain with a darker color palette, perfect for night-time play.
- **Colorblind Mode**: Enjoy the game without color barriers.
- **Information Modal**: Learn game rules and tips easily.
- **Keyboard**: Keyboard input is supported.
- **Multi-language Support**: Available in Korean, English, Chinese, German, and Greek.
- **Game State Persistence**: Your progress is saved automatically.
- **PVP Battle Mode**: Compete with friends (2-10 players) in real-time with both 5-letter and 6-letter modes to see who guesses the word fastest!
- **Analytics**: Integrated with Umami Analytics for tracking game data and user behavior.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18 |
| Routing | React Router DOM v6 |
| State Management | Recoil |
| Styling | SCSS/Sass, Material UI, Styled Components |
| Icons | FontAwesome |
| Build Tool | CRACO (Create React App Configuration Override) |
| SEO | React Helmet |
| Analytics | Umami Analytics |
| Deployment | Vercel, Docker |

## Docker Deployment

### Prerequisites
- Docker
- Docker Compose

### Quick Start

1. **Create configuration file**

```bash
# Linux/Mac
cp env.example .env

# Windows
copy env.example .env
```

2. **Configure environment variables** (optional)

Edit `.env` file to customize:

```ini
# Image tag (options: latest, main, or specific version like 1.2.0)
IMAGE_TAG=latest

# Container name
CONTAINER_NAME=korean-wordle

# Host port mapping (access via http://localhost:HOST_PORT)
HOST_PORT=3000

# Timezone
TZ=Asia/Shanghai

# Docker network name
NETWORK_NAME=korean-wordle-network

# PVP WebSocket endpoint exposed to the browser
REACT_APP_SOCKET_SERVER=http://localhost:3001

# PVP server port (host/container)
PVP_SERVER_PORT=3001

# Allowed origins for the WebSocket server (comma separated)
PVP_CLIENT_URL=http://localhost:3000
```

3. **Run container (Frontend + PVP backend one-click deployment)**

```bash
# Build images (frontend + WebSocket) and start containers
docker-compose up -d --build

# View frontend logs
docker-compose logs -f korean-wordle

# View PVP server logs
docker-compose logs -f pvp-server

# Stop containers
docker-compose down
```

4. **Access the application**

Open your browser and visit: `http://localhost:3000` (or your configured port)

### Pull from Docker Hub

Docker Hub: https://hub.docker.com/r/chouann/korean-wordle

```bash
# Pull latest image
docker pull chouann/korean-wordle:latest

# Run directly
docker run -d -p 3000:80 chouann/korean-wordle:latest

# Or use specific version
docker pull chouann/korean-wordle:1.2.0
```

> **Note:** The standalone `docker run` command above only starts the frontend. To enable PVP battle mode, use `docker-compose up -d --build` from this repository, which will automatically start the WebSocket backend service.

### Custom Domain Deployment (HTTPS + Same-domain WebSocket)

If you want to deploy the entire service on your own domain (e.g., `https://koreanwordle.ningriri.cn/`), follow these steps:

1. **Edit `.env`** (on the deployment host)
   ```ini
   HOST_PORT=3000
   REACT_APP_SOCKET_SERVER=https://koreanwordle.ningriri.cn/socket.io
   PVP_SERVER_PORT=3001
   PVP_CLIENT_URL=https://koreanwordle.ningriri.cn
   ```
   - `REACT_APP_SOCKET_SERVER` must be the public HTTPS address so the frontend connects to `/socket.io` on the same domain.
   - `PVP_CLIENT_URL` specifies allowed CORS origins for the WebSocket service; you can add multiple domains or debug addresses separated by commas.

2. **Build and start with one command**
   ```bash
   docker-compose up -d --build
   ```

3. **Configure reverse proxy** (using Nginx as an example, assuming SSL certificates are ready)
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

       # Frontend static resources
       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }

       # WebSocket (Socket.IO default path /socket.io)
       location /socket.io/ {
           proxy_pass http://127.0.0.1:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
       }
   }
   ```

After completion, visit `https://koreanwordle.ningriri.cn/` to use PVP battle mode on the same domain (both frontend pages and WebSocket through HTTPS).

### CI/CD Auto Build

This project uses GitHub Actions to automatically build and push Docker images to Docker Hub.

**Triggers:**
| Event | Image Tags |
|-------|------------|
| Push to main/master | `latest`, `main` |
| Create tag `v1.2.0` | `1.2.0`, `1.2`, `latest` |
| Pull Request | Build only, no push |
| Manual trigger | Based on branch |

**Setup (for fork):**
1. Create a repository on [Docker Hub](https://hub.docker.com/)
2. Go to GitHub repo **Settings** → **Secrets and variables** → **Actions**
3. Add secrets:
   - `DOCKERHUB_USERNAME`: Your Docker Hub username
   - `DOCKERHUB_TOKEN`: Docker Hub Access Token (generate in Docker Hub Account Settings → Security)

### Version Management

This project uses automated version management. To release a new version:

```bash
# Patch release (1.1.1 → 1.1.2) - bug fixes
npm run release:patch

# Minor release (1.1.1 → 1.2.0) - new features
npm run release:minor

# Major release (1.1.1 → 2.0.0) - breaking changes
npm run release:major
```

This will automatically:
1. Run tests (if available)
2. Update version in `package.json`
3. Sync version to `docker-compose.yml`
4. Create a git commit and tag
5. Push to remote with tags
6. Trigger GitHub Actions to build Docker image and create Release

## PVP Battle Mode

The PVP mode allows 2-10 players to compete in real-time, guessing the same word simultaneously.

### How to Play PVP
1. **Create a Room**: Click "PVP Battle" on the home page, enter your nickname, select game mode (Race/Timed), word length (5/6 letters), and difficulty, then create a room.
2. **Share Room Code**: Share the 6-digit room code or invite link with your friends.
3. **Ready Up**: Once all players join, non-host players click "Ready". The host starts the game when everyone is ready.
4. **Race to Guess**: Everyone guesses the same word. The first to guess correctly wins!
5. **View Results**: After all players finish, view the ranking based on success and time.

> **Tip:** PVP mode also supports both 5-letter and 6-letter modes. 6-letter mode only has Medium and Hard difficulty options.

### Running PVP Server Locally

```bash
# Install dependencies & run the WebSocket server
cd server
npm install
npm start   # default port: 3001

# Run the frontend in another terminal (will proxy to localhost:3001)
cd ..
npm start
```

### PVP Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_SOCKET_SERVER` | Frontend build-time WebSocket endpoint | `http://localhost:3001` |
| `PVP_SERVER_PORT` | WebSocket server port | `3001` |
| `PVP_CLIENT_URL` | Comma-separated CORS origins for the WebSocket server | `*` |

### Analytics Configuration (Optional)

This project integrates [Umami Analytics](https://umami.is/), supporting both Umami Cloud and self-hosted instances.

**For local development**, configure in `.env` or `.env.local`:

```ini
# Umami Website ID (required, obtained after creating a project in Umami)
REACT_APP_UMAMI_WEBSITE_ID=your-website-id

# Umami script URL (optional, defaults to Umami Cloud)
REACT_APP_UMAMI_SRC=https://cloud.umami.is/script.js
```

**For Docker deployment**, configure via environment variables:

```bash
# Option 1: Using docker-compose (recommended)
# Add configuration to .env file, then start
docker-compose up -d

# Option 2: Run directly (also works with images pulled from Docker Hub)
docker run -d -p 3000:80 \
  -e REACT_APP_UMAMI_WEBSITE_ID=your-website-id \
  chouann/korean-wordle:latest
```

> **Note:** If `REACT_APP_UMAMI_WEBSITE_ID` is not configured, analytics will be automatically disabled.

#### Tracked Events

| Event | Description | Data Properties |
|-------|-------------|-----------------|
| `game_start` | Start solo game | mode, wordLength |
| `game_end` | Game over | mode, wordLength, result, attempts |
| `guess_submit` | Submit guess | mode, wordLength, attemptNumber |
| `share_result` | Share game result | mode, wordLength, result, attempts |
| `view_meaning` | View word meaning | word, mode, wordLength |
| `game_resume` | Game resume decision | decision, mode, wordLength |
| `pvp_room_create` | Create PVP room | gameMode, wordLength, difficulty, timeLimit |
| `pvp_room_join` | Join PVP room | wordLength, difficulty |
| `pvp_game_start` | PVP game start | gameMode, wordLength, difficulty, playerCount |
| `pvp_game_end` | PVP game end | gameMode, wordLength, result, rank, playerCount |
| `pvp_share` | PVP share invite | type, roomCode |
| `pvp_play_again` | PVP play again | gameMode, playerCount |
| `info_modal_view` | View game rules | - |
| `setting_change` | Settings change | setting, value |
| `language_change` | Language change | language |

## Project Structure

```
src/
├── assets/                 # Static assets
│   ├── flags/              # Language flag icons
│   ├── buttons-kor.json    # Korean keyboard button configuration
│   ├── dictionary.json     # 5-letter word dictionary
│   ├── dictionary-6.json   # 6-letter word dictionary
│   ├── easy-mode.json      # 5-letter Easy difficulty word list
│   ├── imdt-mode.json      # 5-letter Medium difficulty word list
│   ├── hard-mode.json      # 5-letter Hard difficulty word list
│   ├── imdt-mode-6.json    # 6-letter Medium difficulty word list
│   ├── hard-mode-6.json    # 6-letter Hard difficulty word list
│   ├── all-deposed-words.json    # 5-letter valid word dictionary
│   ├── all-deposed-words-6.json  # 6-letter valid word dictionary
│   └── *.svg               # UI icons
│
├── components/             # Reusable UI components
│   ├── Header.js           # App header with navigation
│   ├── Keyboard.js         # Virtual Korean keyboard
│   ├── InfoModal.js        # Game rules modal
│   ├── Sidebar.js          # Settings panel
│   ├── LangBtn.js          # Language selector
│   ├── Toggle.js           # Toggle switch component
│   ├── AnswerModal.js      # Game result display
│   ├── CentralMessage.js   # Toast notifications
│   ├── ResumeGameModal.js  # Resume saved game prompt
│   └── pvp/                # PVP mode components
│
├── contexts/               # React Context providers
│   ├── LanguageContext.js  # i18n context
│   └── SocketContext.js    # WebSocket context for PVP
│
├── lang/                   # Localization files
│   ├── ko.js               # Korean
│   ├── en.js               # English
│   ├── zh.js               # Chinese
│   ├── de.js               # German
│   └── el.js               # Greek
│
├── pages/                  # Page components
│   ├── Home.js             # Home page with difficulty selection
│   ├── WordleKor.js        # 5-letter mode game page
│   ├── WordleKor6.js       # 6-letter mode game page
│   ├── NotFound.js         # 404 page
│   ├── PvpLobby.js         # PVP lobby (create/join room)
│   ├── PvpRoom.js          # PVP waiting room and game (supports 5/6-letter)
│   └── modal/              # Info modal pages (7 slides)
│
├── state/                  # Recoil state atoms
│   ├── themeState.js       # Dark mode, color mode, keyboard mode
│   └── sidebarState.js     # Sidebar open/close state
│
├── styles/                 # SCSS stylesheets
│   ├── global.scss         # Global styles and CSS variables
│   ├── _reset.scss         # CSS reset
│   ├── _animations.scss    # Animation styles
│   ├── _design-tokens.scss # Design tokens (colors, spacing variables)
│   ├── components/         # Component-specific styles
│   └── pages/              # Page-specific styles
│
├── utils/                  # Utility functions
├── App.js                  # Root component with routing
└── index.js                # Application entry point
```

## Dataset
Korean Wordle uses curated datasets to ensure a diverse and challenging word selection for players. Here are some details about our datasets:
### [Dataset preprocessing repository](https://github.com/hwahyeon/py-wordle-kor-dataset)
- [우리말샘](https://opendict.korean.go.kr/)
- [국립국어원 한국어 기초사전](https://krdict.korean.go.kr/)
- [국립국어연구원 학습용 어휘 목록](https://www.korean.go.kr/front/etcData/etcDataView.do?mn_id=46&etc_seq=71)

