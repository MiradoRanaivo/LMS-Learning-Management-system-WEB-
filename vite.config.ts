import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      proxy: {
        // Current API calls use /api; older screens still use /lms/api.
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
        '/lms': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          rewrite: (requestPath) => requestPath.replace(/^\/lms/, ''),
        },
      },
    },
  };
});
