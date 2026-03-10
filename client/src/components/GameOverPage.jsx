import { useEffect } from 'react';

function launchConfetti() {
    const colors = ['#00d4ff', '#b44fff', '#00ff88', '#ffcc00', '#ff3366', '#fff'];
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const el = document.createElement('div');
            el.className = 'conf';
            el.style.cssText = `left:${Math.random() * 100}vw;background:${colors[Math.floor(Math.random() * colors.length)]};width:${Math.random() * 10 + 5}px;height:${Math.random() * 10 + 5}px;border-radius:${Math.random() > 0.5 ? '50%' : '2px'};animation-duration:${Math.random() * 3 + 2}s;`;
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 5500);
        }, i * 35);
    }
}

export default function GameOverPage({ leaderboard, onBack }) {
    const medals = ['🥇', '🥈', '🥉'];
    const winner = leaderboard && leaderboard[0];

    useEffect(() => {
        launchConfetti();
    }, []);

    return (
        <div id="page-gameover" className="page flex items-center justify-center overflow-y-auto">
            <div className="go-w">
                <div className="go-cr">👑</div>
                <div className="go-t">GAME OVER</div>
                <div className="go-w2">
                    {winner ? `CHAMPION: ${winner.name} · ${winner.score} pts` : 'NO CHAMPION'}
                </div>
                <div className="lb-list" style={{ marginBottom: '1.4rem', width: '100%' }}>
                    {(leaderboard || []).slice(0, 5).map((p, i) => (
                        <div key={p.id || i} className="lb-row">
                            <div className="lb-rank">{medals[i] || `${i + 1}.`}</div>
                            <div className="lb-name">{p.name}</div>
                            <div className="lb-score">{p.score} pts</div>
                        </div>
                    ))}
                </div>
                <button className="btn-cyber bp" onClick={onBack}>
                    <span>↩ BACK TO HUB</span>
                </button>
            </div>
        </div>
    );
}
