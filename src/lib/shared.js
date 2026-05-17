import '../../css/base.css';
import data from '../../data/photos-local.json';
import { coverWebp, heroWebp } from './paths.js';

export { data, coverWebp, heroWebp };

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
  const navLists = document.querySelectorAll('.nav-list');
  const overlay = document.querySelector('.nav-overlay');
  if (!toggle || !navLists.length) return;

  function closeMenu() {
    toggle.setAttribute('aria-expanded', 'false');
    navLists.forEach((n) => n.classList.remove('nav-open'));
    overlay?.classList.remove('active');
    document.body.classList.remove('menu-open');
  }

  function openMenu() {
    toggle.setAttribute('aria-expanded', 'true');
    navLists.forEach((n) => n.classList.add('nav-open'));
    overlay?.classList.add('active');
    document.body.classList.add('menu-open');
  }

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) closeMenu();
    else openMenu();
  });

  navLists.forEach((nav) => {
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });
  });

  overlay?.addEventListener('click', closeMenu);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
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
  const reveals = document.querySelectorAll('.reveal, .themes-stage, .atlas__stage');
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

export function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  const ringFill = btn.querySelector('.back-to-top__ring-fill');
  const circumference = 144.51; // 2 * π * 23

  function update() {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const progress = total > 0 ? scrolled / total : 0;

    btn.classList.toggle('is-visible', scrolled > 400);

    if (ringFill) {
      ringFill.style.strokeDashoffset = circumference * (1 - progress);
    }
  }

  window.addEventListener('scroll', update, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  update();
}
