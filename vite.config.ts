import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    // --- ここから修正 ---
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      allowedHosts: true, // 全てのホストを許可
    },
    preview: {
      allowedHosts: true, // Previewモードでも全てのホストを許可
    },
    // --- ここまで ---
  };
});
