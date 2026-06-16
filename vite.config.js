import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        proxy: {
            // Proxy API requests to Laravel
            '/api': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                secure: false,
            },
            // Proxy auth/sanctum endpoints
            '/login': 'http://127.0.0.1:8000',
            '/logout': 'http://127.0.0.1:8000',
            '/register': 'http://127.0.0.1:8000',
            '/sanctum': 'http://127.0.0.1:8000',
            '/password': 'http://127.0.0.1:8000',
            '/profile': 'http://127.0.0.1:8000',
            '/tasks': 'http://127.0.0.1:8000',
            '/notebook': 'http://127.0.0.1:8000',
            '/workspace/notebook/sheets': 'http://127.0.0.1:8000',
        }
    }
});