import React from "react";
import "@styles/components/_sidebar.scss";
import { useRecoilState } from "recoil";
import { sidebarState } from "@state/sidebarState";
import Toggle from "@components/Toggle";
import {
  colorModeState,
  darkModePreferenceState,
  keyboardModeState,
} from "@state/themeState";
import { useLanguage } from "@contexts/LanguageContext";

function Sidebar() {
  const { lang } = useLanguage();

  const [sidebarOpen, setSidebarOpen] = useRecoilState(sidebarState);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const [darkModePreference, setDarkModePreference] = useRecoilState(darkModePreferenceState);
  const [colorMode, setColorMode] = useRecoilState(colorModeState);
  const [keyboardMode, setKeyboardMode] = useRecoilState(keyboardModeState);

  const handleToggle = (setter) => {
    setter((prev) => !prev);
  };

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
