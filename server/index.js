/**
 * Korean Wordle PVP Server
 * WebSocket server for real-time multiplayer Wordle
 */

// 加载 .env 文件（优先当前目录，然后项目根目录）
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const {
  getWordList,
  resolveWordLength,
  resolveDifficulty,
  resolveGameMode,
  resolveTimeLimit,
  DEFAULT_TIME_LIMIT,
} = require('./utils/wordLists');
const analyticsRouter = require('./routes/analytics');

const app = express();
app.use(express.json());

const rawOrigins = process.env.PVP_CLIENT_URL || process.env.CLIENT_URL || '*';
const allowedOrigins =
  rawOrigins === '*' ? '*' : rawOrigins.split(',').map((origin) => origin.trim()).filter(Boolean);

const corsOptions = {
  origin: allowedOrigins === '*' ? true : allowedOrigins,
  methods: ['GET', 'POST'],
  credentials: true
};

app.use(cors(corsOptions));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: corsOptions
});

// 房间存储
const rooms = new Map();

// 生成6位数字房间码
function generateRoomCode() {
  let code;
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  } while (rooms.has(code));
  return code;
}

// 房间类
class Room {
  constructor(hostId, hostName, difficulty, gameMode = 'race', timeLimit = null, wordLength = 5) {
    const normalizedWordLength = resolveWordLength(wordLength);
    const normalizedGameMode = resolveGameMode(gameMode);
    this.code = generateRoomCode();
    this.hostId = hostId;
    this.difficulty = resolveDifficulty(normalizedWordLength, difficulty);
    this.wordLength = normalizedWordLength; // 5字或6字模式
    this.maxPlayers = 10; // 固定为10人
    this.gameMode = normalizedGameMode; // 'race' 竞速模式, 'timed' 限时模式
    this.timeLimit =
      normalizedGameMode === 'timed' ? resolveTimeLimit(timeLimit) : null; // 限时模式的时间限制（分钟）
    this.players = new Map();
    this.status = 'waiting'; // waiting, playing, finished
    this.wordIndex = null;
    this.currentWordIndex = 0; // 限时模式当前题目索引
    this.startTime = null;
    this.endTime = null; // 限时模式的结束时间
    this.gameTimer = null; // 限时模式的计时器
    this.results = [];
    this.createdAt = Date.now();
  }

  addPlayer(playerId, playerName) {
    if (this.players.size >= this.maxPlayers) {
      return { success: false, error: 'room_full' };
    }
    if (this.status !== 'waiting') {
      return { success: false, error: 'game_started' };
    }
    
    this.players.set(playerId, {
      id: playerId,
      name: playerName,
      isHost: playerId === this.hostId,
      ready: playerId === this.hostId, // 房主默认准备
      progress: 0, // 当前尝试次数
      correctCount: 0, // 正确字母数（竞速模式排名用）
      solvedCount: 0, // 答对题目数（限时模式）
      currentWordIndex: 0, // 当前题目索引（限时模式）
      finished: false,
      finishTime: null,
      won: false
    });
    
    return { success: true };
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
    
    // 如果房主离开，转移房主权限给下一个玩家
    if (playerId === this.hostId && this.players.size > 0) {
      const newHost = this.players.keys().next().value;
      this.hostId = newHost;
      const hostPlayer = this.players.get(newHost);
      if (hostPlayer) {
        hostPlayer.isHost = true;
        hostPlayer.ready = true;
      }
    }
    
    return this.players.size;
  }

  setPlayerReady(playerId, ready) {
    const player = this.players.get(playerId);
    if (player && player.id !== this.hostId) {
      player.ready = ready;
    }
  }

  allPlayersReady() {
    if (this.players.size < 2) return false;
    for (const player of this.players.values()) {
      if (!player.ready) return false;
    }
    return true;
  }

  startGame(wordIndex) {
    this.status = 'playing';
    this.wordIndex = wordIndex;
    this.currentWordIndex = 0;
    this.startTime = Date.now();
    this.results = [];
    
    // 限时模式设置结束时间
    if (this.gameMode === 'timed' && this.timeLimit) {
      this.endTime = this.startTime + this.timeLimit * 60 * 1000;
    }
    
    // 重置所有玩家状态
    for (const player of this.players.values()) {
      player.progress = 0;
      player.correctCount = 0;
      player.solvedCount = 0;
      player.currentWordIndex = 0;
      player.finished = false;
      player.finishTime = null;
      player.won = false;
    }
  }

  updatePlayerProgress(playerId, progress, won, correctCount = 0) {
    const player = this.players.get(playerId);
    if (!player) return { allFinished: false, results: this.results };
    
    // 竞速模式逻辑
    if (this.gameMode === 'race') {
      if (player.finished) return { allFinished: false, results: this.results };
      
      player.progress = progress;
      player.correctCount = correctCount;
      
      if (won) {
        // 有人猜对了，游戏结束
        player.finished = true;
        player.finishTime = Date.now() - this.startTime;
        player.won = true;
        
        // 标记所有其他玩家为已完成
        for (const p of this.players.values()) {
          if (!p.finished) {
            p.finished = true;
            p.finishTime = Date.now() - this.startTime;
            p.won = false;
          }
        }
        
        this.finishGame();
        return { allFinished: true, results: this.results, winner: player };
      } else if (progress >= 6) {
        player.finished = true;
        player.finishTime = Date.now() - this.startTime;
        player.won = false;
      }
      
      // 检查是否所有玩家都完成（都没猜对）
      const allFinished = Array.from(this.players.values()).every(p => p.finished);
      if (allFinished) {
        this.finishGame();
      }
      
      return { allFinished, results: this.results };
    }
    
    // 限时模式逻辑
    if (this.gameMode === 'timed') {
      player.progress = progress;
      
      if (won) {
        // 玩家答对当前题目，进入下一题
        player.solvedCount++;
        player.currentWordIndex++;
        player.progress = 0; // 重置尝试次数
        player.correctCount = 0;
        
        return { 
          allFinished: false, 
          results: this.results,
          nextWord: true,
          newWordIndex: player.currentWordIndex
        };
      } else if (progress >= 6) {
        // 限时模式用完6次机会，进入下一题
        player.currentWordIndex++;
        player.progress = 0;
        player.correctCount = 0;
        
        return { 
          allFinished: false, 
          results: this.results,
          nextWord: true,
          newWordIndex: player.currentWordIndex
        };
      }
      
      return { allFinished: false, results: this.results };
    }
    
    return { allFinished: false, results: this.results };
  }

  // 结束游戏并生成排名
  finishGame() {
    this.status = 'finished';
    
    // 清除限时模式的计时器
    if (this.gameTimer) {
      clearTimeout(this.gameTimer);
      this.gameTimer = null;
    }
    
    // 生成结果列表
    this.results = [];
    for (const player of this.players.values()) {
      this.results.push({
        playerId: player.id,
        playerName: player.name,
        attempts: player.progress,
        time: player.finishTime || (Date.now() - this.startTime),
        won: player.won || false,
        correctCount: player.correctCount || 0,
        solvedCount: player.solvedCount || 0
      });
    }
    
    // 根据模式排序
    if (this.gameMode === 'race') {
      // 竞速模式：获胜者第一，其他人按正确字母数排名（相同时按时间短）
      this.results.sort((a, b) => {
        if (a.won && !b.won) return -1;
        if (!a.won && b.won) return 1;
        // 都没赢：按正确字母数降序
        if (a.correctCount !== b.correctCount) {
          return b.correctCount - a.correctCount;
        }
        // 正确字母数相同：按时间升序
        return a.time - b.time;
      });
    } else if (this.gameMode === 'timed') {
      // 限时模式：按答对题目数排名，相同时按总用时排序
      this.results.sort((a, b) => {
        if (a.solvedCount !== b.solvedCount) {
          return b.solvedCount - a.solvedCount;
        }
        return a.time - b.time;
      });
      
      // 标记第一名为获胜者
      if (this.results.length > 0) {
        this.results[0].won = true;
      }
    }
  }

  // 检查是否应该因为玩家不足而结束游戏
  checkShouldEndDueToInsufficientPlayers() {
    if (this.status !== 'playing') return false;
    
    // 只剩一个玩家时结束游戏
    if (this.players.size <= 1) {
      // 将剩余玩家标记为获胜者（如果还没完成的话）
      for (const player of this.players.values()) {
        if (!player.finished) {
          player.finished = true;
          player.finishTime = Date.now() - this.startTime;
          player.won = true; // 剩余玩家自动获胜
        }
      }
      this.finishGame();
      return true;
    }
    return false;
  }

  getPublicInfo() {
    return {
      code: this.code,
      hostId: this.hostId,
      difficulty: this.difficulty,
      wordLength: this.wordLength,
      maxPlayers: this.maxPlayers,
      gameMode: this.gameMode,
      timeLimit: this.timeLimit,
      status: this.status,
      startTime: this.startTime,
      endTime: this.endTime,
      players: Array.from(this.players.values()).map(p => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        ready: p.ready,
        progress: p.progress,
        correctCount: p.correctCount,
        solvedCount: p.solvedCount,
        currentWordIndex: p.currentWordIndex,
        finished: p.finished,
        won: p.won
      })),
      wordIndex: this.status !== 'waiting' ? this.wordIndex : null
    };
  }
}

// Socket.io 事件处理
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);
  
  // 创建房间
  socket.on('create_room', ({ playerName, difficulty, gameMode, timeLimit, wordLength }, callback) => {
    const normalizedWordLength = resolveWordLength(wordLength);
    const normalizedDifficulty = resolveDifficulty(normalizedWordLength, difficulty);
    const normalizedGameMode = resolveGameMode(gameMode);
    const normalizedTimeLimit =
      normalizedGameMode === 'timed' ? resolveTimeLimit(timeLimit) : null;

    const room = new Room(
      socket.id,
      playerName,
      normalizedDifficulty,
      normalizedGameMode,
      normalizedTimeLimit,
      normalizedWordLength,
    );
    room.addPlayer(socket.id, playerName);
    rooms.set(room.code, room);
    
    socket.join(room.code);
    socket.roomCode = room.code;
    
    console.log(
      `Room created: ${room.code} by ${playerName} (mode: ${normalizedGameMode}, timeLimit: ${normalizedTimeLimit}, wordLength: ${normalizedWordLength})`,
    );
    
    callback({
      success: true,
      roomCode: room.code,
      room: room.getPublicInfo()
    });
  });

  // 加入房间
  socket.on('join_room', ({ roomCode, playerName }, callback) => {
    const room = rooms.get(roomCode);
    
    if (!room) {
      return callback({ success: false, error: 'room_not_found' });
    }
    
    const result = room.addPlayer(socket.id, playerName);
    if (!result.success) {
      return callback(result);
    }
    
    socket.join(roomCode);
    socket.roomCode = roomCode;
    
    console.log(`${playerName} joined room: ${roomCode}`);
    
    // 通知房间内其他玩家
    socket.to(roomCode).emit('player_joined', {
      player: room.players.get(socket.id),
      room: room.getPublicInfo()
    });
    
    callback({
      success: true,
      room: room.getPublicInfo()
    });
  });

  // 设置准备状态
  socket.on('set_ready', ({ ready }, callback) => {
    const room = rooms.get(socket.roomCode);
    if (!room) {
      return callback({ success: false, error: 'room_not_found' });
    }
    
    room.setPlayerReady(socket.id, ready);
    
    io.to(socket.roomCode).emit('room_updated', {
      room: room.getPublicInfo()
    });
    
    callback({ success: true });
  });

  // 房主修改房间设置
  socket.on('update_room_settings', ({ difficulty, wordLength, gameMode, timeLimit }, callback) => {
    const room = rooms.get(socket.roomCode);
    if (!room) {
      return callback({ success: false, error: 'room_not_found' });
    }
    
    // 只有房主可以修改设置
    if (socket.id !== room.hostId) {
      return callback({ success: false, error: 'not_host' });
    }
    
    // 只能在等待状态修改
    if (room.status !== 'waiting') {
      return callback({ success: false, error: 'game_in_progress' });
    }
    
    const nextWordLength =
      wordLength !== undefined ? resolveWordLength(wordLength) : room.wordLength;
    const nextDifficulty = resolveDifficulty(nextWordLength, difficulty, room.difficulty);
    const nextGameMode =
      gameMode !== undefined ? resolveGameMode(gameMode, room.gameMode) : room.gameMode;
    const nextTimeLimit =
      nextGameMode === 'timed'
        ? resolveTimeLimit(
            timeLimit !== undefined ? timeLimit : room.timeLimit ?? DEFAULT_TIME_LIMIT,
            room.timeLimit ?? DEFAULT_TIME_LIMIT,
          )
        : null;

    room.wordLength = nextWordLength;
    room.difficulty = nextDifficulty;
    room.gameMode = nextGameMode;
    room.timeLimit = nextTimeLimit;
    
    // 重置所有非房主玩家的准备状态
    for (const player of room.players.values()) {
      if (!player.isHost) {
        player.ready = false;
      }
    }
    
    console.log(
      `Room ${room.code} settings updated: difficulty=${room.difficulty}, wordLength=${room.wordLength}, gameMode=${room.gameMode}, timeLimit=${room.timeLimit}`,
    );
    
    // 通知所有玩家设置已更新
    io.to(socket.roomCode).emit('room_settings_updated', {
      room: room.getPublicInfo()
    });
    
    callback({ success: true, room: room.getPublicInfo() });
  });

  // 房主开始游戏
  socket.on('start_game', (_, callback) => {
    const room = rooms.get(socket.roomCode);
    if (!room) {
      return callback({ success: false, error: 'room_not_found' });
    }
    
    if (socket.id !== room.hostId) {
      return callback({ success: false, error: 'not_host' });
    }
    
    if (!room.allPlayersReady()) {
      return callback({ success: false, error: 'players_not_ready' });
    }
    
    const wordList = getWordList(room.wordLength, room.difficulty);
    if (!wordList.length) {
      return callback({ success: false, error: 'word_list_unavailable' });
    }
    
    // 限时模式：生成随机题目顺序
    let shuffledIndices = null;
    if (room.gameMode === 'timed') {
      shuffledIndices = Array.from({ length: wordList.length }, (_, i) => i);
      for (let i = shuffledIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
      }
    }
    
    const startingIndex =
      room.gameMode === 'timed'
        ? shuffledIndices[0]
        : Math.floor(Math.random() * wordList.length);
    
    room.startGame(startingIndex);
    
    console.log(`Game started in room ${room.code}, mode: ${room.gameMode}, word index: ${room.wordIndex}`);
    
    // 限时模式：设置计时器
    if (room.gameMode === 'timed' && room.timeLimit) {
      room.gameTimer = setTimeout(() => {
        if (room.status === 'playing') {
          room.finishGame();
          io.to(room.code).emit('game_finished', {
            results: room.results,
            room: room.getPublicInfo(),
            reason: 'time_up'
          });
        }
      }, room.timeLimit * 60 * 1000);
    }
    
    // 通知所有玩家游戏开始
    io.to(socket.roomCode).emit('game_started', {
      wordIndex: room.wordIndex,
      wordIndices: shuffledIndices, // 限时模式发送所有题目顺序
      room: room.getPublicInfo()
    });
    
    callback({ success: true, wordIndex: room.wordIndex, wordIndices: shuffledIndices });
  });

  // 更新玩家进度
  socket.on('update_progress', ({ progress, won, correctCount }) => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.status !== 'playing') return;
    
    const result = room.updatePlayerProgress(socket.id, progress, won, correctCount || 0);
    
    // 广播进度更新
    io.to(socket.roomCode).emit('progress_updated', {
      playerId: socket.id,
      progress,
      won,
      correctCount,
      nextWord: result.nextWord,
      newWordIndex: result.newWordIndex,
      room: room.getPublicInfo()
    });
    
    // 如果所有玩家完成（竞速模式），广播最终结果
    if (result.allFinished) {
      io.to(socket.roomCode).emit('game_finished', {
        results: result.results,
        room: room.getPublicInfo(),
        winner: result.winner
      });
    }
  });

  // 再来一局
  socket.on('play_again', (callback) => {
    const room = rooms.get(socket.roomCode);
    if (!room) {
      return callback({ success: false, error: 'room_not_found' });
    }
    
    if (socket.id !== room.hostId) {
      return callback({ success: false, error: 'not_host' });
    }
    
    // 清除计时器
    if (room.gameTimer) {
      clearTimeout(room.gameTimer);
      room.gameTimer = null;
    }
    
    // 重置房间状态
    room.status = 'waiting';
    room.wordIndex = null;
    room.currentWordIndex = 0;
    room.startTime = null;
    room.endTime = null;
    room.results = [];
    
    // 重置玩家状态，保持房主准备
    for (const player of room.players.values()) {
      player.ready = player.isHost;
      player.progress = 0;
      player.correctCount = 0;
      player.solvedCount = 0;
      player.currentWordIndex = 0;
      player.finished = false;
      player.finishTime = null;
      player.won = false;
    }
    
    io.to(socket.roomCode).emit('room_reset', {
      room: room.getPublicInfo()
    });
    
    callback({ success: true });
  });

  // 离开房间
  socket.on('leave_room', () => {
    handleLeaveRoom(socket);
  });

  // 断开连接
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    handleLeaveRoom(socket);
  });
});

function handleLeaveRoom(socket) {
  if (!socket.roomCode) return;
  
  const room = rooms.get(socket.roomCode);
  if (!room) return;
  
  const roomCode = socket.roomCode;
  const remainingPlayers = room.removePlayer(socket.id);
  
  if (remainingPlayers === 0) {
    // 房间空了，删除房间
    rooms.delete(roomCode);
    console.log(`Room deleted: ${roomCode}`);
  } else {
    // 通知其他玩家有人离开
    socket.to(roomCode).emit('player_left', {
      playerId: socket.id,
      room: room.getPublicInfo()
    });
    
    // 检查游戏中是否只剩一个玩家，如果是则结束游戏
    if (room.checkShouldEndDueToInsufficientPlayers()) {
      console.log(`Game ended in room ${roomCode} due to insufficient players`);
      io.to(roomCode).emit('game_finished', {
        results: room.results,
        room: room.getPublicInfo(),
        reason: 'insufficient_players' // 告知前端是因为玩家不足而结束
      });
    }
  }
  
  socket.leave(roomCode);
  socket.roomCode = null;
}

// 定期清理过期房间 (超过2小时)
setInterval(() => {
  const now = Date.now();
  const expireTime = 2 * 60 * 60 * 1000; // 2小时
  
  for (const [code, room] of rooms) {
    if (now - room.createdAt > expireTime) {
      rooms.delete(code);
      io.to(code).emit('room_expired');
      console.log(`Room expired and deleted: ${code}`);
    }
  }
}, 60000); // 每分钟检查一次

// Analytics API 代理路由
app.use('/api/analytics', analyticsRouter);

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    rooms: rooms.size,
    uptime: process.uptime()
  });
});

// 获取房间信息（用于邀请链接预览）
app.get('/room/:code', (req, res) => {
  const room = rooms.get(req.params.code);
  if (!room) {
    return res.status(404).json({ error: 'room_not_found' });
  }
  res.json({
    code: room.code,
    difficulty: room.difficulty,
    wordLength: room.wordLength,
    gameMode: room.gameMode,
    timeLimit: room.timeLimit,
    playerCount: room.players.size,
    maxPlayers: room.maxPlayers,
    status: room.status
  });
});

const PORT = process.env.PVP_SERVER_PORT || process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🎮 Korean Wordle PVP Server running on port ${PORT}`);
});

