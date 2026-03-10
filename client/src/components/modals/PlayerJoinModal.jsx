import { useState, useRef, useEffect } from 'react';

export default function PlayerJoinModal({ isOpen, onClose, onJoin }) {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 120);
        } else {
            setName('');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleJoin = () => {
        if (!name.trim()) {
            setError('Enter a callsign!');
            setTimeout(() => setError(''), 3500);
            return;
        }
        onJoin(name.trim());
    };

    return (
        <div className="modal-ov">
            <div className="modal-box">
                <div className="m-title">⚡ ENTER THE ARENA</div>
                <input
                    ref={inputRef}
                    className="inp"
                    type="text"
                    placeholder="Your callsign..."
                    maxLength="20"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                />
                <div className={`m-err ${error ? 'show' : ''}`}>{error}</div>
                <div className="row flex gap-[0.6rem] flex-wrap">
                    <button className="btn-cyber bp flex-1" onClick={handleJoin}><span>CONNECT</span></button>
                    <button className="btn-cyber br" onClick={onClose}><span>BACK</span></button>
                </div>
            </div>
        </div>
    );
}
