import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// BUILD_TARGET=android genera la versión que va dentro del APK (sin service worker:
// los archivos ya vienen instalados en el celular).
const isAndroidBuild = process.env.BUILD_TARGET === 'android';

const manifest = {
  id: '/',
  name: 'NexCoach — Entrenamiento y Gestión',
  short_name: 'NexCoach',
  description: 'Rutinas, entrenamiento en vivo, cuotas y progreso de tus alumnos.',
  lang: 'es-AR',
  dir: 'ltr',
  start_url: '/?source=pwa',
  scope: '/',
  display: 'standalone',
  display_override: ['standalone', 'minimal-ui'],
  // "any": se adapta a celular vertical y a tablet horizontal.
  orientation: 'any',
  background_color: '#04070e',
  theme_color: '#04070e',
  categories: ['health', 'fitness', 'sports'],
  icons: [
    { src: '/icons/icon-48.png', sizes: '48x48', type: 'image/png', purpose: 'any' },
    { src: '/icons/icon-72.png', sizes: '72x72', type: 'image/png', purpose: 'any' },
    { src: '/icons/icon-96.png', sizes: '96x96', type: 'image/png', purpose: 'any' },
    { src: '/icons/icon-144.png', sizes: '144x144', type: 'image/png', purpose: 'any' },
    { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/icons/icon-256.png', sizes: '256x256', type: 'image/png', purpose: 'any' },
    { src: '/icons/icon-384.png', sizes: '384x384', type: 'image/png', purpose: 'any' },
    { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
    { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    { src: '/icons/monochrome-96.png', sizes: '96x96', type: 'image/png', purpose: 'monochrome' }
  ],
  shortcuts: [
    { name: 'Entrenar hoy', short_name: 'Entrenar', url: '/?tab=workout', icons: [{ src: '/icons/icon-96.png', sizes: '96x96' }] },
    { name: 'Control de pagos', short_name: 'Pagos', url: '/?tab=payments', icons: [{ src: '/icons/icon-96.png', sizes: '96x96' }] }
  ]
};

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      disable: isAndroidBuild,
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest,
      workbox: {
        // Toda la app queda guardada en el celular: abre sin señal en el gimnasio.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,webmanifest}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/__/, /^\/api\//],
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        runtimeCaching: [
          {
            // Fotos de comidas / avatares subidos a Firebase Storage
            urlPattern: ({ url }) => url.hostname === 'firebasestorage.googleapis.com' && /\.(jpe?g|png|webp)|alt=media/.test(url.href) && !/video/.test(url.href),
            handler: 'CacheFirst',
            options: { cacheName: 'nexcoach-fotos', expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }, cacheableResponse: { statuses: [0, 200] } }
          },
          {
            urlPattern: ({ url }) => url.hostname === 'images.unsplash.com' || url.hostname === 'i.ytimg.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'nexcoach-imagenes', expiration: { maxEntries: 150, maxAgeSeconds: 60 * 60 * 24 * 30 }, cacheableResponse: { statuses: [0, 200] } }
          }
        ]
      },
      devOptions: { enabled: false }
    })
  ],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          icons: ['lucide-react']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
});
