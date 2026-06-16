import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
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

const router = createBrowserRouter([
    {
        element: <GuestLayout />,
        children: [
            { path: "/", element: <Welcome /> },
            { path: "/login", element: <Login /> },
            { path: "/register", element: <Register /> },
        ]
    },
    {
        element: <WorkspaceLayout />,
        children: [
            { path: "/profile", element: <Profile /> },
            { path: "/workspace/week/:date?", element: <WeekBoard /> },
            { path: "/workspace/month/:month?", element: <MonthView /> },
            { path: "/workspace/notebook", element: <Notebook /> },
        ]
    },
    { path: "/workspace/*", element: <Navigate to="/workspace/week" replace /> },
    { path: "*", element: <Navigate to="/" replace /> },
]);

function App() {
    return <RouterProvider router={router} />;
}

const rootElement = document.getElementById('app');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
}
