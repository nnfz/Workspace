import React from 'react';
import { Link } from 'react-router-dom';
import GlitchText from '../components/GlitchText';

export default function Welcome() {
    return (
        <div className="welcome-screen">
            <div className='welcome-screen__center'>
                <GlitchText text="Workspace" className="welcome-screen__title" />
            </div>
            <div className='welcome-screen__bottom'>
                <Link to="/login" className="welcome-screen__action">
                    Войти
                </Link>
                <Link to="/register" className="welcome-screen__action">
                    Зарегистрироваться
                </Link>
            </div>
        </div>
    );
}
