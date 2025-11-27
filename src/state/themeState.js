import { atom } from "recoil";

// 获取系统深色模式偏好
const getSystemDarkMode = () => {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return false;
};

// localStorage 持久化 effect
const localStorageEffect = (key, defaultValueFn) => ({ setSelf, onSet }) => {
  const savedValue = localStorage.getItem(key);
  if (savedValue != null) {
    setSelf(JSON.parse(savedValue));
  } else if (defaultValueFn) {
    // 如果没有保存的值，使用默认值函数
    setSelf(defaultValueFn());
  }

  onSet((newValue, _, isReset) => {
    isReset
      ? localStorage.removeItem(key)
      : localStorage.setItem(key, JSON.stringify(newValue));
  });
};

// 深色模式偏好：'system' | 'light' | 'dark'
export const darkModePreferenceState = atom({
  key: "darkModePreferenceState",
  default: "system",
  effects: [localStorageEffect("wordle_dark_mode_preference")],
});

// 实际的深色模式状态（由 preference 和系统设置决定）
export const darkModeState = atom({
  key: "darkModeState",
  default: getSystemDarkMode(),
});

export const colorModeState = atom({
  key: "colorModeState",
  default: false,
  effects: [localStorageEffect("wordle_color_mode")],
});

export const keyboardModeState = atom({
  key: "keyboardModeState",
  default: false,
  effects: [localStorageEffect("wordle_keyboard_mode")],
});
