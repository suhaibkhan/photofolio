import {
  data,
  initMobileMenu,
  initHeaderScroll,
  initScrollReveal,
} from '../lib/shared.js';
import {
  initGalleryFilters,
  initGallery,
} from '../lib/gallery.js';

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initHeaderScroll();

  try {
    initGalleryFilters(data);
    initGallery(data);
    initScrollReveal();
  } catch (err) {
    console.error('Failed to initialise gallery page:', err);
  }
});
