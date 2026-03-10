import { useState } from 'react';
import DashboardTab from './DashboardTab';
import QuestionsTab from './QuestionsTab';
import PlayersTab from './PlayersTab';
import ResultsTab from './ResultsTab';

const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', short: 'DASH' },
    { id: 'questions', label: 'Questions', icon: '📝', short: 'QS' },
    { id: 'players', label: 'Players', icon: '👥', short: 'PLAYERS' },
    { id: 'results', label: 'Results', icon: '🏆', short: 'RESULTS' },
];

const tabTitles = { dashboard: 'DASHBOARD', questions: 'QUESTION BANK', players: 'PLAYERS', results: 'RESULTS' };

export default function AdminPage({ gameState, adminData, allResponses, currentQuestion, questionStats, onNextQ, onEndQ, onReset, onPauseResume, onSetTimer, onAddQuestion, onDeleteQuestion, onExport }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sideOpen, setSideOpen] = useState(false);
    const [adminPaused, setAdminPaused] = useState(false);

    const handlePauseResume = () => {
        setAdminPaused(p => !p);
        onPauseResume(adminPaused);
    };

    const handleTabSwitch = (id) => {
        setActiveTab(id);
        setSideOpen(false);
    };

    return (
        <div id="page-admin" className="page">
            {/* Sidebar */}
            <nav className="a-side" id="a-side">
                <div className="s-logo">
                    <div className="s-lt">CYBER GENESIS</div>
                    <div className="s-ls">ADMIN CONTROL CENTER</div>
                </div>
                {tabs.map(t => (
                    <div key={t.id} className={`nav-item${activeTab === t.id ? ' active' : ''}`} onClick={() => setActiveTab(t.id)}>
                        <span className="nav-ico">{t.icon}</span>
                        <span className="nav-txt">{t.label}</span>
                    </div>
                ))}
                <div className="s-bot">
                    <div className="live-c">
                        <div className="ldot"></div>
                        <span className="ltxt">{gameState.totalPlayers} LIVE</span>
                    </div>
                </div>
            </nav>

            {/* Main */}
            <div className="a-main">
                <div className="a-topb">
                    <button className="hamburger" onClick={() => setSideOpen(v => !v)}>☰</button>
                    <div className="a-topb-t">{tabTitles[activeTab] || activeTab.toUpperCase()}</div>
                    <div className={`sb-badge sb-${gameState.status}`}>{gameState.status.toUpperCase()}</div>
                </div>

                <div className="a-cont">
                    {activeTab === 'dashboard' && (
                        <DashboardTab
                            gameState={gameState} adminData={adminData} allResponses={allResponses}
                            currentQuestion={currentQuestion} questionStats={questionStats}
                            adminPaused={adminPaused}
                            onNextQ={onNextQ} onEndQ={onEndQ} onReset={onReset}
                            onPauseResume={handlePauseResume} onSetTimer={onSetTimer} onExport={onExport}
                        />
                    )}
                    {activeTab === 'questions' && (
                        <QuestionsTab questions={adminData.questions} onAddQuestion={onAddQuestion} onDeleteQuestion={onDeleteQuestion} />
                    )}
                    {activeTab === 'players' && (
                        <PlayersTab players={adminData.players} questions={adminData.questions} allResponses={allResponses} />
                    )}
                    {activeTab === 'results' && (
                        <ResultsTab leaderboard={gameState.leaderboard} questions={adminData.questions} allResponses={allResponses} onExport={onExport} />
                    )}
                </div>
            </div>

            {/* Mobile bottom nav */}
            <div className="a-bnav">
                {tabs.map(t => (
                    <div key={t.id} className={`bni${activeTab === t.id ? ' active' : ''}`} onClick={() => setActiveTab(t.id)}>
                        <span>{t.icon}</span>
                        <span>{t.short}</span>
                    </div>
                ))}
            </div>

            {/* Mobile sidebar overlay */}
            {sideOpen && (
                <>
                    <div style={{ display: 'block', position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,.75)' }} onClick={() => setSideOpen(false)}></div>
                    <nav style={{ display: 'flex', position: 'fixed', top: 0, left: 0, bottom: 0, width: '210px', zIndex: 45, background: 'rgba(3,7,18,.98)', borderRight: '1px solid rgba(0,212,255,.15)', padding: '1.2rem 0', flexDirection: 'column', overflowY: 'auto' }}>
                        <div style={{ padding: '0 1.2rem 1.2rem', borderBottom: '1px solid rgba(0,212,255,.1)', marginBottom: '.8rem' }}>
                            <div style={{ fontFamily: 'var(--fH)', fontSize: '.9rem', fontWeight: 900, background: 'linear-gradient(135deg,var(--B),var(--P))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>CYBER GENESIS</div>
                            <div style={{ fontFamily: 'var(--fM)', fontSize: '.56rem', color: 'var(--dim)', letterSpacing: '.18em', marginTop: '.15rem' }}>ADMIN CONTROL CENTER</div>
                        </div>
                        {tabs.map(t => (
                            <div key={t.id} className={`nav-item${activeTab === t.id ? ' active' : ''}`} onClick={() => handleTabSwitch(t.id)}>
                                <span className="nav-ico">{t.icon}</span>
                                <span>{t.label}</span>
                            </div>
                        ))}
                    </nav>
                </>
            )}
        </div>
    );
}
