export default function LandingPage({ onJoinClick, onAdminClick }) {
    return (
        <div id="page-landing" className="page flex-col items-center justify-center">
            <div className="land-wrap">
                <div className="logo-main" data-text="CYBER GENESIS">CYBER GENESIS</div>
                <div className="logo-sub">TECH FEST QUIZ CHAMPIONSHIP</div>
                <div className="land-btns flex gap-[1.1rem] justify-center flex-wrap">
                    <button className="btn-cyber bp" onClick={onJoinClick}>
                        <span>⚡ JOIN GAME</span>
                    </button>
                    <button className="btn-cyber ba" onClick={onAdminClick}>
                        <span>⚙ ADMIN PANEL</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
