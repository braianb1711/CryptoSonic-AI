import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative paths work on GitHub Pages without knowing your repo name
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
});
