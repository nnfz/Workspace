import React from 'react';
import { Outlet } from 'react-router-dom';
import ShaderBackground from '../components/ShaderBackground';

export default function WorkspaceLayout() {
    return (
        <div className="workspace-shell" style={{ position: 'relative', minHeight: '100vh' }}>
            <ShaderBackground />
            <main className="workspace-main" style={{ position: 'relative', zIndex: 1 }}>
                <Outlet />
            </main>
        </div>
    );
}
