// React
import React from "react";
import { Link } from "react-router-dom";

// Component
import { Helmet } from "react-helmet-async";
import Header from "@components/Header";

// Style
import "@styles/pages/_notfound.scss";

// Images
import notfound from "@assets/notfound.webp";

import { useLanguage } from "@contexts/LanguageContext";

const NotFound = () => {
  const { lang } = useLanguage();

  return (
    <div className="notfound">
      <Helmet>
        <title>한글 Wordle | 404</title>
      </Helmet>
      <Header />
      <div className="notfound__content">
        <h1 className="notfound__title">{lang.notfound.title}</h1>
        <img src={notfound} alt="Not Found" className="notfound__image" />
        <p className="notfound__text">{lang.notfound.content}</p>
        <Link to="/" className="notfound__link">
          {lang.notfound.button}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
