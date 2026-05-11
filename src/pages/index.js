import {
  data,
  initMobileMenu,
  initHeaderScroll,
  initScrollReveal,
  initBackToTop,
} from '../lib/shared.js';
import {
  initHeroSlideshow,
  initThemesList,
  initAtlas,
  initFeatured,
} from '../lib/home.js';

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initHeaderScroll();

  try {
    initHeroSlideshow(data);
    initThemesList(data);
    initAtlas(data);
    initFeatured(data);
    initScrollReveal();
    initBackToTop();
  } catch (err) {
    console.error('Failed to initialise index page:', err);
  }
});
