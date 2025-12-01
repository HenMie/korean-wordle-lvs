/**
 * PVP Room Page - 等待室 + 游戏页面
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faCrown, 
  faCheck, 
  faCopy,
  faPlay,
  faSpinner,
  faArrowLeft,
  faLink,
  faTrophy,
  faMedal,
  faRedo,
  faBolt,
  faClock,
  faCog,
  faFont
} from '@fortawesome/free-solid-svg-icons';
import { Box } from '@mui/material';

import Header from '@components/Header';
import Keyboard from '@components/Keyboard';
import CentralMessage from '@components/CentralMessage';
import { useSocket } from '@contexts/SocketContext';
import { useLanguage } from '@contexts/LanguageContext';

// 5字模式词库
import hardMode from '@assets/hard-mode.json';
import imdtMode from '@assets/imdt-mode.json';
import easyMode from '@assets/easy-mode.json';
import allDeposedWords from '@assets/all-deposed-words.json';

// 6字模式词库
import hardMode6 from '@assets/hard-mode-6.json';
import imdtMode6 from '@assets/imdt-mode-6.json';
import allDeposedWords6 from '@assets/all-deposed-words-6.json';

// 词典（用于释义查询）
import dictionary from '@assets/dictionary.json';
import dictionary6 from '@assets/dictionary-6.json';

import '@styles/pages/_wordleKor.scss';
import '@styles/pages/_pvpRoom.scss';

// 5字模式映射
const modeMap = {
  easy: easyMode,
  imdt: imdtMode,
  hard: hardMode,
};

// 6字模式映射
const modeMap6 = {
  imdt: imdtMode6,
  hard: hardMode6,
};

function PvpRoom() {
  const { lang } = useLanguage();
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { 
    socket, 
    connected, 
    room, 
    connect, 
    setReady,
    updateRoomSettings,
    startGame: socketStartGame,
    updateProgress,
    playAgain,
    leaveRoom 
  } = useSocket();

  // 等待室状态
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [editDifficulty, setEditDifficulty] = useState('easy');
  const [editWordLength, setEditWordLength] = useState(5);
  const [editGameMode, setEditGameMode] = useState('race');
  const [editTimeLimit, setEditTimeLimit] = useState(3);

  // 游戏状态
  const [pred, setPred] = useState([]);
  const [colorList, setColorList] = useState([]);
  const [listLen, setListLen] = useState(5);
  const [isVisible, setIsVisible] = useState(false);
  const [centerMsg, setCenterMsg] = useState('');
  const [gotAnswer, setGotAnswer] = useState(false);
  const [failAnswer, setFailAnswer] = useState(false);
  const [shakeRow, setShakeRow] = useState(-1);
  const [winRow, setWinRow] = useState(-1);
  const [gameResults, setGameResults] = useState(null);
  
  // 限时模式状态
  const [wordIndices, setWordIndices] = useState([]); // 限时模式的题目顺序
  const [currentWordIdx, setCurrentWordIdx] = useState(0); // 当前题目索引
  const [solvedCount, setSolvedCount] = useState(0); // 答对题目数
  const [remainingTime, setRemainingTime] = useState(null); // 剩余时间（秒）
  
  // 词义查看状态
  const [showMeaning, setShowMeaning] = useState(false);
  const [meaningPage, setMeaningPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  // 根据房间设置确定字数
  const WORD_LENGTH = room?.wordLength || 5;
  const MAX_PRED_LENGTH = 6 * WORD_LENGTH; // 6行 × 字数

  // 获取当前玩家信息
  const currentPlayer = useMemo(() => {
    if (!room || !socket) return null;
    return room.players.find(p => p.id === socket.id);
  }, [room, socket]);

  const isHost = currentPlayer?.isHost || false;

  // 获取词库 - 根据字数选择
  const validWordsSet = useMemo(() => {
    return WORD_LENGTH === 6 ? allDeposedWords6 : allDeposedWords;
  }, [WORD_LENGTH]);

  // 获取词典 - 根据字数选择（用于释义查询）
  const currentDictionary = useMemo(() => {
    return WORD_LENGTH === 6 ? dictionary6 : dictionary;
  }, [WORD_LENGTH]);

  // 获取答案
  const { dict_answer, answer } = useMemo(() => {
    if (!room || !room.difficulty) {
      return { dict_answer: null, answer: '' };
    }
    // 根据字数选择词库
    const wordListMap = WORD_LENGTH === 6 ? modeMap6 : modeMap;
    const wordList = wordListMap[room.difficulty];
    if (!wordList) {
      return { dict_answer: null, answer: '' };
    }
    
    // 限时模式：使用当前题目索引
    if (room.gameMode === 'timed' && wordIndices.length > 0) {
      const wordIdx = wordIndices[currentWordIdx];
      if (wordIdx === undefined || wordIdx >= wordList.length) {
        return { dict_answer: null, answer: '' };
      }
      const dictAnswer = wordList[wordIdx];
      return { dict_answer: dictAnswer, answer: dictAnswer.value };
    }
    
    // 竞速模式：使用房间的wordIndex
    if (room.wordIndex === null || room.wordIndex >= wordList.length) {
      return { dict_answer: null, answer: '' };
    }
    const dictAnswer = wordList[room.wordIndex];
    return { dict_answer: dictAnswer, answer: dictAnswer.value };
  }, [room, wordIndices, currentWordIdx, WORD_LENGTH]);

  // 获取单词释义（缓存结果避免重复计算）
  const answerMeanings = useMemo(() => {
    if (!dict_answer?.key) return [];
    const items = currentDictionary.filter((item) => item.key === dict_answer.key);
    return items.map((item) => ({
      mean: item.mean,
      original: item.original,
    }));
  }, [currentDictionary, dict_answer?.key]);

  // 连接并加入房间
  useEffect(() => {
    if (!connected) {
      connect();
    }
  }, [connect, connected]);
  
  // 限时模式倒计时
  useEffect(() => {
    if (room?.gameMode !== 'timed' || room?.status !== 'playing' || !room?.endTime) {
      return;
    }
    
    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((room.endTime - Date.now()) / 1000));
      setRemainingTime(remaining);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [room?.gameMode, room?.status, room?.endTime]);

  // 监听游戏事件
  useEffect(() => {
    if (!socket) return;

    const handleGameStarted = ({ wordIndex, wordIndices: indices, room: roomData }) => {
      // 重置游戏状态 - 使用房间的字数设置
      const wordLen = roomData.wordLength || 5;
      setPred([]);
      setColorList([]);
      setListLen(wordLen);
      setGotAnswer(false);
      setFailAnswer(false);
      setShakeRow(-1);
      setWinRow(-1);
      setGameResults(null);
      // 重置词义查看状态
      setShowMeaning(false);
      setMeaningPage(1);
      setIsExpanded(false);
      
      // 限时模式初始化
      if (roomData.gameMode === 'timed' && indices) {
        setWordIndices(indices);
        setCurrentWordIdx(0);
        setSolvedCount(0);
        // 计算剩余时间
        if (roomData.endTime) {
          setRemainingTime(Math.max(0, Math.floor((roomData.endTime - Date.now()) / 1000)));
        }
      }
    };

    const handleProgressUpdated = ({ playerId, progress, won, nextWord, newWordIndex, room: roomData }) => {
      // 限时模式：如果是自己且需要跳转下一题
      if (playerId === socket.id && nextWord && roomData.gameMode === 'timed') {
        const wordLen = roomData.wordLength || 5;
        setPred([]);
        setColorList([]);
        setListLen(wordLen);
        setGotAnswer(false);
        setCurrentWordIdx(newWordIndex);
        if (won) {
          setSolvedCount(prev => prev + 1);
        }
      }
    };

    const handleGameFinished = ({ results, room: roomData, reason }) => {
      setGameResults({ results, reason });
      setRemainingTime(null);
    };

    socket.on('game_started', handleGameStarted);
    socket.on('progress_updated', handleProgressUpdated);
    socket.on('game_finished', handleGameFinished);

    return () => {
      socket.off('game_started', handleGameStarted);
      socket.off('progress_updated', handleProgressUpdated);
      socket.off('game_finished', handleGameFinished);
    };
  }, [socket]);

  // 准备状态切换
  const handleToggleReady = async () => {
    try {
      const newReadyState = !currentPlayer?.ready;
      await setReady(newReadyState);
    } catch (err) {
      setError(err.message);
    }
  };

  // 开始游戏
  const handleStartGame = async () => {
    if (!room) return;
    
    // 根据字数选择词库
    const wordListMap = WORD_LENGTH === 6 ? modeMap6 : modeMap;
    const wordList = wordListMap[room.difficulty];
    if (!wordList || wordList.length === 0) {
      setError(lang.pvp?.errors?.unknown || '发生未知错误');
      return;
    }

    setLoading(true);
    try {
      await socketStartGame();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 复制房间码
  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 复制邀请链接
  const handleCopyLink = () => {
    const link = `${window.location.origin}/pvp?room=${roomCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 离开房间
  const handleLeaveRoom = () => {
    leaveRoom();
    navigate('/pvp');
  };

  // 打开设置面板（同步当前房间设置）
  const handleOpenSettings = () => {
    if (room) {
      setEditDifficulty(room.difficulty);
      setEditWordLength(room.wordLength || 5);
      setEditGameMode(room.gameMode);
      setEditTimeLimit(room.timeLimit || 3);
    }
    setShowSettings(true);
  };

  // 保存房间设置
  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await updateRoomSettings({
        difficulty: editDifficulty,
        wordLength: editWordLength,
        gameMode: editGameMode,
        timeLimit: editGameMode === 'timed' ? editTimeLimit : null
      });
      setShowSettings(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 再来一局
  const handlePlayAgain = async () => {
    setLoading(true);
    try {
      await playAgain();
      setGameResults(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 游戏逻辑
  const triggerShake = useCallback((rowIndex) => {
    setShakeRow(rowIndex);
    setTimeout(() => setShakeRow(-1), 500);
  }, []);

  const showMessage = useCallback((m) => {
    setCenterMsg(m);
    setIsVisible(true);
    const currentRow = Math.floor(pred.length / WORD_LENGTH);
    triggerShake(currentRow);
    setTimeout(() => setIsVisible(false), 3000);
  }, [pred.length, triggerShake, WORD_LENGTH]);

  const updateColorPredList = useCallback((predList, ans, len) => {
    const updatedColorList = [];
    const answerArray = ans.split('');
    const answerLetterCount = {};
    const answerUsed = new Array(ans.length).fill(false);

    for (const char of answerArray) {
      answerLetterCount[char] = (answerLetterCount[char] || 0) + 1;
    }

    for (let i = len - WORD_LENGTH; i < len; i++) {
      const item = predList[i];
      if (!item) {
        showMessage(lang.center_msg.lack);
        continue;
      }

      if (ans[i - len + WORD_LENGTH] === item.value) {
        item.color = 'green';
        answerUsed[i - len + WORD_LENGTH] = true;
        answerLetterCount[item.value]--;
        updatedColorList.push('green');
      } else {
        updatedColorList.push(null);
      }

      item.deletable = false;
    }

    for (let i = len - WORD_LENGTH; i < len; i++) {
      const item = predList[i];
      if (updatedColorList[i - len + WORD_LENGTH] === 'green') continue;

      const charIndex = answerArray.findIndex(
        (char, idx) => char === item.value && !answerUsed[idx]
      );

      if (charIndex !== -1 && answerLetterCount[item.value] > 0) {
        item.color = 'yellow';
        answerUsed[charIndex] = true;
        answerLetterCount[item.value]--;
        updatedColorList[i - len + WORD_LENGTH] = 'yellow';
      } else {
        item.color = 'gray';
        updatedColorList[i - len + WORD_LENGTH] = 'gray';
      }

      item.deletable = false;
    }

    return updatedColorList;
  }, [showMessage, lang.center_msg.lack, WORD_LENGTH]);

  const handleSubmitButtonClick = useCallback(() => {
    if (
      pred.length % WORD_LENGTH !== 0 ||
      pred.length === 0 ||
      !pred[pred.length - 1].deletable
    ) {
      return showMessage(lang.center_msg.lack);
    }

    const submitted = pred
      .slice(-WORD_LENGTH)
      .map((obj) => obj.value)
      .join('');
    if (!validWordsSet.includes(submitted)) {
      return showMessage(lang.center_msg.wrong);
    }

    setListLen((prev) => prev + WORD_LENGTH);

    const updatedColorList = updateColorPredList(pred, answer, listLen);
    setPred([...pred]);
    setColorList(prevColors => prevColors.concat(updatedColorList));

    const correctCount = updatedColorList.filter((color) => color === 'green').length;
    const currentRow = Math.floor((pred.length - 1) / WORD_LENGTH);
    const currentProgress = currentRow + 1;

    if (correctCount === WORD_LENGTH) {
      // 胜利
      setTimeout(() => setWinRow(currentRow), WORD_LENGTH * 150 + 500);
      setTimeout(() => {
        if (room?.gameMode === 'timed') {
          // 限时模式：不设置gotAnswer，让玩家继续下一题
          updateProgress(currentProgress, true, correctCount);
        } else {
          setGotAnswer(true);
          updateProgress(currentProgress, true, correctCount);
        }
      }, WORD_LENGTH * 150 + 1200);
    } else if (pred.length === MAX_PRED_LENGTH) {
      // 失败
      setTimeout(() => {
        if (room?.gameMode === 'timed') {
          // 限时模式：跳到下一题
          updateProgress(currentProgress, false, correctCount);
        } else {
          setFailAnswer(true);
          updateProgress(currentProgress, false, correctCount);
        }
      }, WORD_LENGTH * 150 + 500);
    } else {
      // 更新进度
      updateProgress(currentProgress, false, correctCount);
    }
  }, [pred, answer, listLen, updateColorPredList, showMessage, lang.center_msg.lack, lang.center_msg.wrong, updateProgress, room?.gameMode, WORD_LENGTH, MAX_PRED_LENGTH, validWordsSet]);

  const keyboardProps = useMemo(() => ({
    pred,
    setPred,
    gotAnswer,
    listLen,
    showMessage,
    handleSubmitButtonClick,
  }), [pred, gotAnswer, listLen, showMessage, handleSubmitButtonClick]);

  // 检查所有玩家是否准备
  const allPlayersReady = useMemo(() => {
    if (!room || room.players.length < 2) return false;
    return room.players.every(p => p.ready);
  }, [room]);

  // 如果没有连接或没有房间信息
  if (!connected || !room) {
    return (
      <div className="pvp-room">
        <Helmet>
          <title>한글 Wordle | PVP Room</title>
        </Helmet>
        <Header />
        <div className="pvp-room__loading">
          <FontAwesomeIcon icon={faSpinner} spin />
          <span>{lang.pvp?.connecting || '正在连接...'}</span>
        </div>
      </div>
    );
  }

  // 等待室
  if (room.status === 'waiting') {
    return (
      <div className="pvp-room">
        <Helmet>
          <title>한글 Wordle | Room {roomCode}</title>
        </Helmet>
        <Header />

        <div className="pvp-room__waiting">
          {/* 房间信息 */}
          <div className="pvp-room__info">
            <h1 className="pvp-room__title">{lang.pvp?.waiting_room || '等待室'}</h1>
            
            <div className="pvp-room__code-section">
              <span className="pvp-room__code-label">{lang.pvp?.room_code || '房间码'}</span>
              <div className="pvp-room__code">
                <span>{roomCode}</span>
                <button onClick={handleCopyCode} title={lang.pvp?.copy_code || '复制房间码'}>
                  {copied ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faCopy} />}
                </button>
              </div>
            </div>

            <button className="pvp-room__copy-link" onClick={handleCopyLink}>
              <FontAwesomeIcon icon={faLink} />
              <span>{lang.pvp?.copy_link || '复制邀请链接'}</span>
            </button>

            <div className="pvp-room__game-info">
              <div className="pvp-room__info-item">
                <span>{lang.pvp?.game_mode || '模式'}:</span>
                <span className="pvp-room__info-value">
                  <FontAwesomeIcon icon={room.gameMode === 'race' ? faBolt : faClock} />
                  {room.gameMode === 'race' 
                    ? (lang.pvp?.mode_race || '竞速模式') 
                    : (lang.pvp?.mode_timed || '限时模式')}
                  {room.gameMode === 'timed' && room.timeLimit && (
                    <small> ({room.timeLimit}{lang.pvp?.minutes || '分钟'})</small>
                  )}
                </span>
              </div>
              <div className="pvp-room__info-item">
                <span>{lang.pvp?.word_length || '字数'}:</span>
                <span className="pvp-room__info-value">
                  {WORD_LENGTH}{lang.pvp?.letters || '字'}
                </span>
              </div>
              <div className="pvp-room__info-item">
                <span>{lang.pvp?.difficulty || '难度'}:</span>
                <span className="pvp-room__info-value">
                  {room.difficulty === 'easy' ? lang.lv1 : room.difficulty === 'imdt' ? lang.lv2 : lang.lv3}
                </span>
              </div>
              {isHost && (
                <button className="pvp-room__edit-settings-btn" onClick={handleOpenSettings}>
                  <FontAwesomeIcon icon={faCog} />
                  <span>{lang.pvp?.edit_settings || '修改设置'}</span>
                </button>
              )}
            </div>
          </div>

          {/* 房主设置修改弹窗 */}
          {showSettings && isHost && (
            <div className="pvp-room__settings-modal">
              <div className="pvp-room__settings-content">
                <h3>{lang.pvp?.room_settings || '房间设置'}</h3>
                
                {/* 游戏模式 */}
                <div className="pvp-room__settings-field">
                  <label>{lang.pvp?.game_mode || '游戏模式'}</label>
                  <div className="pvp-room__settings-options">
                    <button 
                      className={editGameMode === 'race' ? 'active' : ''}
                      onClick={() => setEditGameMode('race')}
                    >
                      <FontAwesomeIcon icon={faBolt} />
                      <span>{lang.pvp?.mode_race || '竞速模式'}</span>
                    </button>
                    <button 
                      className={editGameMode === 'timed' ? 'active' : ''}
                      onClick={() => setEditGameMode('timed')}
                    >
                      <FontAwesomeIcon icon={faClock} />
                      <span>{lang.pvp?.mode_timed || '限时模式'}</span>
                    </button>
                  </div>
                </div>
                
                {/* 时间限制（仅限时模式） */}
                {editGameMode === 'timed' && (
                  <div className="pvp-room__settings-field">
                    <label>{lang.pvp?.time_limit || '时间限制'}</label>
                    <div className="pvp-room__settings-options time">
                      {[3, 5, 10].map(min => (
                        <button 
                          key={min}
                          className={editTimeLimit === min ? 'active' : ''}
                          onClick={() => setEditTimeLimit(min)}
                        >
                          {min}{lang.pvp?.minutes || '分钟'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 字数选择 */}
                <div className="pvp-room__settings-field">
                  <label>
                    <FontAwesomeIcon icon={faFont} style={{ marginRight: '6px' }} />
                    {lang.pvp?.word_length || '字数'}
                  </label>
                  <div className="pvp-room__settings-options">
                    <button 
                      className={editWordLength === 5 ? 'active' : ''}
                      onClick={() => setEditWordLength(5)}
                    >
                      5{lang.pvp?.letters || '字'}
                    </button>
                    <button 
                      className={editWordLength === 6 ? 'active' : ''}
                      onClick={() => {
                        setEditWordLength(6);
                        // 6字模式没有初级难度
                        if (editDifficulty === 'easy') {
                          setEditDifficulty('imdt');
                        }
                      }}
                    >
                      6{lang.pvp?.letters || '字'}
                    </button>
                  </div>
                </div>
                
                {/* 难度 */}
                <div className="pvp-room__settings-field">
                  <label>{lang.pvp?.difficulty || '难度'}</label>
                  <div className="pvp-room__settings-options">
                    {/* 5字模式才显示初级 */}
                    {editWordLength === 5 && (
                      <button 
                        className={editDifficulty === 'easy' ? 'active' : ''}
                        onClick={() => setEditDifficulty('easy')}
                      >
                        {lang.lv1 || '初级'}
                      </button>
                    )}
                    <button 
                      className={editDifficulty === 'imdt' ? 'active' : ''}
                      onClick={() => setEditDifficulty('imdt')}
                    >
                      {lang.lv2 || '中级'}
                    </button>
                    <button 
                      className={editDifficulty === 'hard' ? 'active' : ''}
                      onClick={() => setEditDifficulty('hard')}
                    >
                      {lang.lv3 || '高级'}
                    </button>
                  </div>
                </div>
                
                <p className="pvp-room__settings-notice">
                  {lang.pvp?.settings_notice || '修改设置后，其他玩家需要重新准备'}
                </p>
                
                <div className="pvp-room__settings-actions">
                  <button 
                    className="pvp-room__settings-cancel"
                    onClick={() => setShowSettings(false)}
                  >
                    {lang.pvp?.cancel || '取消'}
                  </button>
                  <button 
                    className="pvp-room__settings-save"
                    onClick={handleSaveSettings}
                    disabled={loading}
                  >
                    {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : (lang.pvp?.save || '保存')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 玩家列表 */}
          <div className="pvp-room__players">
            <h2>
              <FontAwesomeIcon icon={faUsers} />
              {lang.pvp?.players || '玩家'} ({room.players.length}/{room.maxPlayers})
            </h2>
            <ul className="pvp-room__player-list">
              {room.players.map(player => (
                <li 
                  key={player.id} 
                  className={`pvp-room__player ${player.id === socket.id ? 'current' : ''}`}
                >
                  <span className="pvp-room__player-name">
                    {player.isHost && <FontAwesomeIcon icon={faCrown} className="crown" />}
                    {player.name}
                    {player.id === socket.id && <span className="you">({lang.pvp?.you || '你'})</span>}
                  </span>
                  <span className={`pvp-room__player-status ${player.ready ? 'ready' : ''}`}>
                    {player.ready ? (
                      <>
                        <FontAwesomeIcon icon={faCheck} />
                        {lang.pvp?.ready || '已准备'}
                      </>
                    ) : (
                      lang.pvp?.not_ready || '未准备'
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* 操作按钮 */}
          <div className="pvp-room__actions">
            {isHost ? (
              <button 
                className="pvp-room__start-btn"
                onClick={handleStartGame}
                disabled={!allPlayersReady || loading}
              >
                {loading ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPlay} />
                    {lang.pvp?.start_game || '开始游戏'}
                  </>
                )}
              </button>
            ) : (
              <button 
                className={`pvp-room__ready-btn ${currentPlayer?.ready ? 'ready' : ''}`}
                onClick={handleToggleReady}
              >
                <FontAwesomeIcon icon={faCheck} />
                {currentPlayer?.ready ? lang.pvp?.cancel_ready || '取消准备' : lang.pvp?.ready_up || '准备'}
              </button>
            )}
          </div>

          {!allPlayersReady && isHost && room.players.length >= 2 && (
            <p className="pvp-room__hint">{lang.pvp?.waiting_players || '等待所有玩家准备...'}</p>
          )}
          {room.players.length < 2 && (
            <p className="pvp-room__hint">{lang.pvp?.need_more_players || '至少需要2名玩家'}</p>
          )}

          {error && <div className="pvp-room__error">{error}</div>}
        </div>
      </div>
    );
  }

  // 游戏中或已结束
  return (
    <div className="pvp-room pvp-room--playing">
      <Helmet>
        <title>한글 Wordle | PVP Game</title>
      </Helmet>
      <Header />

      <div className="pvp-room__game">
        {/* 游戏信息栏 */}
        <div className="pvp-room__game-header">
          {/* 限时模式：倒计时和得分 */}
          {room.gameMode === 'timed' && (
            <div className="pvp-room__timer-bar">
              <div className="pvp-room__timer">
                <FontAwesomeIcon icon={faClock} />
                <span className={remainingTime <= 30 ? 'urgent' : ''}>
                  {Math.floor(remainingTime / 60)}:{String(remainingTime % 60).padStart(2, '0')}
                </span>
              </div>
              <div className="pvp-room__score">
                <span>{lang.pvp?.solved || '已解'}: {solvedCount}</span>
              </div>
            </div>
          )}
          
          {/* 竞速模式标识 */}
          {room.gameMode === 'race' && (
            <div className="pvp-room__mode-indicator">
              <FontAwesomeIcon icon={faBolt} />
              <span>{lang.pvp?.mode_race || '竞速模式'}</span>
            </div>
          )}
        </div>

        {/* 对手进度条 */}
        <div className="pvp-room__opponents">
          {room.players
            .filter(p => p.id !== socket?.id)
            .map(player => (
              <div key={player.id} className="pvp-room__opponent">
                <span className="pvp-room__opponent-name">
                  {player.isHost && <FontAwesomeIcon icon={faCrown} className="crown" />}
                  {player.name}
                </span>
                <div className="pvp-room__opponent-progress">
                  <div 
                    className={`pvp-room__progress-bar ${player.finished ? (player.won ? 'won' : 'lost') : ''}`}
                    style={{ width: `${(player.progress / 6) * 100}%` }}
                  />
                </div>
                <span className="pvp-room__opponent-status">
                  {room.gameMode === 'timed' 
                    ? `${player.solvedCount || 0}${lang.pvp?.questions || '题'}`
                    : (player.finished 
                        ? (player.won ? '✓' : '✗') 
                        : `${player.progress}/6`
                      )
                  }
                </span>
              </div>
            ))}
        </div>

        <div className={`pvp-room__play-area wordle-page ${WORD_LENGTH === 6 ? 'wordle-page--6' : ''}`}>
          {/* 游戏面板 */}
          <Box className={`wordle-page__answer-board ${WORD_LENGTH === 6 ? 'wordle-page__answer-board--6' : ''}`}>
            {[...Array(6)].map((_, boxIndex) => (
              <Box 
                key={boxIndex} 
                className={`answer-box ${WORD_LENGTH === 6 ? 'answer-box--6' : ''} ${shakeRow === boxIndex ? 'shake' : ''}`}
              >
                {[...Array(WORD_LENGTH)].map((_, itemIndex) => {
                  const index = boxIndex * WORD_LENGTH + itemIndex;
                  const valueExists = !!pred[index]?.value;
                  const colorClass = colorList[index];
                  
                  let animationClass = '';
                  if (valueExists && !colorClass) {
                    animationClass = 'animate-pop';
                  } else if (colorClass) {
                    animationClass = 'animate-color';
                  }
                  
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

          {/* 键盘 */}
          {!gotAnswer && !failAnswer && !gameResults && <Keyboard {...keyboardProps} />}
        </div>

        {/* 中心消息 */}
        {isVisible && <CentralMessage message={centerMsg} />}

        {/* 游戏结果弹窗 */}
        {gameResults && (
          <div className="pvp-room__results-overlay">
            <div className="pvp-room__results">
              {showMeaning && dict_answer && answerMeanings.length > 0 ? (
                // 词义查看页面
                <>
                  <h2>{lang.button?.meaning || '单词释义'}</h2>
                  
                  <div className="pvp-room__meaning-word">
                    <p className="korean-serif">{dict_answer.key}</p>
                    {answerMeanings[meaningPage - 1]?.original && (
                      <p className="pvp-room__meaning-original korean-text">
                        {answerMeanings[meaningPage - 1].original}
                      </p>
                    )}
                  </div>
                  
                  <div 
                    className={`pvp-room__meaning-content korean-text ${isExpanded ? '' : 'more_active'}`}
                    onClick={() => setIsExpanded(true)}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html:
                          isExpanded ||
                          (answerMeanings[meaningPage - 1]?.mean?.length || 0) <= 55
                            ? answerMeanings[meaningPage - 1]?.mean || ''
                            : (answerMeanings[meaningPage - 1]?.mean?.substring(0, 55) || '') + '...▼',
                      }}
                    />
                  </div>
                  
                  {/* 分页按钮 */}
                  {answerMeanings.length > 1 && (
                    <div className="pvp-room__meaning-pagination">
                      {answerMeanings.map((_, idx) => (
                        <button
                          key={idx}
                          className={`pvp-room__pagination-btn ${meaningPage === idx + 1 ? 'active' : ''}`}
                          onClick={() => {
                            setMeaningPage(idx + 1);
                            setIsExpanded(false);
                          }}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <div className="pvp-room__results-actions pvp-room__results-actions--meaning">
                    <button 
                      className="pvp-room__again-btn"
                      onClick={() => {
                        setShowMeaning(false);
                        setMeaningPage(1);
                        setIsExpanded(false);
                      }}
                    >
                      <FontAwesomeIcon icon={faArrowLeft} />
                      {lang.button?.back || '返回'}
                    </button>
                  </div>
                </>
              ) : (
                // 结果总结页面
                <>
                  <h2>{lang.pvp?.game_over || '游戏结束'}</h2>
                  
                  {/* 结束原因提示 */}
                  {gameResults.reason === 'insufficient_players' && (
                    <p className="pvp-room__end-reason">
                      {lang.pvp?.opponents_left || '对手已离开，游戏提前结束'}
                    </p>
                  )}
                  {gameResults.reason === 'time_up' && (
                    <p className="pvp-room__end-reason time-up">
                      {lang.pvp?.time_up || '时间到！'}
                    </p>
                  )}
                  
                  <div className="pvp-room__ranking">
                    {gameResults.results.map((result, index) => (
                      <div 
                        key={result.playerId} 
                        className={`pvp-room__rank-item ${result.playerId === socket?.id ? 'current' : ''}`}
                      >
                        <span className="pvp-room__rank-position">
                          {index === 0 && <FontAwesomeIcon icon={faTrophy} className="gold" />}
                          {index === 1 && <FontAwesomeIcon icon={faMedal} className="silver" />}
                          {index === 2 && <FontAwesomeIcon icon={faMedal} className="bronze" />}
                          {index > 2 && `#${index + 1}`}
                        </span>
                        <span className="pvp-room__rank-name">{result.playerName}</span>
                        <span className="pvp-room__rank-stats">
                          {room.gameMode === 'timed' ? (
                            // 限时模式：显示答对题数
                            `${result.solvedCount || 0} ${lang.pvp?.questions || '题'}`
                          ) : (
                            // 竞速模式：显示尝试次数/时间或正确字母数
                            result.won 
                              ? `${result.attempts} ${lang.pvp?.attempts || '次'} / ${(result.time / 1000).toFixed(1)}s`
                              : `${result.correctCount || 0}/${WORD_LENGTH} ${lang.pvp?.correct_letters || '正确'}`
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* 答案展示 - 仅竞速模式 */}
                  {room.gameMode === 'race' && dict_answer && (
                    <div 
                      className="pvp-room__answer-reveal pvp-room__answer-reveal--clickable"
                      onClick={() => setShowMeaning(true)}
                      title={lang.button?.meaning || '查看释义'}
                    >
                      <span>{lang.pvp?.answer_was || '正确答案'}:</span>
                      <span className="pvp-room__answer korean-text">{dict_answer?.key}</span>
                      <span className="pvp-room__view-meaning">{lang.button?.meaning || '查看释义'} →</span>
                    </div>
                  )}

                  <div className="pvp-room__results-actions">
                    {isHost ? (
                      <button 
                        className="pvp-room__again-btn"
                        onClick={handlePlayAgain}
                        disabled={loading}
                      >
                        {loading ? (
                          <FontAwesomeIcon icon={faSpinner} spin />
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faRedo} />
                            {lang.pvp?.play_again || '再来一局'}
                          </>
                        )}
                      </button>
                    ) : (
                      <p className="pvp-room__wait-host">{lang.pvp?.wait_host || '等待房主开始下一局...'}</p>
                    )}
                    <button className="pvp-room__leave-btn" onClick={handleLeaveRoom}>
                      <FontAwesomeIcon icon={faArrowLeft} />
                      {lang.pvp?.leave || '离开房间'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PvpRoom;

