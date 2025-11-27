// React
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// State
import { useRecoilState } from "recoil";
import { sidebarState } from "@state/sidebarState.js";

// Style
import "@styles/components/_header.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faQuestionCircle,
  faCog,
} from "@fortawesome/free-solid-svg-icons";

// Components
import InfoModal from "./InfoModal.js";
import Sidebar from "./Sidebar.js";
import LangBtn from "./LangBtn.js";

// localStorage key for first visit check
const FIRST_VISIT_KEY = "wordle_has_seen_rules";

function Header() {
  const navi = useNavigate();
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useRecoilState(sidebarState);
  const [shouldRenderSidebar, setShouldRenderSidebar] = useState(false);

  // Show rules modal on first visit
  useEffect(() => {
    const hasSeenRules = localStorage.getItem(FIRST_VISIT_KEY);
    if (!hasSeenRules) {
      setShowInfoModal(true);
    }
  }, []);

  const goHome = () => {
    navi("/");
  };

  const handleCloseInfoModal = () => {
    setShowInfoModal(false);
    // Mark that user has seen the rules
    localStorage.setItem(FIRST_VISIT_KEY, "true");
  };

  const toggleInfoModal = () => {
    if (showInfoModal) {
      handleCloseInfoModal();
    } else {
      setShowInfoModal(true);
    }
  };

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    if (sidebarOpen) {
      setShouldRenderSidebar(true);
    } else {
      const timer = setTimeout(() => {
        setShouldRenderSidebar(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [sidebarOpen]);

  return (
    <>
      <div className="header-container">
        <div className="header">
          <div className="header__icon-first" onClick={goHome}>
            <FontAwesomeIcon icon={faHome} />
          </div>
          <div className="header__title" onClick={goHome}>
            <p className="header__title--kor korean-text">한글</p>
            <p className="header__title--eng">Wordle</p>
          </div>
          <div className="header__icon-second">
            <div className="icon-items" onClick={toggleInfoModal}>
              <FontAwesomeIcon icon={faQuestionCircle} />
            </div>
            <div className="icon-items">
              <LangBtn />
            </div>
            <div className="icon-items" onClick={toggleSidebar}>
              <FontAwesomeIcon icon={faCog} />
            </div>
          </div>
          {shouldRenderSidebar && <Sidebar />}
        </div>
      </div>
      {showInfoModal && <InfoModal onClose={handleCloseInfoModal} />}
    </>
  );
}

export default Header;
