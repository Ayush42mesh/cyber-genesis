import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import ParticlesCanvas from './components/ParticlesCanvas';
import LandingPage from './components/LandingPage';
import PlayerJoinModal from './components/modals/PlayerJoinModal';
import AdminLoginModal from './components/modals/AdminLoginModal';
import PlayerPage from './components/PlayerPage';
import AdminPage from './components/admin/AdminPage';
import GameOverPage from './components/GameOverPage';

/* ────────────────────────────────────────────────────────────────
   CYBER GENESIS – Root App Component
   All socket connections and state live here so every child
   gets fresh data via props (no context needed for this size).
──────────────────────────────────────────────────────────────── */

export default function App() {
  // ── Page routing ──────────────────────────────────────────────
  // 'landing' | 'player' | 'admin' | 'gameover'
  const [page, setPage] = useState('landing');
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState('');

  // ── Socket ────────────────────────────────────────────────────
  const [socket, setSocket] = useState(null);

  // ── Player state ──────────────────────────────────────────────
  const [playerInfo, setPlayerInfo] = useState({ name: '', score: 0 });
  const [isAdmin, setIsAdmin] = useState(false);

  // ── Shared game state ─────────────────────────────────────────
  const [gameState, setGameState] = useState({
    status: 'waiting',
    currentQuestionIndex: -1,
    timerDuration: 20,
    timerRemaining: 20,
    totalPlayers: 0,
    leaderboard: [],
  });

  // ── Admin state ───────────────────────────────────────────────
  const [adminData, setAdminData] = useState({ questions: [], players: [], timerDuration: 20 });

  // ── Question state ────────────────────────────────────────────
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionStats, setQuestionStats] = useState({ number: 0, total: 0 });
  const [lastCorrectOption, setLastCorrectOption] = useState(null);
  const [allResponses, setAllResponses] = useState({});

  // ── Player answer confirmation ─────────────────────────────────
  const [answerConfirm, setAnswerConfirm] = useState(null);

  // ── Socket init ───────────────────────────────────────────────
  useEffect(() => {
    const s = io('/');
    setSocket(s);

    // ── Shared events ────────────────────────────────────────────
    s.on('gameState', (gs) => setGameState(prev => ({ ...prev, ...gs })));

    s.on('newQuestion', (data) => {
      setCurrentQuestion(data.question);
      setQuestionStats({ number: data.questionNumber, total: data.totalQuestions });
      setLastCorrectOption(null);
      setAnswerConfirm(null);
      setGameState(prev => ({
        ...prev,
        timerRemaining: data.timerRemaining,
        timerDuration: data.timerDuration,
        currentQuestionIndex: data.questionIndex,
        status: 'active',
      }));
    });

    s.on('timerTick', ({ remaining, total }) => {
      setGameState(prev => ({ ...prev, timerRemaining: remaining, timerDuration: total }));
    });

    s.on('questionEnded', ({ correctOption, questionIndex, responses, leaderboard }) => {
      setLastCorrectOption(correctOption);
      setAllResponses(prev => ({ ...prev, [questionIndex]: responses }));
      setGameState(prev => ({ ...prev, leaderboard, status: 'paused' }));
    });

    s.on('responseUpdate', ({ questionIndex, responses, leaderboard }) => {
      setAllResponses(prev => ({ ...prev, [questionIndex]: responses }));
      setGameState(prev => ({ ...prev, leaderboard }));
    });

    s.on('timerSet', ({ duration }) => {
      setGameState(prev => ({ ...prev, timerDuration: duration }));
    });

    // ── Player events ─────────────────────────────────────────────
    s.on('joined', ({ name }) => setPlayerInfo(prev => ({ ...prev, name })));

    s.on('answerConfirmed', ({ option, rank, points, isCorrect }) => {
      setPlayerInfo(prev => ({ ...prev, score: prev.score + points }));
      setAnswerConfirm({ option, rank, points, isCorrect });
    });

    s.on('gameReset', () => {
      setPlayerInfo(prev => ({ ...prev, score: 0 }));
      setCurrentQuestion(null);
      setLastCorrectOption(null);
      setAnswerConfirm(null);
      setAllResponses({});
      setGameState(prev => ({ ...prev, status: 'waiting', currentQuestionIndex: -1, leaderboard: [] }));
    });

    s.on('gameFinished', ({ leaderboard }) => {
      setGameState(prev => ({ ...prev, status: 'finished', leaderboard }));
      setPage('gameover');
    });

    // ── Admin events ──────────────────────────────────────────────
    s.on('adminAuthenticated', (data) => {
      setIsAdmin(true);
      setAdminData({
        questions: data.questions,
        players: Object.values(data.players || []),
        timerDuration: data.timerDuration,
      });
      setGameState(prev => ({
        ...prev,
        leaderboard: data.leaderboard,
        status: data.gameStatus,
        timerDuration: data.timerDuration,
      }));
      setShowAdminModal(false);
      setPage('admin');
    });

    s.on('adminAuthFailed', () => {
      setAdminAuthError('Invalid access code');
      setTimeout(() => setAdminAuthError(''), 3500);
    });

    s.on('questionsUpdate', ({ questions }) => {
      setAdminData(prev => ({ ...prev, questions }));
    });

    s.on('playersUpdate', ({ players, total }) => {
      setAdminData(prev => ({ ...prev, players }));
      setGameState(prev => ({ ...prev, totalPlayers: total }));
    });

    return () => s.close();
  }, []);

  // ── Player join ───────────────────────────────────────────────
  const handleJoin = (name) => {
    setPlayerInfo({ name, score: 0 });
    socket?.emit('playerJoin', { name });
    setShowPlayerModal(false);
    setPage('player');
  };

  // ── Admin login ───────────────────────────────────────────────
  const handleAdminLogin = (password) => {
    socket?.emit('adminJoin', { password });
  };

  // ── Admin controls ─────────────────────────────────────────────
  const handleNextQ = () => socket?.emit('adminNextQuestion');
  const handleEndQ = () => socket?.emit('adminEndQuestion');
  const handleReset = () => {
    if (confirm('Reset entire game? All scores cleared.')) socket?.emit('adminResetGame');
  };
  const handlePauseResume = (currentlyPaused) => {
    if (currentlyPaused) socket?.emit('adminResumeTimer');
    else socket?.emit('adminPauseTimer');
  };
  const handleSetTimer = (duration) => socket?.emit('adminSetTimer', { duration });
  const handleAddQuestion = (q) => socket?.emit('adminAddQuestion', q);
  const handleDeleteQuestion = (id) => socket?.emit('adminDeleteQuestion', { id });
  const handleExport = () => window.open('/api/export', '_blank');

  // ── Player answer ──────────────────────────────────────────────
  const handleAnswer = (idx) => {
    socket?.emit('playerAnswer', { questionIndex: gameState.currentQuestionIndex, option: idx });
  };

  // ── Back to landing ────────────────────────────────────────────
  const handleBackToLanding = () => {
    setPage('landing');
    setIsAdmin(false);
    setCurrentQuestion(null);
    setPlayerInfo({ name: '', score: 0 });
  };

  // ── Determine if game over should show gameover page ───────────
  const isGameOver = gameState.status === 'finished' && !isAdmin;

  return (
    <>
      <ParticlesCanvas />
      {/* Corner decorations */}
      <div className="cD cTL"></div>
      <div className="cD cTR"></div>
      <div className="cD cBL"></div>
      <div className="cD cBR"></div>

      {/* Modals */}
      <PlayerJoinModal isOpen={showPlayerModal} onClose={() => setShowPlayerModal(false)} onJoin={handleJoin} />
      <AdminLoginModal isOpen={showAdminModal} onClose={() => setShowAdminModal(false)} onLogin={handleAdminLogin} externalError={adminAuthError} />

      {/* Pages */}
      {page === 'landing' && (
        <LandingPage
          onJoinClick={() => setShowPlayerModal(true)}
          onAdminClick={() => setShowAdminModal(true)}
        />
      )}

      {page === 'player' && !isGameOver && (
        <PlayerPage
          playerInfo={playerInfo}
          gameState={gameState}
          currentQuestion={currentQuestion}
          questionStats={questionStats}
          lastCorrectOption={lastCorrectOption}
          answerConfirm={answerConfirm}
          onAnswer={handleAnswer}
        />
      )}

      {(page === 'gameover' || isGameOver) && (
        <GameOverPage
          leaderboard={gameState.leaderboard}
          onBack={handleBackToLanding}
        />
      )}

      {page === 'admin' && isAdmin && (
        <AdminPage
          gameState={gameState}
          adminData={adminData}
          allResponses={allResponses}
          currentQuestion={currentQuestion}
          questionStats={questionStats}
          onNextQ={handleNextQ}
          onEndQ={handleEndQ}
          onReset={handleReset}
          onPauseResume={handlePauseResume}
          onSetTimer={handleSetTimer}
          onAddQuestion={handleAddQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          onExport={handleExport}
        />
      )}
    </>
  );
}
