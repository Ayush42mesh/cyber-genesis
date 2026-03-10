import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

export function useSocket() {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [gameState, setGameState] = useState({
        status: 'waiting',
        currentQuestionIndex: -1,
        timerDuration: 20,
        timerRemaining: 20,
        totalPlayers: 0,
        leaderboard: [],
    });
    const [playerInfo, setPlayerInfo] = useState({ name: '', score: 0 });
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminData, setAdminData] = useState({
        questions: [],
        players: [],
        timerDuration: 20,
    });

    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [questionStats, setQuestionStats] = useState({
        number: 0,
        total: 0,
    });

    const [lastCorrectOption, setLastCorrectOption] = useState(null);
    const [allResponses, setAllResponses] = useState({});

    useEffect(() => {
        const newSocket = io('/');
        setSocket(newSocket);

        newSocket.on('connect', () => setIsConnected(true));
        newSocket.on('disconnect', () => setIsConnected(false));

        newSocket.on('gameState', (s) => setGameState(prev => ({ ...prev, ...s })));

        // Player events
        newSocket.on('joined', ({ name }) => setPlayerInfo(prev => ({ ...prev, name })));
        newSocket.on('answerConfirmed', ({ points, isCorrect }) => {
            setPlayerInfo(prev => ({ ...prev, score: prev.score + points }));
        });
        newSocket.on('gameReset', () => {
            setPlayerInfo(prev => ({ ...prev, score: 0 }));
            setCurrentQuestion(null);
            setLastCorrectOption(null);
        });

        // Admin events
        newSocket.on('adminAuthenticated', (data) => {
            setIsAdmin(true);
            setAdminData({
                questions: data.questions,
                players: Object.values(data.players || {}),
                timerDuration: data.timerDuration,
            });
            setGameState(prev => ({ ...prev, leaderboard: data.leaderboard, status: data.gameStatus }));
        });
        newSocket.on('questionsUpdate', ({ questions }) => setAdminData(prev => ({ ...prev, questions })));
        newSocket.on('playersUpdate', ({ players, total }) => {
            setAdminData(prev => ({ ...prev, players }));
            setGameState(prev => ({ ...prev, totalPlayers: total }));
        });

        // Shared events
        newSocket.on('newQuestion', (data) => {
            setCurrentQuestion(data.question);
            setQuestionStats({ number: data.questionNumber, total: data.totalQuestions });
            setGameState(prev => ({
                ...prev,
                timerRemaining: data.timerRemaining,
                timerDuration: data.timerDuration,
                currentQuestionIndex: data.questionIndex
            }));
            setLastCorrectOption(null);
        });

        newSocket.on('timerTick', ({ remaining, total }) => {
            setGameState(prev => ({ ...prev, timerRemaining: remaining, timerDuration: total }));
        });

        newSocket.on('questionEnded', ({ correctOption, questionIndex, responses, leaderboard }) => {
            setLastCorrectOption(correctOption);
            setAllResponses(prev => ({ ...prev, [questionIndex]: responses }));
            setGameState(prev => ({ ...prev, leaderboard }));
        });

        newSocket.on('responseUpdate', ({ questionIndex, responses, leaderboard }) => {
            setAllResponses(prev => ({ ...prev, [questionIndex]: responses }));
            setGameState(prev => ({ ...prev, leaderboard }));
        });

        newSocket.on('gameFinished', ({ leaderboard }) => {
            setGameState(prev => ({ ...prev, status: 'finished', leaderboard }));
        });

        return () => newSocket.close();
    }, []);

    const emit = (event, data) => socket?.emit(event, data);

    return {
        socket,
        isConnected,
        gameState,
        playerInfo,
        isAdmin,
        adminData,
        currentQuestion,
        questionStats,
        lastCorrectOption,
        allResponses,
        emit
    };
}
