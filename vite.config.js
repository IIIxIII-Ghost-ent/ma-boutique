import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  build: {
    // Minification maximale
    minify: 'esbuild',
    // Supprimer les console.log en production
    esbuildOptions: { drop: ['console', 'debugger'] },
    rollupOptions: {
      output: {
        // Code splitting : sépare les gros packages en chunks indépendants
        manualChunks: {
          'react-core':  ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          'supabase':    ['@supabase/supabase-js'],
        },
        // Noms de fichiers avec hash pour le cache navigateur
        chunkFileNames:  'assets/[name]-[hash].js',
        assetFileNames:  'assets/[name]-[hash][extname]',
        entryFileNames:  'assets/[name]-[hash].js',
      },
    },
    chunkSizeWarningLimit: 500,
    // Compression brotli/gzip automatique sur Vercel
    reportCompressedSize: true,
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js'],
  },

  // Accélère le dev server
  server: {
    hmr: true,
  },
})
