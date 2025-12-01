// React
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Style
import "@styles/components/_infoModal.scss";

// Pages
import Page100 from "@pages/modal/InfoPage100";
import Page200 from "@pages/modal/InfoPage200";
import Page300 from "@pages/modal/InfoPage300";
import Page400 from "@pages/modal/InfoPage400";
import Page500 from "@pages/modal/InfoPage500";
import Page600 from "@pages/modal/InfoPage600";
import Page700 from "@pages/modal/InfoPage700";

// Message
import CentralMessage from "@components/CentralMessage";
import { useLanguage } from "@contexts/LanguageContext";

const InfoModal = ({ onClose }) => {
  const { lang } = useLanguage();

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 7;
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const firstPage = () => {
    setCurrentPage(2);
  };

  function showMessage() {
    setIsVisible(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 3000);
  }

  const gamePage = () => {
    if (location.pathname.includes("/play")) {
      showMessage();
    }

    navigate("/play/easy");
  };

  return (
    <div className="overlay">
      <div className="info__modal">
        <button className="close--btn" onClick={onClose}>
          &times;
        </button>

        {currentPage === 1 && <Page100 />}
        {currentPage === 2 && <Page200 />}
        {currentPage === 3 && <Page300 />}
        {currentPage === 4 && <Page400 />}
        {currentPage === 5 && <Page500 />}
        {currentPage === 6 && <Page600 />}
        {currentPage === 7 && <Page700 />}

        <div className="navigation">
          {currentPage === 1 && (
            <button className="prev--btn try-btn" onClick={firstPage}>
              {lang.button.example}
            </button>
          )}
          {currentPage > 1 && (
            <button className="prev--btn" onClick={prevPage}>
              &#8592; {lang.button.prev}
            </button>
          )}
          {currentPage < totalPages && currentPage !== 1 && (
            <button className="next--btn" onClick={nextPage}>
              {lang.button.next} &#8594;
            </button>
          )}
          {currentPage === 7 && (
            <button className="next--btn" onClick={gamePage}>
              {lang.button.start}
            </button>
          )}
        </div>
      </div>
      {isVisible ? (
        <CentralMessage message={lang.center_msg.play_block} />
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default InfoModal;
