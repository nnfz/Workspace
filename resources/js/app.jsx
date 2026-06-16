import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import '../css/app.css';

// Configure Axios
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true;

// Pages
import Welcome from './pages/Welcome';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/Profile';
import WeekBoard from './pages/WeekBoard';
import MonthView from './pages/MonthView';
import Notebook from './pages/Notebook';

// Layouts
import GuestLayout from './layouts/GuestLayout';
import WorkspaceLayout from './layouts/WorkspaceLayout';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Guest routes share the same layout for smooth transitions */}
                <Route element={<GuestLayout />}>
                    <Route path="/" element={<Welcome />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Route>

                <Route element={<WorkspaceLayout />}>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/workspace/week/:date?" element={<WeekBoard />} />
                    <Route path="/workspace/month/:month?" element={<MonthView />} />
                    <Route path="/workspace/notebook" element={<Notebook />} />
                </Route>

                <Route path="/workspace/*" element={<Navigate to="/workspace/week" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

const rootElement = document.getElementById('app');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
}
