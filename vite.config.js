import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/elderlyfitness/',
  build: { outDir: 'docs' },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg', 'icons/icon-maskable.svg'],
      manifest: {
        name: 'Atividade Física',
        short_name: 'Atividade',
        description: 'Acompanhe sua atividade física diária',
        lang: 'pt-BR',
        start_url: '/elderlyfitness/',
        scope: '/elderlyfitness/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0a0a0a',
        theme_color: '#0b6e4f',
        icons: [
          { src: '/elderlyfitness/icons/icon.svg', sizes: 'any', type: 'image/svg+xml' },
          {
            src: '/elderlyfitness/icons/icon-maskable.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/elderlyfitness/index.html',
        navigateFallbackDenylist: [/^\/youtube/, /youtube\.com/, /youtu\.be/],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin === self.location.origin &&
              url.pathname.startsWith('/elderlyfitness/icons/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'icons',
              expiration: { maxEntries: 16, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
});
