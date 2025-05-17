import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig({
  define: {
    'import.meta.env.VITE_APP_API_URL': JSON.stringify(process.env.VITE_APP_API_URL)},
  plugins: [
    react(),
    VitePWA({
      injectRegister: 'auto',
      registerType: 'autoUpdate',
      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [
          /^\/api\/v1\/auth\//,
          /^\/api\/v1\/auth\//,
          /^\/swagger/,
          /^\/docs/,
          /^\/openapi.json/,
          /^\/popup-login\.html(?:\?.*)?$/,
        ],
      },
      includeAssets: ['favicon.svg', 'robots.txt'],
        manifest: {
        name: 'Souffle',
        short_name: 'Souffle',
        description: 'AI 기반 수학 풀이 학습 서비스',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
    tailwindcss(),
    svgr({
      svgrOptions: {
        exportType: 'named',
        ref: true,
        svgo: false,
        titleProp: true,
      },
      include: '**/*.svg',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  }
});
