/**
 * Socket.io Context for PVP mode
 */
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

// 服务器地址配置
// - 开发环境：设置 REACT_APP_SOCKET_SERVER=http://localhost:3001
// - 生产环境（Docker）：不设置，使用同域连接（通过 nginx 反向代理）
const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_SERVER || undefined;

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState(null);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  // 初始化 Socket 连接
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const newSocket = io(SOCKET_SERVER_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to PVP server');
      setConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from PVP server');
      setConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('connection_failed');
      setConnected(false);
    });

    // 房间事件监听
    newSocket.on('player_joined', ({ room: roomData }) => {
      setRoom(roomData);
    });

    newSocket.on('player_left', ({ room: roomData }) => {
      setRoom(roomData);
    });

    newSocket.on('room_updated', ({ room: roomData }) => {
      setRoom(roomData);
    });

    newSocket.on('room_reset', ({ room: roomData }) => {
      setRoom(roomData);
    });

    newSocket.on('room_settings_updated', ({ room: roomData }) => {
      setRoom(roomData);
    });

    newSocket.on('room_expired', () => {
      setRoom(null);
      setError('room_expired');
    });

    // 游戏事件监听 - 更新房间状态
    newSocket.on('game_started', ({ room: roomData }) => {
      console.log('Game started, updating room state');
      setRoom(roomData);
    });

    newSocket.on('progress_updated', ({ room: roomData }) => {
      setRoom(roomData);
    });

    newSocket.on('game_finished', ({ room: roomData }) => {
      setRoom(roomData);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
  }, []);

  // 断开连接
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
      setRoom(null);
    }
  }, []);

  // 创建房间
  const createRoom = useCallback((playerName, difficulty, gameMode = 'race', timeLimit = null, wordLength = 5) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current?.connected) {
        reject(new Error('Not connected'));
        return;
      }

      socketRef.current.emit('create_room', { 
        playerName, 
        difficulty, 
        gameMode,
        timeLimit: gameMode === 'timed' ? timeLimit : null,
        wordLength
      }, (response) => {
        if (response.success) {
          setRoom(response.room);
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, []);

  // 加入房间
  const joinRoom = useCallback((roomCode, playerName) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current?.connected) {
        reject(new Error('Not connected'));
        return;
      }

      socketRef.current.emit('join_room', { roomCode, playerName }, (response) => {
        if (response.success) {
          setRoom(response.room);
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, []);

  // 设置准备状态
  const setReady = useCallback((ready) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current?.connected) {
        reject(new Error('Not connected'));
        return;
      }

      socketRef.current.emit('set_ready', { ready }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, []);

  // 更新房间设置（仅房主）
  const updateRoomSettings = useCallback((settings) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current?.connected) {
        reject(new Error('Not connected'));
        return;
      }

      socketRef.current.emit('update_room_settings', settings, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, []);

  // 开始游戏
  const startGame = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current?.connected) {
        reject(new Error('Not connected'));
        return;
      }

      socketRef.current.emit('start_game', {}, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, []);

  // 更新进度
  const updateProgress = useCallback((progress, won, correctCount = 0) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('update_progress', { progress, won, correctCount });
  }, []);

  // 再来一局
  const playAgain = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current?.connected) {
        reject(new Error('Not connected'));
        return;
      }

      socketRef.current.emit('play_again', (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, []);

  // 离开房间
  const leaveRoom = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave_room');
    }
    setRoom(null);
  }, []);

  // 清除错误
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 组件卸载时断开连接
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const value = {
    socket,
    connected,
    room,
    error,
    connect,
    disconnect,
    createRoom,
    joinRoom,
    setReady,
    updateRoomSettings,
    startGame,
    updateProgress,
    playAgain,
    leaveRoom,
    clearError,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export default SocketContext;

