/**
 * Korean Wordle PVP Server
 * WebSocket server for real-time multiplayer Wordle
 */

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

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

// 从单词列表中随机选择单词
function selectRandomWord(difficulty, wordList) {
  const index = Math.floor(Math.random() * wordList.length);
  return { index, word: wordList[index] };
}

// 房间类
class Room {
  constructor(hostId, hostName, difficulty, maxPlayers = 4) {
    this.code = generateRoomCode();
    this.hostId = hostId;
    this.difficulty = difficulty;
    this.maxPlayers = maxPlayers;
    this.players = new Map();
    this.status = 'waiting'; // waiting, playing, finished
    this.wordIndex = null;
    this.word = null;
    this.startTime = null;
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

  startGame(wordIndex, word) {
    this.status = 'playing';
    this.wordIndex = wordIndex;
    this.word = word;
    this.startTime = Date.now();
    this.results = [];
    
    // 重置所有玩家状态
    for (const player of this.players.values()) {
      player.progress = 0;
      player.finished = false;
      player.finishTime = null;
      player.won = false;
    }
  }

  updatePlayerProgress(playerId, progress, won) {
    const player = this.players.get(playerId);
    if (player && !player.finished) {
      player.progress = progress;
      
      if (won || progress >= 6) {
        player.finished = true;
        player.finishTime = Date.now() - this.startTime;
        player.won = won;
        
        this.results.push({
          playerId: player.id,
          playerName: player.name,
          attempts: progress,
          time: player.finishTime,
          won: won
        });
      }
    }
    
    // 检查是否所有玩家都完成
    const allFinished = Array.from(this.players.values()).every(p => p.finished);
    if (allFinished) {
      this.status = 'finished';
      // 按获胜优先、时间排序
      this.results.sort((a, b) => {
        if (a.won && !b.won) return -1;
        if (!a.won && b.won) return 1;
        if (a.won && b.won) return a.time - b.time;
        return a.attempts - b.attempts;
      });
    }
    
    return { allFinished, results: this.results };
  }

  getPublicInfo() {
    return {
      code: this.code,
      hostId: this.hostId,
      difficulty: this.difficulty,
      maxPlayers: this.maxPlayers,
      status: this.status,
      players: Array.from(this.players.values()).map(p => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        ready: p.ready,
        progress: p.progress,
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
  socket.on('create_room', ({ playerName, difficulty, maxPlayers }, callback) => {
    const room = new Room(socket.id, playerName, difficulty, maxPlayers);
    room.addPlayer(socket.id, playerName);
    rooms.set(room.code, room);
    
    socket.join(room.code);
    socket.roomCode = room.code;
    
    console.log(`Room created: ${room.code} by ${playerName}`);
    
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

  // 房主开始游戏
  socket.on('start_game', ({ wordList }, callback) => {
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
    
    // 选择随机单词
    const { index, word } = selectRandomWord(room.difficulty, wordList);
    room.startGame(index, word);
    
    console.log(`Game started in room ${room.code}, word index: ${index}`);
    
    // 通知所有玩家游戏开始
    io.to(socket.roomCode).emit('game_started', {
      wordIndex: index,
      room: room.getPublicInfo()
    });
    
    callback({ success: true, wordIndex: index });
  });

  // 更新玩家进度
  socket.on('update_progress', ({ progress, won }) => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.status !== 'playing') return;
    
    const { allFinished, results } = room.updatePlayerProgress(socket.id, progress, won);
    
    // 广播进度更新
    io.to(socket.roomCode).emit('progress_updated', {
      playerId: socket.id,
      progress,
      won,
      room: room.getPublicInfo()
    });
    
    // 如果所有玩家完成，广播最终结果
    if (allFinished) {
      io.to(socket.roomCode).emit('game_finished', {
        results,
        room: room.getPublicInfo()
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
    
    // 重置房间状态
    room.status = 'waiting';
    room.wordIndex = null;
    room.word = null;
    room.startTime = null;
    room.results = [];
    
    // 重置玩家状态，保持房主准备
    for (const player of room.players.values()) {
      player.ready = player.isHost;
      player.progress = 0;
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
  
  const remainingPlayers = room.removePlayer(socket.id);
  
  if (remainingPlayers === 0) {
    // 房间空了，删除房间
    rooms.delete(socket.roomCode);
    console.log(`Room deleted: ${socket.roomCode}`);
  } else {
    // 通知其他玩家
    socket.to(socket.roomCode).emit('player_left', {
      playerId: socket.id,
      room: room.getPublicInfo()
    });
  }
  
  socket.leave(socket.roomCode);
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
    playerCount: room.players.size,
    maxPlayers: room.maxPlayers,
    status: room.status
  });
});

const PORT = process.env.PVP_SERVER_PORT || process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🎮 Korean Wordle PVP Server running on port ${PORT}`);
});

