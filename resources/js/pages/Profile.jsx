import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Profile() {
    const [user, setUser] = useState({ name: '', email: '' });
    const [loading, setLoading] = useState(true);
    
    // Passwords
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Delete password
    const [deletePassword, setDeletePassword] = useState('');

    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get('/api/user');
            setUser(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        try {
            await axios.patch('/profile', user);
            setMessage('Данные профиля успешно обновлены.');
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка обновления профиля');
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        try {
            await axios.put('/password', {
                current_password: currentPassword,
                password: newPassword,
                password_confirmation: confirmPassword
            });
            setMessage('Пароль успешно изменён.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка изменения пароля');
        }
    };

    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        try {
            await axios.delete('/profile', { data: { password: deletePassword } });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка удаления аккаунта');
        }
    };

    if (loading) return <div className="p-4">Загрузка профиля...</div>;

    return (
        <div className="profile-page">
            <div className="profile-page__inner">
                <div className="profile-page__header">
                    <Link to="/workspace/week" className="profile-page__back-link">
                        <span aria-hidden="true">←</span>
                        <span>Вернуться в Workspace</span>
                    </Link>

                    <div className="profile-page__heading">
                        <h1 className="profile-page__title">Профиль</h1>
                        <p className="profile-page__subtitle">Управление данными аккаунта, паролем и доступом к аккаунту.</p>
                    </div>
                </div>

                <div className="profile-sections">
                    {message && <div className="profile-message profile-message--success">{message}</div>}
                    {error && <div className="profile-message profile-message--error">{error}</div>}

                    <section className="profile-card">
                        <div className="profile-card__header">
                            <h2 className="profile-card__title">Данные профиля</h2>
                        </div>
                        <div className="profile-card__body">
                            <form onSubmit={handleProfileUpdate} className="profile-form">
                                <div className="profile-form__group">
                                    <label htmlFor="name" className="profile-form__label">Имя</label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={user.name}
                                        onChange={e => setUser({ ...user, name: e.target.value })}
                                        className="profile-form__input"
                                        required
                                    />
                                </div>
                                <div className="profile-form__group">
                                    <label htmlFor="email" className="profile-form__label">Email</label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={user.email}
                                        onChange={e => setUser({ ...user, email: e.target.value })}
                                        className="profile-form__input"
                                        required
                                    />
                                </div>
                                <div className="profile-form__actions">
                                    <button type="submit" className="profile-button profile-button--primary">
                                        Сохранить изменения
                                    </button>
                                </div>
                            </form>
                        </div>
                    </section>

                    <section className="profile-card">
                        <div className="profile-card__header">
                            <h2 className="profile-card__title">Смена пароля</h2>
                        </div>
                        <div className="profile-card__body">
                            <form onSubmit={handlePasswordUpdate} className="profile-form">
                                <div className="profile-form__group">
                                    <label htmlFor="current_password" className="profile-form__label">Текущий пароль</label>
                                    <input
                                        id="current_password"
                                        type="password"
                                        value={currentPassword}
                                        onChange={e => setCurrentPassword(e.target.value)}
                                        className="profile-form__input"
                                        required
                                    />
                                </div>
                                <div className="profile-form__group">
                                    <label htmlFor="password" className="profile-form__label">Новый пароль</label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        className="profile-form__input"
                                        required
                                    />
                                    <p className="profile-form__help">Пароль должен быть не короче 8 символов</p>
                                </div>
                                <div className="profile-form__group">
                                    <label htmlFor="password_confirmation" className="profile-form__label">Подтвердите новый пароль</label>
                                    <input
                                        id="password_confirmation"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className="profile-form__input"
                                        required
                                    />
                                </div>
                                <div className="profile-form__actions">
                                    <button type="submit" className="profile-button profile-button--success">
                                        Сменить пароль
                                    </button>
                                </div>
                            </form>
                        </div>
                    </section>

                    <section className="profile-card profile-card--danger">
                        <div className="profile-card__header">
                            <h2 className="profile-card__title">Удаление аккаунта</h2>
                        </div>
                        <div className="profile-card__body">
                            <p className="profile-form__help">Это действие удалит ваш аккаунт.</p>
                            <form onSubmit={handleDeleteAccount} className="profile-form">
                                <div className="profile-form__group">
                                    <label htmlFor="delete_password" className="profile-form__label">Подтвердите пароль</label>
                                    <input
                                        id="delete_password"
                                        type="password"
                                        value={deletePassword}
                                        onChange={e => setDeletePassword(e.target.value)}
                                        className="profile-form__input"
                                        required
                                    />
                                </div>
                                <div className="profile-form__actions">
                                    <button type="submit" className="profile-button profile-button--danger">
                                        Удалить аккаунт
                                    </button>
                                </div>
                            </form>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
