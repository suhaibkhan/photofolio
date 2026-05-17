import {
  data,
  initMobileMenu,
  initHeaderScroll,
  initScrollReveal,
  initBackToTop,
} from '../lib/shared.js';
import {
  initGalleryFilters,
  initGallery,
} from '../lib/gallery.js';

if (import.meta.env.DEV) {
  import('../lib/dev/font-switcher.js').then(m => m.init());
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initHeaderScroll();

  try {
    initGalleryFilters(data);
    initGallery(data);
    initScrollReveal();
    initBackToTop();
  } catch (err) {
    console.error('Failed to initialise gallery page:', err);
  }
});
