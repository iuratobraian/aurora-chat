import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        passes: 2,
      },
      mangle: true,
    },
  },
});
