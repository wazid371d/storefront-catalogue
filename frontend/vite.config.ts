import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Frontend never talks to the Fake Store API or any upstream directly — every
// /api/* call is proxied to our own backend, in dev and in the nginx image alike.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    globals: true,
    css: false,
  },
});
