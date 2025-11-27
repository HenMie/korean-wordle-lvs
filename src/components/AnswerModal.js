import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "@styles/components/_modal.scss";
import dictionary from "@assets/dictionary.json";
import { useLanguage } from "@contexts/LanguageContext";

const AnswerPopup = (props) => {
  const { lang } = useLanguage();

  const rounds = Math.floor(props.rounds / 5);
  let msg = "";

  switch (rounds) {
    case 1:
      msg = lang.answer.msg1;
      break;
    case 2:
      msg = lang.answer.msg2;
      break;
    case 3:
      msg = lang.answer.msg3;
      break;
    case 4:
      msg = lang.answer.msg4;
      break;
    case 5:
      msg = lang.answer.msg5;
      break;
    default:
      msg = lang.answer.msg6;
  }

  const [isVisible, setIsVisible] = useState(true);
  const [failAnwser] = useState(props.fail);
  const [isMeanWord, setIsMeanWord] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false); // 텍스트 확장 상태

  const navigate = useNavigate();

  const toggleExpand = () => {
    setIsExpanded(true);
  };

  const toggleContract = () => {
    setIsExpanded(false);
  };

  const maxLength = 55;

  const handleCloseClick = () => {
    setIsVisible(false);
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  const handleWordsMeaningClick = () => {
    setIsMeanWord(true);
  };

  const handleNoWordsMeaningClick = () => {
    setIsMeanWord(false);
  };

  function getMeaningForKey(json, searchKey) {
    const items = json.filter((item) => item.key === searchKey);
    return items.map((item) => {
      return {
        mean: item.mean,
        original: item.original,
      };
    });
  }

  const meaning = getMeaningForKey(dictionary, props.answer);

  if (!isVisible) return null;

  const totalPages = meaning.length;

  const handleClick = (pageNumber) => {
    setCurrentPage(pageNumber);
    toggleContract();
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          className={`pagination-btn ${currentPage === i ? "active" : ""}`}
          onClick={() => handleClick(i)}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className="Overlay">
      {!!isMeanWord ? (
        <div className="Content">
          <div className="CloseButton" onClick={handleCloseClick}>
            &times;
          </div>
          <p className="AnswerWord">
            <p className="korean-serif">{props.answer}</p>
            <p className="Original korean-text">{meaning[currentPage - 1].original}</p>
          </p>

          {/* Meaning of words */}
          <div
            className={`AnswerMeaning korean-text ${isExpanded ? "" : "more_active"}`}
            onClick={toggleExpand}
          >
            <div
              dangerouslySetInnerHTML={{
                __html:
                  isExpanded ||
                  meaning[currentPage - 1].mean.length <= maxLength
                    ? meaning[currentPage - 1].mean
                    : meaning[currentPage - 1].mean.substring(0, maxLength) +
                      "...▼",
              }}
            ></div>
          </div>

          {/* 페이지 번호 */}
          <div className="pagination-btn">{renderPageNumbers()}</div>
          <div className="Buttons">
            <div className="HomeButton" onClick={handleNoWordsMeaningClick}>
              {lang.button.back}
            </div>
            <div className="HomeButton" onClick={handleHomeClick}>
              {lang.button.home}
            </div>
          </div>
        </div>
      ) : !failAnwser ? (
        <div className="Content">
          <div className="CloseButton" onClick={handleCloseClick}>
            &times;
          </div>
          <div className="content_txt">
            <p>{msg}</p>
          </div>
          <div className="Buttons">
            <div className="HomeButton" onClick={handleWordsMeaningClick}>
              {lang.button.meaning}
            </div>
            <div className="HomeButton" onClick={handleHomeClick}>
              {lang.button.home}
            </div>
          </div>
        </div>
      ) : (
        <div className="Content">
          <div className="CloseButton" onClick={handleCloseClick}>
            &times;
          </div>
          <div className="content_txt">
            <p>{lang.failed}</p>
          </div>
          <div className="Buttons">
            <div className="HomeButton" onClick={handleHomeClick}>
              {lang.button.home}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnswerPopup;
