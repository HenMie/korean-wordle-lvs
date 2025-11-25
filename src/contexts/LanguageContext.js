import React, { createContext, useState, useEffect, useContext } from "react";
import { ko } from "@lang/ko.js";
import { en } from "@lang/en.js";
import { de } from "@lang/de.js";
import { el } from "@lang/el.js";
import { zh } from "@lang/zh.js";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(
    localStorage.getItem("language") || "zh"
  );
  const languages = { zh, ko, en, de, el };
  const lang = languages[currentLang];

  useEffect(() => {
    localStorage.setItem("language", currentLang);
  }, [currentLang]);

  const changeLanguage = (langCode) => {
    setCurrentLang(langCode);
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

export default LanguageContext;
