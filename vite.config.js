import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Base path stratejisi:
 *  - web (default, GitHub Pages alt yol): '/MatBil/'
 *  - capacitor (Android): './' — relative
 *  - custom-domain (kök domain, ör: subdomain.diskalkuli.com): '/'
 *
 * Öncelik:
 *  1. VITE_BASE env (manuel override)
 *  2. VITE_BUILD_TARGET env
 *  3. Varsayılan '/MatBil/' (ymutlu49.github.io/MatBil/)
 */
const target = process.env.VITE_BUILD_TARGET || 'web';
const defaultBase = {
  capacitor: './',
  'custom-domain': '/',
  web: '/MatBil/',
}[target] || '/MatBil/';
const base = process.env.VITE_BASE || defaultBase;

export default defineConfig({
  plugins: [react()],
  base,
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
