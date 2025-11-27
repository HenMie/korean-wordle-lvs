/**
 * PVP Lobby Page - 创建或加入对战房间
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faPlus, 
  faSignInAlt, 
  faArrowLeft,
  faSpinner,
  faGamepad
} from '@fortawesome/free-solid-svg-icons';

import Header from '@components/Header';
import { useSocket } from '@contexts/SocketContext';
import { useLanguage } from '@contexts/LanguageContext';

import '@styles/pages/_pvpLobby.scss';

function PvpLobby() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { connected, connect, createRoom, joinRoom, error, clearError } = useSocket();

  // 状态
  const [mode, setMode] = useState('menu'); // menu, create, join
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [difficulty, setDifficulty] = useState('imdt');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  // 从 URL 获取邀请码
  useEffect(() => {
    const inviteCode = searchParams.get('room');
    if (inviteCode) {
      setRoomCode(inviteCode);
      setMode('join');
    }
  }, [searchParams]);

  // 连接服务器
  useEffect(() => {
    connect();
  }, [connect]);

  // 从 localStorage 恢复玩家名
  useEffect(() => {
    const savedName = localStorage.getItem('pvp_player_name');
    if (savedName) {
      setPlayerName(savedName);
    }
  }, []);

  // 清除错误
  useEffect(() => {
    if (error) {
      setLocalError(getErrorMessage(error));
      clearError();
    }
  }, [error, clearError]);

  const getErrorMessage = (errorCode) => {
    const messages = {
      connection_failed: lang.pvp?.errors?.connection_failed || '连接服务器失败，请稍后重试',
      room_not_found: lang.pvp?.errors?.room_not_found || '房间不存在或已关闭',
      room_full: lang.pvp?.errors?.room_full || '房间已满',
      game_started: lang.pvp?.errors?.game_started || '游戏已开始，无法加入',
      room_expired: lang.pvp?.errors?.room_expired || '房间已过期',
    };
    return messages[errorCode] || lang.pvp?.errors?.unknown || '发生未知错误';
  };

  // 创建房间
  const handleCreateRoom = useCallback(async () => {
    if (!playerName.trim()) {
      setLocalError(lang.pvp?.errors?.name_required || '请输入昵称');
      return;
    }

    setLoading(true);
    setLocalError('');

    try {
      localStorage.setItem('pvp_player_name', playerName.trim());
      const response = await createRoom(playerName.trim(), difficulty, maxPlayers);
      navigate(`/pvp/room/${response.roomCode}`);
    } catch (err) {
      setLocalError(getErrorMessage(err.message));
    } finally {
      setLoading(false);
    }
  }, [playerName, difficulty, maxPlayers, createRoom, navigate, lang]);

  // 加入房间
  const handleJoinRoom = useCallback(async () => {
    if (!playerName.trim()) {
      setLocalError(lang.pvp?.errors?.name_required || '请输入昵称');
      return;
    }
    if (!roomCode.trim() || roomCode.length !== 6) {
      setLocalError(lang.pvp?.errors?.invalid_code || '请输入6位房间码');
      return;
    }

    setLoading(true);
    setLocalError('');

    try {
      localStorage.setItem('pvp_player_name', playerName.trim());
      await joinRoom(roomCode.trim(), playerName.trim());
      navigate(`/pvp/room/${roomCode.trim()}`);
    } catch (err) {
      setLocalError(getErrorMessage(err.message));
    } finally {
      setLoading(false);
    }
  }, [playerName, roomCode, joinRoom, navigate, lang]);

  const goBack = () => {
    if (mode === 'menu') {
      navigate('/');
    } else {
      setMode('menu');
      setLocalError('');
    }
  };

  return (
    <div className="pvp-lobby">
      <Helmet>
        <title>한글 Wordle | PVP</title>
      </Helmet>
      <Header />

      <div className="pvp-lobby__content">
        {/* 返回按钮 */}
        <button className="pvp-lobby__back" onClick={goBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>{lang.button?.back || '返回'}</span>
        </button>

        {/* 连接状态 */}
        {!connected && (
          <div className="pvp-lobby__connecting">
            <FontAwesomeIcon icon={faSpinner} spin />
            <span>{lang.pvp?.connecting || '正在连接服务器...'}</span>
          </div>
        )}

        {/* 主菜单 */}
        {mode === 'menu' && connected && (
          <div className="pvp-lobby__menu">
            <div className="pvp-lobby__icon">
              <FontAwesomeIcon icon={faGamepad} />
            </div>
            <h1 className="pvp-lobby__title">{lang.pvp?.title || 'PVP 对战'}</h1>
            <p className="pvp-lobby__desc">{lang.pvp?.desc || '与好友一起比拼，看谁猜得更快！'}</p>

            <div className="pvp-lobby__buttons">
              <button 
                className="pvp-lobby__btn pvp-lobby__btn--create"
                onClick={() => setMode('create')}
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>{lang.pvp?.create_room || '创建房间'}</span>
              </button>
              <button 
                className="pvp-lobby__btn pvp-lobby__btn--join"
                onClick={() => setMode('join')}
              >
                <FontAwesomeIcon icon={faSignInAlt} />
                <span>{lang.pvp?.join_room || '加入房间'}</span>
              </button>
            </div>
          </div>
        )}

        {/* 创建房间 */}
        {mode === 'create' && connected && (
          <div className="pvp-lobby__form">
            <h2 className="pvp-lobby__form-title">
              <FontAwesomeIcon icon={faPlus} />
              {lang.pvp?.create_room || '创建房间'}
            </h2>

            {/* 昵称输入 */}
            <div className="pvp-lobby__field">
              <label>{lang.pvp?.nickname || '昵称'}</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder={lang.pvp?.nickname_placeholder || '输入你的昵称'}
                maxLength={12}
              />
            </div>

            {/* 难度选择 */}
            <div className="pvp-lobby__field">
              <label>{lang.pvp?.difficulty || '难度'}</label>
              <div className="pvp-lobby__difficulty">
                <button 
                  className={`pvp-lobby__diff-btn ${difficulty === 'easy' ? 'active' : ''}`}
                  onClick={() => setDifficulty('easy')}
                >
                  {lang.lv1 || '初级'}
                </button>
                <button 
                  className={`pvp-lobby__diff-btn ${difficulty === 'imdt' ? 'active' : ''}`}
                  onClick={() => setDifficulty('imdt')}
                >
                  {lang.lv2 || '中级'}
                </button>
                <button 
                  className={`pvp-lobby__diff-btn ${difficulty === 'hard' ? 'active' : ''}`}
                  onClick={() => setDifficulty('hard')}
                >
                  {lang.lv3 || '高级'}
                </button>
              </div>
            </div>

            {/* 人数选择 */}
            <div className="pvp-lobby__field">
              <label>{lang.pvp?.max_players || '最大人数'}</label>
              <div className="pvp-lobby__players">
                {[2, 3, 4].map(num => (
                  <button 
                    key={num}
                    className={`pvp-lobby__player-btn ${maxPlayers === num ? 'active' : ''}`}
                    onClick={() => setMaxPlayers(num)}
                  >
                    <FontAwesomeIcon icon={faUsers} />
                    <span>{num}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 错误提示 */}
            {localError && (
              <div className="pvp-lobby__error">{localError}</div>
            )}

            {/* 提交按钮 */}
            <button 
              className="pvp-lobby__submit"
              onClick={handleCreateRoom}
              disabled={loading}
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <>
                  <FontAwesomeIcon icon={faPlus} />
                  {lang.pvp?.create || '创建'}
                </>
              )}
            </button>
          </div>
        )}

        {/* 加入房间 */}
        {mode === 'join' && connected && (
          <div className="pvp-lobby__form">
            <h2 className="pvp-lobby__form-title">
              <FontAwesomeIcon icon={faSignInAlt} />
              {lang.pvp?.join_room || '加入房间'}
            </h2>

            {/* 昵称输入 */}
            <div className="pvp-lobby__field">
              <label>{lang.pvp?.nickname || '昵称'}</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder={lang.pvp?.nickname_placeholder || '输入你的昵称'}
                maxLength={12}
              />
            </div>

            {/* 房间码输入 */}
            <div className="pvp-lobby__field">
              <label>{lang.pvp?.room_code || '房间码'}</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={lang.pvp?.room_code_placeholder || '输入6位数字房间码'}
                maxLength={6}
                className="pvp-lobby__room-code-input"
              />
            </div>

            {/* 错误提示 */}
            {localError && (
              <div className="pvp-lobby__error">{localError}</div>
            )}

            {/* 提交按钮 */}
            <button 
              className="pvp-lobby__submit"
              onClick={handleJoinRoom}
              disabled={loading}
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <>
                  <FontAwesomeIcon icon={faSignInAlt} />
                  {lang.pvp?.join || '加入'}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PvpLobby;

