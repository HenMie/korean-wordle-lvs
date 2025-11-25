# Korean Wordle
This is the Korean version of Wordle. Only one challenge per day is given, and the answer changes every day at 00:00. This Wordle game only supports nouns and standard language (no dialect or slang).

## Difficulty Levels
- **초급(Easy)**: Use common words, great for beginners.
- **중급(Medium)**: A balanced challenge with moderately difficult words.
- **고급(Hard)**: Rare difficult words for advanced players.

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
- **Dark Mode**: Reduce eye strain with a darker color palette, perfect for night-time play.
- **Colorblind Mode**: Enjoy the game without color barriers.
- **Information Modal**: Learn game rules and tips easily.
- **Keyboard**: Keyboard input is supported.
- **Multi-language Support**: Available in Korean, English, Chinese, German, and Greek.
- **Game State Persistence**: Your progress is saved automatically.

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
| Deployment | Vercel |

## Project Structure

```
src/
├── assets/                 # Static assets
│   ├── flags/              # Language flag icons
│   ├── easy-mode.json      # Easy difficulty word list
│   ├── imdt-mode.json      # Medium difficulty word list
│   ├── hard-mode.json      # Hard difficulty word list
│   ├── all-deposed-words.json  # Valid word dictionary
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
│   └── ResumeGameModal.js  # Resume saved game prompt
│
├── contexts/               # React Context providers
│   └── LanguageContext.js  # i18n context
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
│   ├── WordleKor.js        # Main game page
│   ├── NotFound.js         # 404 page
│   └── modal/              # Info modal pages (7 slides)
│
├── state/                  # Recoil state atoms
│   ├── themeState.js       # Dark mode, color mode, keyboard mode
│   └── sidebarState.js     # Sidebar open/close state
│
├── styles/                 # SCSS stylesheets
│   ├── global.scss         # Global styles and CSS variables
│   ├── _reset.scss         # CSS reset
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
