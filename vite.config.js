import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Base path stratejisi:
 *  - web (default, custom subdomain matbil.diskalkuli.com): '/'
 *  - capacitor (Android): './' — relative
 *  - github-subpath (fallback, ymutlu49.github.io/MatBil/): '/MatBil/'
 *
 * Öncelik:
 *  1. VITE_BASE env (manuel override)
 *  2. VITE_BUILD_TARGET env
 *  3. Varsayılan '/' (matbil.diskalkuli.com custom subdomain için)
 */
const target = process.env.VITE_BUILD_TARGET || 'web';
const defaultBase = {
  capacitor: './',
  'github-subpath': '/MatBil/',
  web: '/',
}[target] || '/';
const base = process.env.VITE_BASE || defaultBase;

export default defineConfig({
  plugins: [react()],
  base,
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
