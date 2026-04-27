import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    host: '127.0.0.1',
    proxy: {
      // Forward API calls to FastAPI during development.
      // Use 127.0.0.1 explicitly to avoid IPv4/IPv6 resolution mismatches
      // (uvicorn binds to 127.0.0.1 by default).
      '/detect-pii-entities':      'http://127.0.0.1:8001',
      '/anonymize-with-fake-data': 'http://127.0.0.1:8001',
      '/anonymize-and-transform':  'http://127.0.0.1:8001',
      '/health':                   'http://127.0.0.1:8001',
      '/convert':                  'http://127.0.0.1:8001',
      '/prompts':                  'http://127.0.0.1:8001',
      '/entities':                 'http://127.0.0.1:8001',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
