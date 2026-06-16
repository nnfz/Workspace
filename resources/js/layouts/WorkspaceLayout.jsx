import React from 'react';
import { Outlet } from 'react-router-dom';

export default function WorkspaceLayout() {
    return (
        <div className="workspace-shell">
            <main className="workspace-main">
                <Outlet />
            </main>
        </div>
    );
}
