import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  renderHeroFirstSlide,
  renderAtlasHtml,
  renderThemesHtml,
  renderFeaturedHtml,
} from '../src/lib/templates/prerender.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.resolve(__dirname, '../data/photos-local.json');

async function loadData() {
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  return JSON.parse(raw);
}

export default function prerenderIndex() {
  return {
    name: 'prerender-index',

    transformIndexHtml: {
      order: 'pre',
      async handler(html, ctx) {
        const filename = ctx?.filename || ctx?.path || '';
        if (!filename.endsWith('index.html')) return html;
        if (filename.endsWith('gallery.html')) return html;

        const data = await loadData();
        const hero = renderHeroFirstSlide(data);
        const atlasHtml = renderAtlasHtml(data);
        const themesHtml = renderThemesHtml(data);
        const featuredHtml = renderFeaturedHtml(data);

        return html
          .replace('<!--PRERENDER:head-preload-->', hero.preloadLinks || '')
          .replace('<!--PRERENDER:hero-->', hero.slideHtml)
          .replace('<!--PRERENDER:hero-title-->', hero.titleText)
          .replace('<!--PRERENDER:hero-location-->', hero.locationText)
          .replace('<!--PRERENDER:atlas-->', atlasHtml)
          .replace('<!--PRERENDER:themes-->', themesHtml)
          .replace('<!--PRERENDER:featured-->', featuredHtml);
      },
    },

    configureServer(server) {
      server.watcher.add(DATA_PATH);
      const reload = (changed) => {
        if (changed === DATA_PATH) {
          server.ws.send({ type: 'full-reload', path: '*' });
        }
      };
      server.watcher.on('change', reload);
      server.watcher.on('unlink', reload);
    },
  };
}
