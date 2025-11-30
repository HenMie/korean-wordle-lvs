const fs = require('fs');
const path = require('path');

const assetsDir = path.resolve(__dirname, '..', '..', 'src', 'assets');

const WORD_LIST_FILES = {
  5: {
    easy: 'easy-mode.json',
    imdt: 'imdt-mode.json',
    hard: 'hard-mode.json',
  },
  6: {
    imdt: 'imdt-mode-6.json',
    hard: 'hard-mode-6.json',
  },
};

const DEFAULTS = {
  WORD_LENGTH: 5,
  DIFFICULTY: {
    5: 'easy',
    6: 'imdt',
  },
  GAME_MODE: 'race',
  TIME_LIMIT: 3,
};

const ALLOWED_GAME_MODES = ['race', 'timed'];
const ALLOWED_TIME_LIMITS = [3, 5, 10];

const cache = new Map();

function ensureAssetsDir() {
  if (!fs.existsSync(assetsDir)) {
    throw new Error(
      `PVP word list assets not found at ${assetsDir}. Ensure src/assets is available.`,
    );
  }
}

function loadJson(fileName) {
  ensureAssetsDir();
  const fullPath = path.join(assetsDir, fileName);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing word list file: ${fullPath}`);
  }
  if (!cache.has(fullPath)) {
    const raw = fs.readFileSync(fullPath, 'utf-8');
    cache.set(fullPath, JSON.parse(raw));
  }
  return cache.get(fullPath);
}

function resolveWordLength(value = DEFAULTS.WORD_LENGTH) {
  const num = Number(value);
  return WORD_LIST_FILES[num] ? num : DEFAULTS.WORD_LENGTH;
}

function resolveDifficulty(wordLength, candidate, fallback) {
  const allowed =
    Object.keys(WORD_LIST_FILES[wordLength] || WORD_LIST_FILES[DEFAULTS.WORD_LENGTH]);
  if (candidate && allowed.includes(candidate)) {
    return candidate;
  }
  if (fallback && allowed.includes(fallback)) {
    return fallback;
  }
  return DEFAULTS.DIFFICULTY[wordLength] || DEFAULTS.DIFFICULTY[DEFAULTS.WORD_LENGTH];
}

function resolveGameMode(candidate, fallback = DEFAULTS.GAME_MODE) {
  if (candidate && ALLOWED_GAME_MODES.includes(candidate)) {
    return candidate;
  }
  if (fallback && ALLOWED_GAME_MODES.includes(fallback)) {
    return fallback;
  }
  return DEFAULTS.GAME_MODE;
}

function resolveTimeLimit(candidate, fallback = DEFAULTS.TIME_LIMIT) {
  const num = Number(candidate);
  if (ALLOWED_TIME_LIMITS.includes(num)) {
    return num;
  }
  const fallbackNum = Number(fallback);
  if (ALLOWED_TIME_LIMITS.includes(fallbackNum)) {
    return fallbackNum;
  }
  return DEFAULTS.TIME_LIMIT;
}

function getWordList(wordLength, difficulty) {
  const normalizedLength = resolveWordLength(wordLength);
  const normalizedDifficulty = resolveDifficulty(
    normalizedLength,
    difficulty,
    DEFAULTS.DIFFICULTY[normalizedLength],
  );
  const fileName = WORD_LIST_FILES[normalizedLength][normalizedDifficulty];
  return loadJson(fileName);
}

module.exports = {
  getWordList,
  resolveWordLength,
  resolveDifficulty,
  resolveGameMode,
  resolveTimeLimit,
  ALLOWED_TIME_LIMITS,
  DEFAULT_TIME_LIMIT: DEFAULTS.TIME_LIMIT,
};

