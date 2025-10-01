import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite Configuration for SuiFund Frontend
 * 
 * Features:
 * - React fast refresh for development
 * - Code splitting for optimal bundle size
 * - Source maps for debugging
 * - Test environment setup
 * - Coverage reporting
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true // Allow external access
  },
  build: {
    outDir: 'dist',
    sourcemap: true, // Generate source maps for debugging
    rollupOptions: {
      output: {
        // Code splitting for better caching and load performance
        manualChunks: {
          vendor: ['react', 'react-dom'],
          sui: ['@mysten/sui.js', '@mysten/wallet-kit'],
          ui: ['framer-motion', 'clsx', 'tailwind-merge']
        }
      }
    }
  },
  // Test configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.js',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.config.js'
      ]
    }
  }
})