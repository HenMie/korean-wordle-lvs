import React, { useEffect, useCallback } from "react";
import "@styles/components/_sidebar.scss";
import { useRecoilState } from "recoil";
import { sidebarState } from "@state/sidebarState";
import Toggle from "@components/Toggle";
import {
  colorModeState,
  darkModeState,
  darkModePreferenceState,
  keyboardModeState,
} from "@state/themeState";
import { useLanguage } from "@contexts/LanguageContext";

// 获取系统深色模式偏好
const getSystemDarkMode = () => {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return false;
};

function Sidebar() {
  const { lang } = useLanguage();

  const [sidebarOpen, setSidebarOpen] = useRecoilState(sidebarState);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const [darkMode, setDarkMode] = useRecoilState(darkModeState);
  const [darkModePreference, setDarkModePreference] = useRecoilState(darkModePreferenceState);
  const [colorMode, setColorMode] = useRecoilState(colorModeState);
  const [keyboardMode, setKeyboardMode] = useRecoilState(keyboardModeState);

  const handleToggle = (setter) => {
    setter((prev) => !prev);
  };

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
      
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [darkModePreference, setDarkMode]);

  // 当 preference 变化时更新 darkMode
  useEffect(() => {
    updateDarkMode(darkModePreference);
  }, [darkModePreference, updateDarkMode]);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    document.body.classList.toggle("color-mode", colorMode);
  }, [darkMode, colorMode]);

  const themeOptions = [
    { value: "light", label: lang.settings?.theme_light || "浅色" },
    { value: "dark", label: lang.settings?.theme_dark || "深色" },
    { value: "system", label: lang.settings?.theme_system || "跟随系统" },
  ];

  return (
    <div className={`sidebar ${sidebarOpen ? "" : "sidebar--closed"}`}>
      <div className="sidebar__panel">
        <button className="sidebar__close-btn" onClick={toggleSidebar}>
          &times;
        </button>
        <div className="sidebar__content">
          <div className="sidebar__title">{lang.setting}</div>

          {/* 主题选择 */}
          <div className="sidebar__theme-selector">
            <strong>{lang.settings.dark}</strong>
            <div className="theme-options">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  className={`theme-option ${darkModePreference === option.value ? "theme-option--active" : ""}`}
                  onClick={() => setDarkModePreference(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <hr />
          <Toggle
            title={lang.settings.color}
            description={lang.settings.color_desc}
            isOn={colorMode}
            onChange={() => handleToggle(setColorMode)}
          />
          <hr />
          <Toggle
            title={lang.settings.keyboard}
            description={lang.settings.keyboard_desc}
            isOn={keyboardMode}
            onChange={() => handleToggle(setKeyboardMode)}
          />
        </div>
      </div>
      <div className="sidebar__overlay" onClick={toggleSidebar}></div>
    </div>
  );
}

export default Sidebar;
