import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "@styles/components/_modal.scss";
import dictionary from "@assets/dictionary.json";
import { useLanguage } from "@contexts/LanguageContext";

const AnswerPopup = (props) => {
  const { lang } = useLanguage();
  const { 
    rounds, 
    fail, 
    answer, 
    colorList = [], 
    wordIndex, 
    mode 
  } = props;

  const attempts = Math.floor(rounds / 5);
  let msg = "";

  switch (attempts) {
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
  const [failAnswer] = useState(fail);
  const [isMeanWord, setIsMeanWord] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

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

  // 生成分享内容的颜色方块
  const generateShareGrid = useCallback(() => {
    const rows = [];
    for (let i = 0; i < colorList.length; i += 5) {
      const row = colorList.slice(i, i + 5).map(color => {
        switch (color) {
          case 'green':
            return '🟩';
          case 'yellow':
            return '🟨';
          case 'gray':
          default:
            return '⬜';
        }
      }).join('');
      rows.push(row);
    }
    return rows.join('\n');
  }, [colorList]);

  // 处理分享功能
  const handleShare = useCallback(async () => {
    const puzzleNum = wordIndex + 1;
    const attemptsText = failAnswer ? 'X' : attempts;
    const baseUrl = window.location.origin;
    const puzzleUrl = `${baseUrl}/play/${mode}/${wordIndex}`;
    
    const shareText = `한글 Wordle ${mode}#${puzzleNum} ${attemptsText}/6

${puzzleUrl}

${generateShareGrid()}`;

    try {
      await navigator.clipboard.writeText(shareText);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      } catch (e) {
        console.error('Failed to copy:', e);
      }
      document.body.removeChild(textArea);
    }
  }, [wordIndex, mode, attempts, failAnswer, generateShareGrid]);

  function getMeaningForKey(json, searchKey) {
    const items = json.filter((item) => item.key === searchKey);
    return items.map((item) => {
      return {
        mean: item.mean,
        original: item.original,
      };
    });
  }

  const meaning = getMeaningForKey(dictionary, answer);

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

  // 渲染结果方块预览
  const renderResultGrid = () => {
    const rows = [];
    for (let i = 0; i < colorList.length; i += 5) {
      const row = colorList.slice(i, i + 5);
      rows.push(
        <div key={i} className="result-row">
          {row.map((color, idx) => (
            <span 
              key={idx} 
              className={`result-tile ${color}`}
            />
          ))}
        </div>
      );
    }
    return rows;
  };

  // 获取难度显示名称
  const getModeLabel = () => {
    switch(mode) {
      case 'easy': return lang.lv1;
      case 'imdt': return lang.lv2;
      case 'hard': return lang.lv3;
      default: return mode;
    }
  };

  return (
    <div className="Overlay">
      {!!isMeanWord ? (
        // 词义页面
        <div className="Content">
          <div className="CloseButton" onClick={handleCloseClick}>
            &times;
          </div>
          <p className="AnswerWord">
            <p className="korean-serif">{answer}</p>
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
      ) : !failAnswer ? (
        // 成功页面 - 包含更多信息和分享功能
        <div className="Content summary-content">
          <div className="CloseButton" onClick={handleCloseClick}>
            &times;
          </div>
          
          {/* 统计信息头部 */}
          <div className="summary-header">
            <div className="summary-badge">{getModeLabel()}</div>
            <div className="summary-title">
              #{wordIndex + 1}
            </div>
            <div className="summary-stats">
              <span className="attempts-count">{attempts}</span>
              <span className="attempts-label">/6 {lang.share?.attempts || '次尝试'}</span>
            </div>
          </div>
          
          {/* 祝贺消息 */}
          <div className="content_txt">
            <p>{msg}</p>
          </div>
          
          {/* 结果方块预览 */}
          <div className="result-grid">
            {renderResultGrid()}
          </div>
          
          {/* 操作按钮 */}
          <div className="Buttons">
            <div className="HomeButton share-btn" onClick={handleShare}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                <polyline points="16 6 12 2 8 6"></polyline>
                <line x1="12" y1="2" x2="12" y2="15"></line>
              </svg>
              {showCopied ? (lang.share?.copied || '已复制!') : (lang.share?.button || '分享')}
            </div>
            <div className="HomeButton" onClick={handleWordsMeaningClick}>
              {lang.button.meaning}
            </div>
            <div className="HomeButton secondary" onClick={handleHomeClick}>
              {lang.button.home}
            </div>
          </div>
        </div>
      ) : (
        // 失败页面 - 也显示结果和分享
        <div className="Content summary-content">
          <div className="CloseButton" onClick={handleCloseClick}>
            &times;
          </div>
          
          {/* 统计信息头部 */}
          <div className="summary-header">
            <div className="summary-badge">{getModeLabel()}</div>
            <div className="summary-title">
              #{wordIndex + 1}
            </div>
            <div className="summary-stats failed">
              <span className="attempts-count">X</span>
              <span className="attempts-label">/6</span>
            </div>
          </div>
          
          {/* 失败消息 */}
          <div className="content_txt">
            <p>{lang.failed}</p>
          </div>
          
          {/* 显示正确答案 */}
          <div className="correct-answer">
            <span className="answer-label">{lang.share?.answer || '正确答案'}</span>
            <span className="answer-word korean-serif">{answer}</span>
          </div>
          
          {/* 结果方块预览 */}
          <div className="result-grid">
            {renderResultGrid()}
          </div>
          
          {/* 操作按钮 */}
          <div className="Buttons">
            <div className="HomeButton share-btn" onClick={handleShare}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                <polyline points="16 6 12 2 8 6"></polyline>
                <line x1="12" y1="2" x2="12" y2="15"></line>
              </svg>
              {showCopied ? (lang.share?.copied || '已复制!') : (lang.share?.button || '分享')}
            </div>
            <div className="HomeButton" onClick={handleWordsMeaningClick}>
              {lang.button.meaning}
            </div>
            <div className="HomeButton secondary" onClick={handleHomeClick}>
              {lang.button.home}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnswerPopup;
