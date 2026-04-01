import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://vercel.live https://browser.sentry-cdn.com https://www.googletagmanager.com https://www.google-analytics.com https://s3.tradingview.com https://www.youtube.com https://www.youtube-nocookie.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com https://accounts.google.com",
  "font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://vercel.live data: blob:",
  "img-src 'self' data: blob: https:",
  "media-src 'self' https://assets.mixkit.co blob: https://www.youtube.com https://www.youtube-nocookie.com",
  "connect-src 'self' https://*.convex.cloud https://*.convex.site wss://*.convex.cloud wss://ws*.pusher.com ws://localhost:* https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com https://assets.mixkit.co https://*.ingest.sentry.io https://www.google-analytics.com https://api.emailjs.com https://api.dicebear.com https://images.unsplash.com https://picsum.photos https://fastly.picsum.photos https://*.cloudinary.com https://api.cloudinary.com https://fonts.googleapis.com https://fonts.gstatic.com https://vercel.live https://s3.tradingview.com https://www.tradingview.com https://www.youtube.com https://www.youtube-nocookie.com https://img.youtube.com https://api.binance.com https://min-api.cryptocompare.com https://ui-avatars.com https://www.transparenttextures.com https://c.mql5.com https://huggingface.co https://*.huggingface.co",
  "frame-src 'self' https://*.tradingview.com https://vercel.live https://www.tradingview.com https://www.youtube.com https://www.youtube-nocookie.com https://players.youtube.com https://*.huggingface.co https://accounts.google.com",
  "worker-src 'self' blob:",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ');

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: cspDirectives,
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

export default defineConfig(({ mode }) => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      headers: {
        'Content-Security-Policy': cspDirectives,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      },
    },
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'TradeHub - Trading Community',
          short_name: 'TradeHub',
          description: 'Comunidad de trading profesional',
          theme_color: '#3b82f6',
          background_color: '#050608',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,svg,woff2}'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/.*\.convex\.cloud/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'convex-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/api\.(binance|cryptocompare)\.com/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'market-data-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60
                }
              }
            }
          ]
        }
      }),
      sentryVitePlugin({
        org: process.env.SENTRY_ORG || 'your-org',
        project: process.env.SENTRY_PROJECT || 'tradeportal',
        authToken: process.env.SENTRY_AUTH_TOKEN,
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve('.'),
        '../../lib': path.resolve(__dirname, './lib'),
        '../../../lib': path.resolve(__dirname, './lib'),
        '../../../../lib': path.resolve(__dirname, './lib'),
        '../lib': path.resolve(__dirname, './lib'),
        '../../lib/utils/logger': path.resolve(__dirname, './lib/utils/logger'),
        '../../lib/convex/client': path.resolve(__dirname, './lib/convex/client'),
        '../../../lib/utils/logger': path.resolve(__dirname, './lib/utils/logger'),
        '../../../lib/convex/client': path.resolve(__dirname, './lib/convex/client'),
        '../../convex/_generated/api': path.resolve(__dirname, './convex/_generated/api.js'),
        '../../../convex/_generated/api': path.resolve(__dirname, './convex/_generated/api.js'),
        '../../../../convex/_generated/api': path.resolve(__dirname, './convex/_generated/api.js'),
        '../convex/_generated/api': path.resolve(__dirname, './convex/_generated/api.js'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-convex': ['convex'],
            'vendor-ui': ['framer-motion', 'lucide-react', 'clsx', 'tailwind-merge'],
            'vendor-utils': ['dompurify', 'axios', 'date-fns', 'lodash'],
            'vendor-sentry': ['@sentry/react', '@sentry/browser'],
          },
        },
      },
      chunkSizeWarningLimit: 600,
      sourcemap: mode !== 'production',
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'convex'],
      exclude: ['@tailwindcss/vite'],
    },
  };
});
