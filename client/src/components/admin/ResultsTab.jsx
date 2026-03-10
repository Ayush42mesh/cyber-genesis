const medals = ['🥇', '🥈', '🥉'];

export default function ResultsTab({ leaderboard, questions, allResponses, onExport }) {
    return (
        <div className="a-panel active flex flex-col gap-[0.8rem]">
            {/* Final Leaderboard */}
            <div className="card">
                <div className="ct">🏆 FINAL LEADERBOARD</div>
                <div className="lb-list">
                    {(leaderboard || []).length === 0
                        ? <div style={{ color: 'var(--dim)', fontFamily: 'var(--fM)', fontSize: '.78rem', textAlign: 'center', padding: '1rem' }}>No scores yet</div>
                        : (leaderboard || []).slice(0, 10).map((p, i) => (
                            <div key={p.id || i} className="lb-row">
                                <div className="lb-rank">{medals[i] || `${i + 1}.`}</div>
                                <div className="lb-name">{p.name}</div>
                                <div className="lb-score">{p.score} pts</div>
                            </div>
                        ))
                    }
                </div>
            </div>

            {/* Question Analytics */}
            <div className="card">
                <div className="ct">📊 QUESTION ANALYTICS</div>
                <div className="tbl-w" style={{ maxHeight: '220px' }}>
                    <table>
                        <thead><tr><th>Q#</th><th>QUESTION</th><th>RESPONSES</th><th>CORRECT%</th><th>FASTEST PLAYER</th></tr></thead>
                        <tbody>
                            {questions.length === 0
                                ? <tr><td colSpan="5" style={{ color: 'var(--dim)', textAlign: 'center', padding: '1rem' }}>No data</td></tr>
                                : questions.map((q, qi) => {
                                    const resps = allResponses[qi] || [];
                                    const total = resps.length;
                                    const correct = resps.filter(r => r.option === q.correct).length;
                                    const pct = total ? Math.round((correct / total) * 100) : 0;
                                    const fastest = resps.length ? resps[0].name : '—';
                                    return (
                                        <tr key={q.id}>
                                            <td>Q{qi + 1}</td>
                                            <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.text}</td>
                                            <td>{total}</td>
                                            <td style={{ color: pct >= 50 ? 'var(--G)' : 'var(--R)' }}>{pct}%</td>
                                            <td style={{ color: 'var(--Y)' }}>{fastest}</td>
                                        </tr>
                                    );
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Export */}
            <div className="card">
                <div className="ct">📥 EXPORT</div>
                <p style={{ fontFamily: 'var(--fM)', fontSize: '.76rem', color: 'var(--dim)', marginBottom: '.75rem' }}>
                    Download full results: scores, timestamps, per-question breakdowns.
                </p>
                <button className="btn-ctrl cB" onClick={onExport}>📥 DOWNLOAD FULL REPORT</button>
            </div>
        </div>
    );
}
