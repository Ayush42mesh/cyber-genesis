import { useEffect, useRef, useState } from 'react';

export default function PlayerPage({ playerInfo, gameState, currentQuestion, questionStats, lastCorrectOption, onAnswer }) {
    const [answered, setAnswered] = useState(false);
    const [selectedIdx, setSelectedIdx] = useState(null);
    const [statusMsg, setStatusMsg] = useState('READY');
    const [statusColor, setStatusColor] = useState('var(--B)');
    const [showQuiz, setShowQuiz] = useState(false);
    const prevQRef = useRef(null);

    const CIRC = 157;
    const { timerRemaining, timerDuration } = gameState;
    const offset = CIRC - (timerRemaining / timerDuration) * CIRC;
    const pct = timerRemaining / timerDuration;
    const timerColor = pct > 0.5 ? 'var(--B)' : pct > 0.25 ? 'var(--Y)' : 'var(--R)';

    useEffect(() => {
        if (currentQuestion && currentQuestion !== prevQRef.current) {
            prevQRef.current = currentQuestion;
            setAnswered(false);
            setSelectedIdx(null);
            setStatusMsg('SELECT YOUR ANSWER');
            setStatusColor('var(--B)');
            setShowQuiz(true);
        }
    }, [currentQuestion]);

    useEffect(() => {
        if (lastCorrectOption !== null) {
            setStatusMsg('ANSWER REVEALED · NEXT QUESTION COMING...');
            setStatusColor('var(--P)');
        }
    }, [lastCorrectOption]);

    const handleAnswer = (idx) => {
        if (answered) return;
        setAnswered(true);
        setSelectedIdx(idx);
        setStatusMsg('ANSWER LOCKED · WAITING FOR OTHERS...');
        setStatusColor('var(--Y)');
        onAnswer(idx);
    };

    const onAnswerConfirmed = ({ points, isCorrect, rank }) => {
        const msg = isCorrect
            ? `✓ CORRECT! +${points} pts · RANK #${rank}`
            : `✗ WRONG · RANK #${rank}`;
        setStatusMsg(msg);
        setStatusColor(isCorrect ? 'var(--G)' : 'var(--R)');
    };

    const getOptClass = (i) => {
        let cls = 'opt-btn';
        if (lastCorrectOption !== null) {
            if (i === lastCorrectOption) cls += ' reveal';
        }
        if (selectedIdx === i) {
            if (lastCorrectOption !== null) {
                cls += i === lastCorrectOption ? ' ok' : ' wrong';
            } else {
                cls += ' pick';
            }
        }
        return cls;
    };

    const labels = ['A', 'B', 'C', 'D'];
    const { number, total } = questionStats;

    return (
        <div id="page-player" className="page">
            {/* Header */}
            <div className="p-hdr">
                <div className="p-name">{playerInfo.name || 'PLAYER'}</div>
                <div className="p-logo">CYBER GENESIS</div>
                <div className="p-sc">{playerInfo.score}</div>
            </div>

            {/* Standby */}
            {!showQuiz && (
                <div className="p-wait">
                    <div className="wt">STANDBY</div>
                    <div className="ws">WAITING FOR ADMIN TO START...</div>
                    <div className="pulse-ring"></div>
                    <div className="wi">Connection established · Ready to compete</div>
                </div>
            )}

            {/* Quiz */}
            {showQuiz && currentQuestion && (
                <div className="p-quiz" style={{ display: 'flex' }}>
                    {/* Top strip */}
                    <div className="quiz-top">
                        <div className="q-prog">
                            {Array.from({ length: total }, (_, i) => (
                                <div key={i} className={`qdot${i < number - 1 ? ' done' : i === number - 1 ? ' cur' : ''}`}></div>
                            ))}
                        </div>
                        <div className="p-tmr">
                            <div className="trw">
                                <svg viewBox="0 0 56 56">
                                    <circle className="trbg" cx="28" cy="28" r="25" />
                                    <circle
                                        className="trfg"
                                        cx="28" cy="28" r="25"
                                        style={{ strokeDashoffset: offset, stroke: timerColor }}
                                    />
                                </svg>
                                <div className="trn" style={{ color: timerColor }}>{timerRemaining}</div>
                            </div>
                            <div className="trl">TIME<br />LEFT</div>
                        </div>
                    </div>

                    {/* Scrollable content */}
                    <div className="q-area">
                        <div className="q-tag">QUESTION {number} / {total}</div>
                        <div className="q-card">
                            <div className="q-txt">{currentQuestion.text}</div>
                        </div>
                        <div className="opts-grid">
                            {(currentQuestion.options || []).map((opt, i) => (
                                <button
                                    key={i}
                                    className={getOptClass(i)}
                                    disabled={answered}
                                    onClick={() => handleAnswer(i)}
                                >
                                    <span className="opt-lbl">{labels[i]}</span>
                                    <span>{opt}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Status bar */}
                    <div className="p-stat" style={{ color: statusColor }}>
                        <div className="sdot" style={{ background: statusColor }}></div>
                        <span>{statusMsg}</span>
                    </div>

                    {/* Answer reveal badge */}
                    {lastCorrectOption !== null && (
                        <div className="a-rev">
                            ✓ CORRECT ANSWER: {labels[lastCorrectOption]}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
