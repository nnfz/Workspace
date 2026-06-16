import React from 'react';
import { NavLink } from 'react-router-dom';

export default function WorkspaceActions({ activeMode }) {
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
        </div>
    );
}
