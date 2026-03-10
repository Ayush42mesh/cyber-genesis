import { useState } from 'react';

export default function QuestionsTab({ questions, onAddQuestion, onDeleteQuestion }) {
    const [text, setText] = useState('');
    const [optA, setOptA] = useState('');
    const [optB, setOptB] = useState('');
    const [optC, setOptC] = useState('');
    const [optD, setOptD] = useState('');
    const [correct, setCorrect] = useState(0);
    const [points, setPoints] = useState(100);

    const handleAdd = () => {
        if (!text || !optA || !optB || !optC || !optD) {
            alert('Fill all fields');
            return;
        }
        onAddQuestion({ text, options: [optA, optB, optC, optD], correct: parseInt(correct), points: parseInt(points) || 100 });
        setText(''); setOptA(''); setOptB(''); setOptC(''); setOptD('');
        setCorrect(0); setPoints(100);
    };

    return (
        <div className="a-panel active flex flex-col gap-[0.8rem]">
            <div className="card">
                <div className="ct">➕ ADD QUESTION</div>
                <div className="fg">
                    <label className="fl">Question Text</label>
                    <textarea className="inp" placeholder="Type your question..." value={text} onChange={e => setText(e.target.value)} />
                </div>
                <div className="fg">
                    <label className="fl">Answer Options</label>
                    <div className="o2">
                        <input className="inp" type="text" placeholder="Option A" value={optA} onChange={e => setOptA(e.target.value)} style={{ margin: '0 0 .38rem' }} />
                        <input className="inp" type="text" placeholder="Option B" value={optB} onChange={e => setOptB(e.target.value)} style={{ margin: '0 0 .38rem' }} />
                        <input className="inp" type="text" placeholder="Option C" value={optC} onChange={e => setOptC(e.target.value)} style={{ margin: '0 0 .38rem' }} />
                        <input className="inp" type="text" placeholder="Option D" value={optD} onChange={e => setOptD(e.target.value)} style={{ margin: '0 0 .38rem' }} />
                    </div>
                </div>
                <div className="row flex gap-[0.65rem] mb-[0.65rem]">
                    <div style={{ flex: 1 }}>
                        <label className="fl">Correct Answer</label>
                        <select className="inp" value={correct} onChange={e => setCorrect(e.target.value)} style={{ margin: 0 }}>
                            <option value="0">A</option>
                            <option value="1">B</option>
                            <option value="2">C</option>
                            <option value="3">D</option>
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label className="fl">Points</label>
                        <input className="inp" type="number" value={points} min="10" max="500" onChange={e => setPoints(e.target.value)} style={{ margin: 0 }} />
                    </div>
                </div>
                <button className="btn-ctrl cG" onClick={handleAdd}>➕ ADD QUESTION</button>
            </div>

            <div className="card">
                <div className="ct">📋 QUESTION BANK (<span>{questions.length}</span>)</div>
                <div className="ql">
                    {questions.length === 0
                        ? <div style={{ color: 'var(--dim)', fontFamily: 'var(--fM)', fontSize: '.78rem', textAlign: 'center', padding: '1rem' }}>No questions yet</div>
                        : questions.map((q, i) => (
                            <div key={q.id} className="qi">
                                <div className="qn">Q{i + 1}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div className="qt">{q.text}</div>
                                    <div style={{ marginTop: '.28rem' }}>
                                        {q.options.map((o, oi) => (
                                            <span key={oi} style={{ fontFamily: 'var(--fM)', fontSize: '.62rem', color: oi === q.correct ? 'var(--G)' : 'var(--dim)', marginRight: '.65rem' }}>
                                                {['A', 'B', 'C', 'D'][oi]}: {o}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="qp">{q.points}pts</div>
                                <button className="qd" onClick={() => onDeleteQuestion(q.id)}>DEL</button>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
}
