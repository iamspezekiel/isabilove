import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import express from 'express';
import path from 'path';
import { defineConfig } from 'vite';
import { handleGenerateMessage, handleDispatchWebhook } from './server/api.ts';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'isabi-api-routes',
        configureServer(server) {
          const apiApp = express();
          apiApp.use(express.json());
          apiApp.post('/api/gemini/generate-message', handleGenerateMessage);
          apiApp.post('/api/notifications/dispatch-webhook', handleDispatchWebhook);
          server.middlewares.use(apiApp);
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
