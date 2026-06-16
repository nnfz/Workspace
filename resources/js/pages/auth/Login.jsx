import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import GlitchText from '../../components/GlitchText';


export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState(null);
    const [isExiting, setIsExiting] = useState(false);
    const navigate = useNavigate();

    const handleBack = (e, to) => {
        e.preventDefault();
        setIsExiting(true);
        setTimeout(() => {
            navigate(to);
        }, 250);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await axios.get('/sanctum/csrf-cookie');
            await axios.post('/login', { email, password, remember });
            navigate('/workspace/week');
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка входа');
        }
    };

    return (
        <div className={`auth-page ${isExiting ? 'auth-page--exiting' : ''}`}>
            <div className="auth-page__logo">
                <Link to="/" onClick={(e) => handleBack(e, '/')} style={{ textDecoration: 'none' }}>
                    <GlitchText text="Workspace" />
                </Link>
            </div>
            
            <div className="auth-page__inner">
                <h1 className="auth-page__title">Вход</h1>

                {error && (
                    <div className="auth-message auth-message--error">
                        <ul className="auth-message__list">
                            <li>{error}</li>
                        </ul>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-form__group">
                        <label htmlFor="email" className="auth-form__label">Электронная почта</label>
                        <input
                            id="email"
                            className="auth-form__input"
                            type="email"
                            placeholder='workspace@email.com'
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoFocus
                            />
                    </div>

                    <div className="auth-form__group">
                        <label htmlFor="password" className="auth-form__label">Пароль</label>
                        <input
                            id="password"
                            className="auth-form__input"
                            placeholder='M3gaPassw0rd'
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            />
                    </div>

                    <div className="auth-form__row">
                        <label htmlFor="remember_me" className="auth-checkbox">
                            <input 
                                id="remember_me" 
                                type="checkbox" 
                                checked={remember}
                                onChange={e => setRemember(e.target.checked)}
                                />
                            <span>Запомнить меня</span>
                        </label>
                    </div>

                    <button type="submit" className="auth-button">
                        Войти
                    </button>
                    
                    <div className="auth-form__row auth-form__row--end">
                        <Link to="/register" onClick={(e) => handleBack(e, '/register')} className="auth-link">
                            Нет аккаунта? Регистрация
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
