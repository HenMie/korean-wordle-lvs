// React
import React from "react";
import { useNavigate } from "react-router-dom";

// Style
import "@styles/pages/_home.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGamepad } from "@fortawesome/free-solid-svg-icons";

// Component
import Header from "@components/Header";
import { Helmet } from "react-helmet-async";

// State
import { useRecoilValue } from "recoil";
import { colorModeState, darkModeState } from "@state/themeState";

// Images
import iconNormal from "@assets/wordle-icon.svg";
import iconDark from "@assets/wordle-icon-dark.svg";
import iconColor from "@assets/wordle-icon-color.svg";
import iconBoth from "@assets/wordle-icon-both.svg";

// Data
import hardMode from "@assets/hard-mode.json";
import imdtMode from "@assets/imdt-mode.json";
import easyMode from "@assets/easy-mode.json";
// 6字模式词库
import imdtMode6 from "@assets/imdt-mode-6.json";
import hardMode6 from "@assets/hard-mode-6.json";

import { useLanguage } from "@contexts/LanguageContext";
import { trackGameStart } from "@utils/analytics";

const modeMap = {
  easy: easyMode,
  imdt: imdtMode,
  hard: hardMode,
};

const modeMap6 = {
  imdt: imdtMode6,
  hard: hardMode6,
};

function HomePage() {
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const darkMode = useRecoilValue(darkModeState);
  const colorMode = useRecoilValue(colorModeState);
  const icon =
    darkMode && colorMode
      ? iconBoth
      : darkMode
      ? iconDark
      : colorMode
      ? iconColor
      : iconNormal;

  const handleNavigation = (difficulty) => {
    const wordList = modeMap[difficulty];
    const randomId = Math.floor(Math.random() * wordList.length);
    trackGameStart(difficulty, 5);
    navigate(`/play/${difficulty}/${randomId}`);
  };

  const handleNavigation6 = (mode) => {
    const wordList = modeMap6[mode];
    const randomId = Math.floor(Math.random() * wordList.length);
    trackGameStart(mode, 6);
    navigate(`/play6/${mode}/${randomId}`);
  };

  return (
    <div className="homepage">
      <Helmet>
        <title>한글 Wordle | Home</title>
        <meta
          name="description"
          content="Wordle game for the Korean language with three levels of difficulty"
        />
      </Helmet>
      <Header />
      
      <div className="homepage__content">
        {/* Logo */}
        <img src={icon} alt="wordle icon" className="homepage__icon" />
        
        {/* 标题区域 */}
        <div className="homepage__title-group">
          <h1 className="homepage__title">{lang.home1}</h1>
          <p className="homepage__subtitle"><span className="korean-serif">한글</span> Wordle</p>
        </div>
        
        {/* 开始游戏区域 */}
        <div>
          <p className="homepage__text homepage__text--start">{lang.home2}</p>
          <p className="homepage__text homepage__text--level">{lang.home3}</p>
          
          <div className="homepage__buttons">
            <button
              className="homepage__button homepage__button--easy"
              onClick={() => handleNavigation("easy")}
            >
              {lang.lv1}
            </button>
            <button
              className="homepage__button homepage__button--imdt"
              onClick={() => handleNavigation("imdt")}
            >
              {lang.lv2}
            </button>
            <button
              className="homepage__button homepage__button--hard"
              onClick={() => handleNavigation("hard")}
            >
              {lang.lv3}
            </button>
          </div>
          
          {/* 6字模式 */}
          <div className="homepage__six-letter-section">
            <p className="homepage__text homepage__text--level">{lang.mode6?.title || "6字模式"}</p>
            <div className="homepage__buttons homepage__buttons--6">
              <button
                className="homepage__button homepage__button--imdt6"
                onClick={() => handleNavigation6("imdt")}
              >
                {lang.mode6?.imdt || "中级"}
              </button>
              <button
                className="homepage__button homepage__button--hard6"
                onClick={() => handleNavigation6("hard")}
              >
                {lang.mode6?.hard || "高级"}
              </button>
            </div>
          </div>

          {/* PVP Mode */}
          <div className="homepage__pvp-section">
            <button
              className="homepage__button homepage__button--pvp"
              onClick={() => navigate("/pvp")}
            >
              <FontAwesomeIcon icon={faGamepad} />
              <span>{lang.pvp?.title || "PVP 对战"}</span>
            </button>
          </div>
        </div>
        
        {/* 页脚 */}
        <div className="homepage__footer">
          <p className="homepage__text homepage__text--edit">
            Made by{" "}
            <a
              href="https://github.com/HenMie/korean-wordle-lvs"
              target="_blank"
              rel="noopener noreferrer"
            >
              Chouann
            </a>{" "}
            (forked from hwahyeon)
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
