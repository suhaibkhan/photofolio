import {
  data,
  initMobileMenu,
  initHeaderScroll,
  initScrollReveal,
  initBackToTop,
} from '../lib/shared.js';
import { initFeatured } from '../lib/home.js';
import { initHeroSlideshow } from '../lib/hero-slideshow.js';
import { initThemesCarousel } from '../lib/themes-carousel.js';
import { initAtlas } from '../lib/atlas-grid.js';

if (import.meta.env.DEV) {
  import('../lib/dev/font-switcher.js').then(m => m.init());
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initHeaderScroll();

  try {
    initHeroSlideshow(data);
    initThemesCarousel(data);
    initAtlas(data);
    initFeatured(data);
    initScrollReveal();
    initBackToTop();
  } catch (err) {
    console.error('Failed to initialise index page:', err);
  }
});
