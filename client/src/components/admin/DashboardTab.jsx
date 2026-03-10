import { useRef } from 'react';

const labels = ['A', 'B', 'C', 'D'];
const medals = ['🥇', '🥈', '🥉'];

function renderRespRows(responses, correctOpt) {
    if (!responses || !responses.length)
        return <tr><td colSpan="6" style={{ color: 'var(--dim)', textAlign: 'center', padding: '1rem' }}>No responses yet</td></tr>;
    return responses.map(r => {
        const ok = r.option === correctOpt;
        const t = r.timestamp
            ? new Date(r.timestamp).toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
            : '—';
        return (
            <tr key={r.socketId} className={r.rank === 1 ? 'tr1' : ''}>
                <td>#{r.rank} {r.rank === 1 && <span className="badge b1">1ST</span>}</td>
                <td>{r.name}</td>
                <td>{labels[r.option] ?? r.option}</td>
                <td>{t}</td>
                <td style={{ color: 'var(--G)' }}>{ok ? '+pts' : '0'}</td>
                <td><span className={`badge ${ok ? 'bG' : 'bR'}`}>{ok ? '✓ OK' : '✗ WRONG'}</span></td>
            </tr>
        );
    });
}

export default function DashboardTab({ gameState, adminData, allResponses, currentQuestion, questionStats, adminPaused, onNextQ, onEndQ, onReset, onPauseResume, onSetTimer, onExport }) {
    const timerInputRef = useRef(null);
    const { status, totalPlayers, timerRemaining, timerDuration, leaderboard } = gameState;
    const { questions } = adminData;

    const timerCls = () => {
        const pct = timerRemaining / timerDuration;
        let cls = 'tlg';
        if (pct < 0.25) cls += ' dng';
        else if (pct < 0.5) cls += ' warn';
        return cls;
    };

    const curQIdx = gameState.currentQuestionIndex;
    const liveQ = currentQuestion || (curQIdx >= 0 ? questions[curQIdx] : null);
    const curResponses = curQIdx >= 0 ? (allResponses[curQIdx] || []) : [];

    const handleSetTimer = () => {
        const d = parseInt(timerInputRef.current?.value) || 20;
        onSetTimer(d);
    };

    return (
        <div className="a-panel active flex flex-col gap-[0.8rem]">
            {/* Stats */}
            <div className="stats-g">
                <div className="stat-c"><div className="stat-v">{totalPlayers}</div><div className="stat-l">Players</div></div>
                <div className="stat-c"><div className="stat-v">{curQIdx >= 0 ? curQIdx + 1 : '—'}</div><div className="stat-l">Current Q</div></div>
                <div className="stat-c"><div className="stat-v">{curResponses.length}</div><div className="stat-l">Responses</div></div>
                <div className="stat-c"><div className="stat-v">{questions.length}</div><div className="stat-l">Total Qs</div></div>
            </div>

            {/* Controls */}
            <div className="card">
                <div className="ct">⚡ GAME CONTROLS</div>
                <div className="ctrl-row">
                    <button className="btn-ctrl cG" onClick={onNextQ}>▶ NEXT Q</button>
                    <button className="btn-ctrl cY" onClick={onPauseResume}>
                        {adminPaused ? '▶ RESUME' : '⏸ PAUSE'}
                    </button>
                    <button className="btn-ctrl cP" onClick={onEndQ}>⏹ END Q</button>
                    <button className="btn-ctrl cR" onClick={onReset}>↺ RESET</button>
                </div>
                <div className="ctrl-row mt-[0.65rem]">
                    <div className="ts">
                        <label>TIMER(S):</label>
                        <input ref={timerInputRef} className="inp" type="number" defaultValue={timerDuration} min="5" max="120" style={{ width: '64px', margin: 0 }} />
                        <button className="btn-ctrl cG" onClick={handleSetTimer}>SET</button>
                    </div>
                    <button className="btn-ctrl cB" onClick={onExport}>📥 EXPORT</button>
                </div>
            </div>

            {/* Live question + timer */}
            <div className="qtg">
                <div className="card">
                    <div className="ct">🔴 LIVE QUESTION</div>
                    <div className="lqt">{liveQ ? liveQ.text : 'No question active'}</div>
                    <div className="lqo">
                        {(liveQ?.options || []).map((o, i) => (
                            <div key={i} className={`lo${i === liveQ.correct ? ' cor' : ''}`}>
                                <span>{labels[i]}</span>
                                <span style={{ flex: 1 }}>{o}</span>
                                {i === liveQ.correct && <span style={{ fontSize: '.6rem' }}>✓</span>}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="card flex flex-col items-center justify-center">
                    <div className="ct">⏱ TIMER</div>
                    <div className={timerCls()}>{status !== 'waiting' ? timerRemaining : '—'}</div>
                    <div className="tsm">/ {timerDuration}s</div>
                </div>
            </div>

            {/* Live responses */}
            <div className="card">
                <div className="ct">📡 LIVE RESPONSES</div>
                <div className="tbl-w" style={{ maxHeight: '230px' }}>
                    <table>
                        <thead><tr><th>RANK</th><th>PLAYER</th><th>ANSWER</th><th>TIME</th><th>PTS+</th><th>RESULT</th></tr></thead>
                        <tbody>{renderRespRows(curResponses, liveQ?.correct)}</tbody>
                    </table>
                </div>
            </div>

            {/* Mini leaderboard */}
            <div className="card">
                <div className="ct">🏆 LEADERBOARD</div>
                <div className="lb-list">
                    {(leaderboard || []).slice(0, 5).length === 0
                        ? <div style={{ color: 'var(--dim)', fontFamily: 'var(--fM)', fontSize: '.78rem', textAlign: 'center', padding: '1rem' }}>No scores yet</div>
                        : (leaderboard || []).slice(0, 5).map((p, i) => (
                            <div key={p.id || i} className="lb-row">
                                <div className="lb-rank">{medals[i] || `${i + 1}.`}</div>
                                <div className="lb-name">{p.name}</div>
                                <div className="lb-score">{p.score} pts</div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
}
