import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

/**
 * Base path stratejisi:
 *  - web (default, GitHub Pages): '/MatBil/'
 *  - capacitor (Android): './' — relative
 *  - custom-domain (subdomain hazır olduğunda): '/'
 *
 * DNS ayarlanıp subdomain aktive olunca:
 *   VITE_BUILD_TARGET=custom-domain veya .github/workflows'da export edilir
 *
 * Öncelik:
 *  1. VITE_BASE env (manuel override)
 *  2. VITE_BUILD_TARGET env
 *  3. Varsayılan '/MatBil/' (ymutlu49.github.io/MatBil/ için)
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
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
