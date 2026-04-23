import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Split vendor chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('@supabase')) return 'supabase'
          if (id.includes('react-router-dom') || id.includes('react-dom') || id.includes('node_modules/react/')) return 'vendor'
        },
      },
    },
    // Compress assets
    chunkSizeWarningLimit: 600,
  },
  // Image optimization
  assetsInlineLimit: 4096,
})