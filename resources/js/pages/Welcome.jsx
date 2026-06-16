import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GlitchText from '../components/GlitchText';

export default function Welcome() {
    const [isExiting, setIsExiting] = useState(false);
    const navigate = useNavigate();

    const handleAction = (e, to) => {
        e.preventDefault();
        setIsExiting(true);
        setTimeout(() => {
            navigate(to);
        }, 300);
    };

    return (
        <div className={`welcome-screen ${isExiting ? 'welcome-screen--exiting' : ''}`}>
            <div className='welcome-screen__center'>
                <GlitchText text="Workspace" className="welcome-screen__title" />
            </div>
            <div className='welcome-screen__bottom'>
                <Link to="/login" onClick={(e) => handleAction(e, '/login')} className="welcome-screen__action">
                    Войти
                </Link>
                <Link to="/register" onClick={(e) => handleAction(e, '/register')} className="welcome-screen__action">
                    Зарегистрироваться
                </Link>
            </div>
        </div>
    );
}
