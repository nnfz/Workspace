import React, { useEffect, useState, useRef } from 'react';
import { Outlet, useLocation, useBlocker } from 'react-router-dom';
import ShaderBackground from '../components/ShaderBackground';

export default function GuestLayout() {
    const [isExiting, setIsExiting] = useState(false);
    const location = useLocation();
    const lastPathname = useRef(location.pathname);

    // СИНХРОННЫЙ СБРОС (Важно для предотвращения моргания)
    // Если путь изменился, мы ГАРАНТИРОВАННО выключаем режим выхода прямо во время рендера
    if (lastPathname.current !== location.pathname) {
        if (isExiting) setIsExiting(false);
        lastPathname.current = location.pathname;
    }

    const blocker = useBlocker(({ currentLocation, nextLocation }) => {
        return currentLocation.pathname !== nextLocation.pathname && !isExiting;
    });

    useEffect(() => {
        if (blocker.state === "blocked") {
            setIsExiting(true);
            const timer = setTimeout(() => {
                // blocker.proceed() вызовет смену локации и наш синхронный сброс выше
                blocker.proceed();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [blocker]);

    useEffect(() => {
        document.body.className = '';
    }, []);

    return (
        <div 
            className={isExiting ? 'guest-layout--exiting' : ''} 
            style={{ 
                minHeight: '100vh', 
                position: 'relative',
                backgroundColor: 'transparent'
            }}
        >
            <ShaderBackground />
            <main style={{ position: 'relative', zIndex: 1, width: '100%', height: '100vh' }}>
                <Outlet />
            </main>
        </div>
    );
}
