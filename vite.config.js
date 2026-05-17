import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

import prerenderIndex from './vite-plugins/prerender-index.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  base: './',
  plugins: [prerenderIndex()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 4096,
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        gallery: resolve(__dirname, 'gallery.html'),
      },
      output: {
        manualChunks(id) {
          if (
            id.includes('src/lib/home.js')
            || id.includes('src/lib/hero-slideshow.js')
            || id.includes('src/lib/themes-carousel.js')
            || id.includes('src/lib/atlas-grid.js')
            || id.includes('src/lib/atlas-utils.js')
          ) return 'home-app';
          if (id.includes('src/lib/gallery.js')) return 'gallery-app';
          if (
            id.includes('src/lib/shared.js')
            || id.includes('src/lib/paths.js')
            || id.includes('src/lib/lightbox.js')
            || id.includes('data/photos-local.json')
          ) {
            return 'shared';
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
