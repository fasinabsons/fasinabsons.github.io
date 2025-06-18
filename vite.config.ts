import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // For GitHub Pages user/organization site
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          qr: ['qrcode', 'qrcode.react'],
          ocr: ['tesseract.js'],
          utils: ['file-saver', 'jszip', 'papaparse']
        }
      }
    }
  }
});
