import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import ShaderBackground from '../components/ShaderBackground';

export default function GuestLayout() {
    useEffect(() => {
        document.body.className = '';
    }, []);

    return (
        <>
            <ShaderBackground />
            <main>
                <Outlet />
            </main>
        </>
    );
}
