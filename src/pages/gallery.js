import {
  data,
  initMobileMenu,
  initHeaderScroll,
  initScrollReveal,
  initBackToTop,
} from '../lib/shared.js';
import { initGalleryPage } from '../lib/gallery.js';

if (import.meta.env.DEV) {
  import('../lib/dev/font-switcher.js').then(m => m.init());
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initHeaderScroll();

  try {
    initGalleryPage(data);
    initScrollReveal();
    initBackToTop();
  } catch (err) {
    console.error('Failed to initialise gallery page:', err);
  }
});
