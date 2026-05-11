import data from '../../data/photos-local.json';
import { imgSrc, coverWebp, heroWebp } from './paths.js';

export { data, imgSrc, coverWebp, heroWebp };

export function buildLocationMap(data) {
  return new Map((data.locations || []).map((loc) => [loc.id, loc]));
}

export function getLocationLabel(photo, locationMap) {
  const location = locationMap.get(photo.location);
  if (!location) return photo.location || '';
  return location.shortName || location.name || location.id;
}

export function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-list');
  const overlay = document.querySelector('.nav-overlay');
  if (!toggle || !nav) return;

  function closeMenu() {
    toggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('nav-open');
    overlay?.classList.remove('active');
    document.body.classList.remove('menu-open');
  }

  function openMenu() {
    toggle.setAttribute('aria-expanded', 'true');
    nav.classList.add('nav-open');
    overlay?.classList.add('active');
    document.body.classList.add('menu-open');
  }

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) closeMenu();
    else openMenu();
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  overlay?.addEventListener('click', closeMenu);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('nav-open')) {
      closeMenu();
    }
  });
}

export function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 100);
  }, { passive: true });
}

export function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal, .themes-stage, .atlas-tile');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach((el) => observer.observe(el));
}
