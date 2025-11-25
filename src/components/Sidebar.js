import React, { useEffect } from "react";
import "@styles/components/_sidebar.scss";
import { useRecoilState } from "recoil";
import { sidebarState } from "@state/sidebarState";
import Toggle from "@components/Toggle";
import {
  colorModeState,
  darkModeState,
  keyboardModeState,
} from "@state/themeState";
import { useLanguage } from "@contexts/LanguageContext";

function Sidebar() {
  const { lang } = useLanguage();

  const [sidebarOpen, setSidebarOpen] = useRecoilState(sidebarState);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const [darkMode, setDarkMode] = useRecoilState(darkModeState);
  const [colorMode, setColorMode] = useRecoilState(colorModeState);
  const [keyboardMode, setKeyboardMode] = useRecoilState(keyboardModeState);

  const handleToggle = (setter) => {
    setter((prev) => !prev);
  };

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    document.body.classList.toggle("color-mode", colorMode);
  }, [darkMode, colorMode]);

  return (
    <div className={`sidebar ${sidebarOpen ? "" : "sidebar--closed"}`}>
      <div className="sidebar__panel">
        <button className="sidebar__close-btn" onClick={toggleSidebar}>
          &times;
        </button>
        <div className="sidebar__content">
          <div className="sidebar__title">{lang.setting}</div>

          <Toggle
            title={lang.settings.dark}
            isOn={darkMode}
            onChange={() => handleToggle(setDarkMode)}
          />
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
