const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(express.json());
// Serve Vite build if available, otherwise fall back to legacy public/
const clientDist = path.join(__dirname, 'client', 'dist');
const publicDir = path.join(__dirname, 'public');
const staticDir = fs.existsSync(clientDist) ? clientDist : publicDir;
app.use(express.static(staticDir));

// ─── In-memory state ───────────────────────────────────────────────────────────
let gameState = {
  status: 'waiting',        // waiting | active | paused | finished
  currentQuestionIndex: -1,
  timerDuration: 20,
  timerRemaining: 20,
  timerInterval: null,
  questions: [
    {
      id: 1,
      text: "What does 'SQL Injection' primarily exploit?",
      options: ["Buffer overflow vulnerability", "Improper input sanitization", "Weak password hashing", "Unencrypted network traffic"],
      correct: 1,
      points: 100
    },
    {
      id: 2,
      text: "Which OSI layer does TCP operate at?",
      options: ["Layer 2 - Data Link", "Layer 3 - Network", "Layer 4 - Transport", "Layer 7 - Application"],
      correct: 2,
      points: 100
    },
    {
      id: 3,
      text: "What encryption algorithm uses a 256-bit key by default?",
      options: ["DES", "3DES", "AES-256", "RSA-128"],
      correct: 2,
      points: 100
    },
    {
      id: 4,
      text: "In cybersecurity, what is a 'zero-day' vulnerability?",
      options: ["A vulnerability with no fix available", "A virus that deletes files at midnight", "An attack that takes zero seconds", "A firewall with zero rules"],
      correct: 0,
      points: 150
    },
    {
      id: 5,
      text: "Which protocol is used for secure key exchange over an insecure channel?",
      options: ["FTP", "Diffie-Hellman", "Telnet", "HTTP"],
      correct: 1,
      points: 150
    }
  ],
  players: {},    // socketId -> { name, score, answers: [{qIdx, option, timestamp, rank}] }
  responses: {},  // questionIndex -> [{ socketId, name, option, timestamp, rank }]
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getLeaderboard() {
  return Object.values(gameState.players)
    .map(p => ({ name: p.name, score: p.score, id: p.id }))
    .sort((a, b) => b.score - a.score)
    .map((p, i) => ({ ...p, rank: i + 1 }));
}

function broadcastState() {
  io.emit('gameState', {
    status: gameState.status,
    currentQuestionIndex: gameState.currentQuestionIndex,
    timerRemaining: gameState.timerRemaining,
    timerDuration: gameState.timerDuration,
    totalPlayers: Object.keys(gameState.players).length,
    leaderboard: getLeaderboard()
  });
}

function getCurrentQuestion(forAdmin = false) {
  const q = gameState.questions[gameState.currentQuestionIndex];
  if (!q) return null;
  if (forAdmin) return q;
  // Hide correct answer from players
  return { id: q.id, text: q.text, options: q.options, points: q.points };
}

function startTimer() {
  clearInterval(gameState.timerInterval);
  gameState.timerRemaining = gameState.timerDuration;

  gameState.timerInterval = setInterval(() => {
    gameState.timerRemaining--;
    io.emit('timerTick', { remaining: gameState.timerRemaining, total: gameState.timerDuration });

    if (gameState.timerRemaining <= 0) {
      clearInterval(gameState.timerInterval);
      endQuestion();
    }
  }, 1000);
}

function endQuestion() {
  const qIdx = gameState.currentQuestionIndex;
  const q = gameState.questions[qIdx];
  if (!q) return;

  // Reveal correct answer to all
  io.emit('questionEnded', {
    correctOption: q.correct,
    questionIndex: qIdx,
    responses: gameState.responses[qIdx] || [],
    leaderboard: getLeaderboard()
  });

  gameState.status = 'paused';
  broadcastState();
}

// ─── Socket.IO ────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('Connected:', socket.id);

  // ── Player join ──────────────────────────────────────────────────────────────
  socket.on('playerJoin', ({ name }) => {
    if (!name || name.trim().length < 1) return;
    gameState.players[socket.id] = {
      id: socket.id,
      name: name.trim(),
      score: 0,
      answers: []
    };
    socket.emit('joined', { name: name.trim(), playerId: socket.id });
    broadcastState();
    io.to('admins').emit('playersUpdate', {
      players: Object.values(gameState.players),
      total: Object.keys(gameState.players).length
    });

    // If game already active, send current question
    if (gameState.status === 'active' && gameState.currentQuestionIndex >= 0) {
      socket.emit('newQuestion', {
        question: getCurrentQuestion(),
        questionIndex: gameState.currentQuestionIndex,
        timerRemaining: gameState.timerRemaining,
        timerDuration: gameState.timerDuration,
        questionNumber: gameState.currentQuestionIndex + 1,
        totalQuestions: gameState.questions.length
      });
    }
  });

  // ── Admin join ───────────────────────────────────────────────────────────────
  socket.on('adminJoin', ({ password }) => {
    if (password !== 'cyber2025') {
      socket.emit('adminAuthFailed');
      return;
    }
    socket.join('admins');
    socket.emit('adminAuthenticated', {
      questions: gameState.questions,
      players: Object.values(gameState.players),
      gameStatus: gameState.status,
      currentQuestionIndex: gameState.currentQuestionIndex,
      timerDuration: gameState.timerDuration,
      leaderboard: getLeaderboard()
    });
  });

  // ── Admin: start / next question ─────────────────────────────────────────────
  socket.on('adminNextQuestion', () => {
    const nextIdx = gameState.currentQuestionIndex + 1;
    if (nextIdx >= gameState.questions.length) {
      gameState.status = 'finished';
      io.emit('gameFinished', { leaderboard: getLeaderboard() });
      broadcastState();
      return;
    }
    gameState.currentQuestionIndex = nextIdx;
    gameState.status = 'active';
    gameState.responses[nextIdx] = [];

    const q = getCurrentQuestion();
    io.emit('newQuestion', {
      question: q,
      questionIndex: nextIdx,
      timerRemaining: gameState.timerDuration,
      timerDuration: gameState.timerDuration,
      questionNumber: nextIdx + 1,
      totalQuestions: gameState.questions.length
    });

    startTimer();
    broadcastState();
  });

  // ── Admin: pause/resume timer ────────────────────────────────────────────────
  socket.on('adminPauseTimer', () => {
    clearInterval(gameState.timerInterval);
    gameState.status = 'paused';
    broadcastState();
  });

  socket.on('adminResumeTimer', () => {
    gameState.status = 'active';
    gameState.timerInterval = setInterval(() => {
      gameState.timerRemaining--;
      io.emit('timerTick', { remaining: gameState.timerRemaining, total: gameState.timerDuration });
      if (gameState.timerRemaining <= 0) {
        clearInterval(gameState.timerInterval);
        endQuestion();
      }
    }, 1000);
    broadcastState();
  });

  socket.on('adminResetTimer', () => {
    clearInterval(gameState.timerInterval);
    gameState.timerRemaining = gameState.timerDuration;
    io.emit('timerTick', { remaining: gameState.timerRemaining, total: gameState.timerDuration });
  });

  socket.on('adminEndQuestion', () => {
    clearInterval(gameState.timerInterval);
    endQuestion();
  });

  // ── Admin: set timer duration ─────────────────────────────────────────────────
  socket.on('adminSetTimer', ({ duration }) => {
    gameState.timerDuration = parseInt(duration) || 20;
    socket.emit('timerSet', { duration: gameState.timerDuration });
  });

  // ── Admin: reset game ─────────────────────────────────────────────────────────
  socket.on('adminResetGame', () => {
    clearInterval(gameState.timerInterval);
    gameState.status = 'waiting';
    gameState.currentQuestionIndex = -1;
    gameState.timerRemaining = gameState.timerDuration;
    gameState.responses = {};
    Object.values(gameState.players).forEach(p => { p.score = 0; p.answers = []; });
    io.emit('gameReset');
    broadcastState();
  });

  // ── Admin: add question ───────────────────────────────────────────────────────
  socket.on('adminAddQuestion', ({ text, options, correct, points }) => {
    const newQ = {
      id: Date.now(),
      text, options,
      correct: parseInt(correct),
      points: parseInt(points) || 100
    };
    gameState.questions.push(newQ);
    io.to('admins').emit('questionsUpdate', { questions: gameState.questions });
  });

  socket.on('adminDeleteQuestion', ({ id }) => {
    gameState.questions = gameState.questions.filter(q => q.id !== id);
    io.to('admins').emit('questionsUpdate', { questions: gameState.questions });
  });

  // ── Player: submit answer ─────────────────────────────────────────────────────
  socket.on('playerAnswer', ({ questionIndex, option }) => {
    const player = gameState.players[socket.id];
    if (!player) return;
    if (gameState.status !== 'active') return;
    if (gameState.currentQuestionIndex !== questionIndex) return;

    // Check if already answered
    const alreadyAnswered = player.answers.find(a => a.qIdx === questionIndex);
    if (alreadyAnswered) return;

    const timestamp = Date.now();
    const responses = gameState.responses[questionIndex] || [];
    const rank = responses.length + 1;

    responses.push({ socketId: socket.id, name: player.name, option, timestamp, rank });
    gameState.responses[questionIndex] = responses;

    // Score: correct + speed bonus
    const q = gameState.questions[questionIndex];
    let points = 0;
    if (option === q.correct) {
      const timeBonus = Math.max(0, gameState.timerRemaining);
      points = q.points + timeBonus * 5;
      if (rank === 1) points += 50; // first answer bonus
    }
    player.score += points;
    player.answers.push({ qIdx: questionIndex, option, timestamp, rank, points });

    socket.emit('answerConfirmed', { option, rank, points, isCorrect: option === q.correct });

    // Broadcast to admins
    io.to('admins').emit('responseUpdate', {
      questionIndex,
      responses: gameState.responses[questionIndex],
      leaderboard: getLeaderboard()
    });
  });

  // ── Disconnect ────────────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    delete gameState.players[socket.id];
    broadcastState();
    io.to('admins').emit('playersUpdate', {
      players: Object.values(gameState.players),
      total: Object.keys(gameState.players).length
    });
  });
});

// ─── REST API ─────────────────────────────────────────────────────────────────
app.get('/api/export', (req, res) => {
  const data = {
    players: Object.values(gameState.players),
    leaderboard: getLeaderboard(),
    questions: gameState.questions,
    responses: gameState.responses
  };
  res.setHeader('Content-Disposition', 'attachment; filename="cyber-genesis-results.json"');
  res.json(data);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
