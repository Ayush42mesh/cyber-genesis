export default function PlayersTab({ players, questions, allResponses }) {
    const sorted = [...players].sort((a, b) => b.score - a.score);

    return (
        <div className="a-panel active flex flex-col gap-[0.8rem]">
            {/* Player Cards */}
            <div className="card">
                <div className="ct">👥 PLAYER CARDS (<span>{players.length}</span> connected)</div>
                <div className="pig">
                    {players.length === 0
                        ? <div style={{ color: 'var(--dim)', fontFamily: 'var(--fM)', fontSize: '.78rem', textAlign: 'center', padding: '1rem', gridColumn: '1/-1' }}>No players yet</div>
                        : players.map(p => {
                            const ans = p.answers || [];
                            const correct = ans.filter(a => a.points > 0).length;
                            const wrong = ans.filter(a => a.points === 0 && a.option !== undefined).length;
                            const firsts = ans.filter(a => a.rank === 1).length;
                            const avgRank = ans.length ? Math.round(ans.reduce((s, a) => s + (a.rank || 99), 0) / ans.length) : 0;
                            return (
                                <div key={p.id} className="pic">
                                    <div className="pin">▶ {p.name}</div>
                                    <div className="pir"><span>Score</span><span style={{ color: 'var(--G)', fontWeight: 600 }}>{p.score} pts</span></div>
                                    <div className="pir"><span>Answered</span><span>{ans.length} / {questions.length}</span></div>
                                    <div className="pir"><span>Correct</span><span style={{ color: 'var(--G)' }}>{correct}</span></div>
                                    <div className="pir"><span>Wrong</span><span style={{ color: 'var(--R)' }}>{wrong}</span></div>
                                    <div className="pir"><span>1st Answer</span><span style={{ color: 'var(--Y)' }}>{firsts}×</span></div>
                                    <div className="pir"><span>Avg Rank</span><span>{avgRank || '—'}</span></div>
                                </div>
                            );
                        })
                    }
                </div>
            </div>

            {/* Full Stats Table */}
            <div className="card">
                <div className="ct">📊 FULL STATS</div>
                <div className="tbl-w" style={{ maxHeight: '280px' }}>
                    <table>
                        <thead><tr><th>#</th><th>CALLSIGN</th><th>SCORE</th><th>ANSWERED</th><th>✓ CORRECT</th><th>✗ WRONG</th><th>AVG RANK</th><th>1ST ANS</th></tr></thead>
                        <tbody>
                            {sorted.length === 0
                                ? <tr><td colSpan="8" style={{ color: 'var(--dim)', textAlign: 'center', padding: '1rem' }}>No data</td></tr>
                                : sorted.map((p, i) => {
                                    const ans = p.answers || [];
                                    const correct = ans.filter(a => a.points > 0).length;
                                    const wrong = ans.filter(a => a.points === 0 && a.option !== undefined).length;
                                    const avgRank = ans.length ? Math.round(ans.reduce((s, a) => s + (a.rank || 99), 0) / ans.length) : 0;
                                    const firsts = ans.filter(a => a.rank === 1).length;
                                    return (
                                        <tr key={p.id}>
                                            <td>{i + 1}</td><td>{p.name}</td>
                                            <td style={{ color: 'var(--G)', fontWeight: 600 }}>{p.score}</td>
                                            <td>{ans.length}</td>
                                            <td style={{ color: 'var(--G)' }}>{correct}</td>
                                            <td style={{ color: 'var(--R)' }}>{wrong}</td>
                                            <td>{avgRank || '—'}</td>
                                            <td>{firsts > 0 ? <span className="badge b1">{firsts}×</span> : '—'}</td>
                                        </tr>
                                    );
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Breakdown */}
            <div className="card">
                <div className="ct">🔍 ANSWER BREAKDOWN</div>
                <div className="tbl-w" style={{ maxHeight: '260px' }}>
                    <table>
                        <thead><tr><th>PLAYER</th><th>Q#</th><th>ANSWER</th><th>CORRECT?</th><th>RANK</th><th>PTS</th></tr></thead>
                        <tbody>
                            {(() => {
                                const rows = [];
                                const L = ['A', 'B', 'C', 'D'];
                                players.forEach(p => {
                                    (p.answers || []).forEach(a => {
                                        rows.push(
                                            <tr key={`${p.id}-${a.qIdx}`}>
                                                <td>{p.name}</td><td>Q{a.qIdx + 1}</td>
                                                <td>{L[a.option] ?? '—'}</td>
                                                <td><span className={`badge ${a.points > 0 ? 'bG' : 'bR'}`}>{a.points > 0 ? '✓' : '✗'}</span></td>
                                                <td>{a.rank === 1 ? <span className="badge b1">1ST</span> : `#${a.rank}`}</td>
                                                <td style={{ color: 'var(--G)' }}>{a.points > 0 ? `+${a.points}` : '0'}</td>
                                            </tr>
                                        );
                                    });
                                });
                                return rows.length ? rows : <tr><td colSpan="6" style={{ color: 'var(--dim)', textAlign: 'center', padding: '1rem' }}>No answers yet</td></tr>;
                            })()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
