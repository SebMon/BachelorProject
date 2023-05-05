/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,wasm}']
      },
      manifest: {
        name: 'Encryption Application',
        start_url: '/',
        id: '/',
        short_name: 'crypto',
        description: '',
        theme_color: '#261f52',
        icons: [
          {
            src: '/vite.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ],
        file_handlers: [
          {
            action: '/',
            accept: {
              'text/plain': ['.test-app']
            }
          }
        ]
      }
    })
  ],
  test: {
    environment: 'jsdom'
  }
});
