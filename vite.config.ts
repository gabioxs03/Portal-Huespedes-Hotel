import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Hotel Aura — Guest Experience',
        short_name: 'Hotel Aura',
        description: 'Servicios y experiencias para huéspedes de Hotel Aura.',
        theme_color: '#11251F',
        background_color: '#F8F5EF',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: 'pwa-512x512.svg', sizes: '512x512', type: 'image/svg+xml' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true
      }
    })
  ],
  build: {
    target: 'es2022',
    sourcemap: true,
    cssCodeSplit: true
  }
})
