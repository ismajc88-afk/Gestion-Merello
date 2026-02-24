import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['escudo-merello.png', 'icon-512.png'],
      manifest: {
        name: 'Merello Planner',
        short_name: 'MerelloApp',
        description: 'Gestión Falla Merello 2026',
        theme_color: '#0f172a',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/escudo-merello.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom'],
          // Charting (recharts is heavy)
          'vendor-charts': ['recharts'],
          // Lucide icons
          'vendor-icons': ['lucide-react'],
          // P2P / real-time
          'vendor-realtime': ['trystero'],
        },
      },
    },
  },
});
