import {
  data,
  initMobileMenu,
  initHeaderScroll,
  initHeroSlideshow,
  initThemesList,
  initAtlas,
  initScrollReveal,
} from '../lib/app.js';

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initHeaderScroll();

  try {
    initHeroSlideshow(data);
    initThemesList(data);
    initAtlas(data);
    initScrollReveal();
  } catch (err) {
    console.error('Failed to initialise index page:', err);
  }
});
