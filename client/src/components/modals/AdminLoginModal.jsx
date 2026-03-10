import { useState, useRef, useEffect } from 'react';

export default function AdminLoginModal({ isOpen, onClose, onLogin, externalError }) {
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 120);
        } else {
            setPassword('');
            setLocalError('');
        }
    }, [isOpen]);

    useEffect(() => {
        if (externalError) {
            setLocalError(externalError);
            setTimeout(() => setLocalError(''), 3500);
        }
    }, [externalError]);

    if (!isOpen) return null;

    const handleLogin = () => {
        if (!password) return;
        onLogin(password);
    };

    return (
        <div className="modal-ov">
            <div className="modal-box">
                <div className="m-title">⚙ ADMIN ACCESS</div>
                <input
                    ref={inputRef}
                    className="inp"
                    type="password"
                    placeholder="Access code..."
                    autoComplete="off"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                <div className={`m-err ${localError ? 'show' : ''}`}>{localError}</div>
                <div className="row flex gap-[0.6rem] flex-wrap">
                    <button className="btn-cyber ba flex-1" onClick={handleLogin}><span>AUTHENTICATE</span></button>
                    <button className="btn-cyber br" onClick={onClose}><span>BACK</span></button>
                </div>
            </div>
        </div>
    );
}
