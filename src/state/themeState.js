import { atom } from "recoil";
import { useEffect, useCallback } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

// 获取系统深色模式偏好
export const getSystemDarkMode = () => {
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

// 主题同步 hook - 在应用根级别使用
export const useThemeSync = () => {
  const [darkMode, setDarkMode] = useRecoilState(darkModeState);
  const darkModePreference = useRecoilValue(darkModePreferenceState);
  const colorMode = useRecoilValue(colorModeState);

  // 根据 preference 更新实际的 darkMode
  const updateDarkMode = useCallback((preference) => {
    if (preference === "system") {
      setDarkMode(getSystemDarkMode());
    } else {
      setDarkMode(preference === "dark");
    }
  }, [setDarkMode]);

  // 监听系统主题变化
  useEffect(() => {
    if (darkModePreference === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e) => setDarkMode(e.matches);
      
      // 立即同步一次
      setDarkMode(mediaQuery.matches);
      
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [darkModePreference, setDarkMode]);

  // 当 preference 变化时更新 darkMode
  useEffect(() => {
    updateDarkMode(darkModePreference);
  }, [darkModePreference, updateDarkMode]);

  // 应用 body 样式
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    document.body.classList.toggle("color-mode", colorMode);
  }, [darkMode, colorMode]);
};
