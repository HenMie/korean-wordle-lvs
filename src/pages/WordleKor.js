// React
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";

// style
import { Box } from "@mui/material";
import "@styles/pages/_wordleKor.scss";

// Components
import Header from "@components/Header.js";
import CentralMessage from "@components/CentralMessage.js";
import AnswerPopup from "@components/AnswerModal.js";
import Keyboard from "@components/Keyboard.js";
import ResumeGameModal from "@components/ResumeGameModal.js";

// Data
import hardMode from "@assets/hard-mode.json";
import imdtMode from "@assets/imdt-mode.json";
import easyMode from "@assets/easy-mode.json";
import allDeposedWords from "@assets/all-deposed-words.json";

// Lang
import { useLanguage } from "@contexts/LanguageContext";
import { Helmet } from "react-helmet";

const modeMap = {
  easy: easyMode,
  imdt: imdtMode,
  hard: hardMode,
};

// Helper functions for game state persistence
const getGameStateKey = (mode) => `wordle_game_${mode}`;

const saveGameState = (mode, state) => {
  localStorage.setItem(getGameStateKey(mode), JSON.stringify(state));
};

const loadGameState = (mode) => {
  const saved = localStorage.getItem(getGameStateKey(mode));
  return saved ? JSON.parse(saved) : null;
};

const clearGameState = (mode) => {
  localStorage.removeItem(getGameStateKey(mode));
};

function WordleKorPage() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [pred, setPred] = useState([]); // List of input
  const [colorList, setColorList] = useState([]); // List of color
  const [listLen, setListLen] = useState(5);
  const [isVisible, setIsVisible] = useState(false);
  const [centerMsg, setCenterMsg] = useState("");
  const [gotAnswer, setGotAnswer] = useState(false);
  const [failAnswer, setFailAnswer] = useState(false);
  const [shakeRow, setShakeRow] = useState(-1); // 抖动的行索引
  const [winRow, setWinRow] = useState(-1); // 获胜动画的行索引
  
  // States for resume game dialog
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [savedGame, setSavedGame] = useState(null);
  const [gameInitialized, setGameInitialized] = useState(false);

  const MAX_PRED_LENGTH = 30;

  // Get mode and id from URL params
  const { mode, id } = useParams();
  const jsonData = allDeposedWords;
  const formattedMode = mode ? mode.charAt(0).toUpperCase() + mode.slice(1) : "";

  const selectedMode = modeMap[mode];
  
  // Validate mode and id
  const wordIndex = parseInt(id, 10);
  const isValidMode = selectedMode !== undefined;
  const isValidId = !isNaN(wordIndex) && wordIndex >= 0 && selectedMode && wordIndex < selectedMode.length;
  
  // Get the answer (use memo to avoid recalculation, with fallback for invalid cases)
  const { dict_answer, answer } = useMemo(() => {
    if (isValidMode && isValidId) {
      const dictAnswer = selectedMode[wordIndex];
      return { dict_answer: dictAnswer, answer: dictAnswer.value };
    }
    return { dict_answer: null, answer: "" };
  }, [isValidMode, isValidId, selectedMode, wordIndex]);

  // Handle resume game
  const handleResumeGame = useCallback(() => {
    if (savedGame) {
      // Navigate to the saved game's puzzle
      navigate(`/play/${mode}/${savedGame.wordIndex}`);
      // Restore the game state
      setPred(savedGame.pred || []);
      setColorList(savedGame.colorList || []);
      setListLen(savedGame.listLen || 5);
    }
    setShowResumeModal(false);
    setGameInitialized(true);
  }, [savedGame, mode, navigate]);

  // Handle new game
  const handleNewGame = useCallback(() => {
    clearGameState(mode);
    setShowResumeModal(false);
    setGameInitialized(true);
  }, [mode]);

  // Check for saved game on mount
  useEffect(() => {
    if (!gameInitialized && mode && isValidMode && isValidId) {
      const saved = loadGameState(mode);
      if (saved && saved.wordIndex !== wordIndex) {
        // There's a saved game with a different puzzle
        setSavedGame(saved);
        setShowResumeModal(true);
      } else if (saved && saved.wordIndex === wordIndex) {
        // Same puzzle, just restore the state
        setPred(saved.pred || []);
        setColorList(saved.colorList || []);
        setListLen(saved.listLen || 5);
        setGameInitialized(true);
      } else {
        setGameInitialized(true);
      }
    }
  }, [mode, wordIndex, gameInitialized, isValidMode, isValidId]);

  // Save game state whenever pred or colorList changes
  useEffect(() => {
    if (gameInitialized && mode && pred.length > 0 && !gotAnswer && !failAnswer) {
      saveGameState(mode, {
        wordIndex,
        pred,
        colorList,
        listLen
      });
    }
  }, [pred, colorList, listLen, mode, wordIndex, gameInitialized, gotAnswer, failAnswer]);

  // Clear game state when game ends
  useEffect(() => {
    if ((gotAnswer || failAnswer) && mode) {
      clearGameState(mode);
    }
  }, [gotAnswer, failAnswer, mode]);

  // 触发行抖动动画
  const triggerShake = useCallback((rowIndex) => {
    setShakeRow(rowIndex);
    setTimeout(() => setShakeRow(-1), 500);
  }, []);

  const showMessage = useCallback((m) => {
    setCenterMsg(m);
    setIsVisible(true);
    // 同时触发当前行的抖动
    const currentRow = Math.floor(pred.length / 5);
    triggerShake(currentRow);
    setTimeout(() => {
      setIsVisible(false);
    }, 3000);
  }, [pred.length, triggerShake]);

  const updateColorPredList = useCallback((predList, ans, len) => {
    const updatedColorList = [];
    const answerArray = ans.split("");
    const answerLetterCount = {};
    const answerUsed = new Array(ans.length).fill(false);
  
    for (const char of answerArray) {
      answerLetterCount[char] = (answerLetterCount[char] || 0) + 1;
    }
  
    for (let i = len - 5; i < len; i++) {
      const item = predList[i];
      if (!item) {
        showMessage(lang.center_msg.lack);
        continue;
      }
  
      if (ans[i - len + 5] === item.value) {
        item.color = "green";
        answerUsed[i - len + 5] = true;
        answerLetterCount[item.value]--;
        updatedColorList.push("green");
      } else {
        updatedColorList.push(null);
      }
  
      item.deletable = false;
    }
  
    for (let i = len - 5; i < len; i++) {
      const item = predList[i];
      if (updatedColorList[i - len + 5] === "green") continue;
  
      const charIndex = answerArray.findIndex(
        (char, idx) => char === item.value && !answerUsed[idx]
      );
  
      if (charIndex !== -1 && answerLetterCount[item.value] > 0) {
        item.color = "yellow";
        answerUsed[charIndex] = true;
        answerLetterCount[item.value]--;
        updatedColorList[i - len + 5] = "yellow";
      } else {
        item.color = "gray";
        updatedColorList[i - len + 5] = "gray";
      }
  
      item.deletable = false;
    }
  
    return updatedColorList;
  }, [showMessage, lang.center_msg.lack]);
  
  const handleSubmitButtonClick = useCallback(() => {
    if (
      pred.length % 5 !== 0 ||
      pred.length === 0 ||
      !pred[pred.length - 1].deletable
    ) {
      return showMessage(lang.center_msg.lack);
    }

    const submitted = pred
      .slice(-5)
      .map((obj) => obj.value)
      .join("");
    if (!jsonData.includes(submitted)) {
      return showMessage(lang.center_msg.wrong);
    }

    setListLen((prev) => prev + 5);

    const updatedColorList = updateColorPredList(pred, answer, listLen);
    setPred([...pred]);
    setColorList(prevColors => prevColors.concat(updatedColorList));

    const correctCount = updatedColorList.filter((color) => color === "green").length;
    const currentRow = Math.floor((pred.length - 1) / 5);

    if (correctCount === 5) {
      // 延迟触发获胜动画，等翻转完成后
      setTimeout(() => {
        setWinRow(currentRow);
      }, 5 * 150 + 500); // 5个格子翻转 + 最后一个动画时间
      
      setTimeout(() => {
        setGotAnswer(true);
      }, 5 * 150 + 1200); // 再等获胜动画
    } else if (pred.length === MAX_PRED_LENGTH) {
      setTimeout(() => {
        setFailAnswer(true);
      }, 5 * 150 + 500);
    }
  }, [pred, jsonData, answer, listLen, updateColorPredList, showMessage, lang.center_msg.lack, lang.center_msg.wrong]);

  const keyboardProps = useMemo(() => ({
    pred,
    setPred,
    gotAnswer,
    listLen,
    showMessage,
    handleSubmitButtonClick,
  }), [pred, gotAnswer, listLen, showMessage, handleSubmitButtonClick]);

  // If invalid, redirect to home (this check must be after all hooks)
  if (!isValidMode || !isValidId) {
    return <Navigate to="/" replace />;
  }

  // Don't render the game until initialized (to avoid flicker)
  if (!gameInitialized && !showResumeModal) {
    return (
      <div className="wordle-page">
        <Helmet>
          <title>한글 Wordle | {formattedMode} mode</title>
        </Helmet>
        <Header />
      </div>
    );
  }

  return (
    <div className="wordle-page">
      <Helmet>
        <title>한글 Wordle | {formattedMode} mode</title>
      </Helmet>
      <Header />
      
      {/* Resume Game Modal */}
      {showResumeModal && (
        <ResumeGameModal
          onResume={handleResumeGame}
          onNewGame={handleNewGame}
        />
      )}
      
      <Box className="wordle-page__answer-board">
        {[...Array(6)].map((_, boxIndex) => (
          <Box 
            key={boxIndex} 
            className={`answer-box ${shakeRow === boxIndex ? 'shake' : ''}`}
          >
            {[...Array(5)].map((_, itemIndex) => {
              const index = boxIndex * 5 + itemIndex;
              const valueExists = !!pred[index]?.value;
              const colorClass = colorList[index];
              
              // 动画类名逻辑
              let animationClass = '';
              if (valueExists && !colorClass) {
                // 刚输入的字母 - Pop 动画
                animationClass = 'animate-pop';
              } else if (colorClass) {
                // 有颜色 - 翻转动画
                animationClass = 'animate-color';
              }
              
              // 获胜动画
              if (winRow === boxIndex && colorClass === 'green') {
                animationClass += ' animate-win';
              }
              
              return (
                <div
                                  key={index}
                                  className={`korean-text ${colorClass || ''} ${animationClass}`.trim()}
                                >
                                  {pred[index]?.value}
                                </div>
              );
            })}
          </Box>
        ))}
      </Box>

      {/* Keyboard */}
      <Keyboard {...keyboardProps} />

      {/* Center Message */}
      {isVisible && <CentralMessage message={centerMsg} />}

      {/* Answer modal */}
      {(gotAnswer || failAnswer) && (
        <AnswerPopup
          rounds={pred.length}
          fail={failAnswer}
          answer={dict_answer.key}
          colorList={colorList}
          wordIndex={wordIndex}
          mode={mode}
        />
      )}
    </div>
  );
}

export default WordleKorPage;
