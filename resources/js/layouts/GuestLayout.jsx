import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useBlocker } from 'react-router-dom';
import ShaderBackground from '../components/ShaderBackground';

export default function GuestLayout() {
    const [isExiting, setIsExiting] = useState(false);
    const location = useLocation();

    // Блокировщик для плавного перехода
    const blocker = useBlocker(({ currentLocation, nextLocation }) => {
        // Блокируем, только если мы ПЕРЕХОДИМ на другую страницу внутри GuestLayout
        // и еще не начали анимацию выхода
        return currentLocation.pathname !== nextLocation.pathname && !isExiting;
    });

    useEffect(() => {
        if (blocker.state === "blocked") {
            setIsExiting(true);
            
            // Ждем завершения анимации выхода (0.3s)
            setTimeout(() => {
                // Переходим на новую страницу
                blocker.proceed();
                // Флаг isExiting сбросится автоматически в useEffect(location) ниже
            }, 300);
        }
    }, [blocker]);

    // Сбрасываем флаг выхода ПРИ СМЕНЕ страницы, чтобы новая страница начала анимацию ВХОДА
    useEffect(() => {
        setIsExiting(false);
    }, [location.pathname]);

    useEffect(() => {
        document.body.className = '';
    }, []);

    return (
        <div className={isExiting ? 'guest-layout--exiting' : ''} style={{ minHeight: '100vh', position: 'relative' }}>
            <ShaderBackground />
            <main style={{ position: 'relative', zIndex: 1 }}>
                <Outlet />
            </main>
        </div>
    );
}
