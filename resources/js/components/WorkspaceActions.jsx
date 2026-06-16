import React from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';

export default function WorkspaceActions({ activeMode }) {
    const handleLogout = async () => {
        try {
            await axios.post('/logout');
            window.location.href = '/';
        } catch (err) {
            console.error('Logout error', err);
        }
    };

    return (
        <div className="workspace-actions">
            <nav className="workspace-nav">
                <NavLink 
                    to="/workspace/week" 
                    className={({ isActive }) => `workspace-nav__link ${activeMode === 'week' || isActive ? 'is-active' : ''}`}
                >
                    Неделя
                </NavLink>
                <NavLink 
                    to="/workspace/month" 
                    className={({ isActive }) => `workspace-nav__link ${activeMode === 'month' || isActive ? 'is-active' : ''}`}
                >
                    Месяц
                </NavLink>
                <NavLink 
                    to="/workspace/notebook" 
                    className={({ isActive }) => `workspace-nav__link ${activeMode === 'notebook' || isActive ? 'is-active' : ''}`}
                >
                    Блокнот
                </NavLink>
            </nav>

            <div className="profile-dropdown">
                <a href="/profile" className="profile-dropdown__trigger">
                    Профиль
                </a>
                <button type="button" onClick={handleLogout} className="profile-dropdown__logout">
                    Выйти
                </button>
            </div>
        </div>
    );
}
