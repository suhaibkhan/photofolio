import {
  data,
  initMobileMenu,
  initHeaderScroll,
  initGalleryFilters,
  initGallery,
  initScrollReveal,
} from '../lib/app.js';

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
