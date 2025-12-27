import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  // Load .env files and merge with process.env (critical for Vercel)
  const envFile = loadEnv(mode, '.', '');
  const env = { ...process.env, ...envFile };

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['logo.png', 'robots.txt'],
        manifest: {
          name: 'CFVA Fuoco Prescritto',
          short_name: 'CFVA Fuoco',
          description: 'App per il calcolo e la gestione del fuoco prescritto',
          theme_color: '#ffffff',
          icons: [
            {
              src: 'logo.png',
              sizes: 'any',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
