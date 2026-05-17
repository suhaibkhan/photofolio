import '../../css/home.css';
import { imgSrc, coverWebp, heroWebp, buildLocationMap, getLocationLabel } from './shared.js';
import { createLightboxEl, initDataLightbox } from './lightbox.js';

// ============================
// FEATURED FRAME — thumb-to-main swap
// ============================
export function initFeatured(data) {
  const section = document.getElementById('featured');
  if (!section) return;

  const main = section.querySelector('.featured__main');
  const heading = section.querySelector('.featured__heading');
  const locName = section.querySelector('.featured__location-name');
  const lede = section.querySelector('.featured__lede');
  const cta = section.querySelector('.featured__cta');
  const moreLink = section.querySelector('.featured__more');
  if (!main || !heading || !lede || !cta) return;

  const thumbs = Array.from(section.querySelectorAll('.featured__thumb'));
  if (!thumbs.length) return;

  const allPhotos = (data && data.photos) || [];
  const locationMap = buildLocationMap(data || { locations: [] });
  const categoryMap = new Map(((data && data.categories) || []).map((c) => [c.id, c]));
  const featured = allPhotos
    .map((p, idx) => ({ p, idx }))
    .filter(({ p }) => p.featured)
    .reverse()
    .map(({ p, idx }) => {
      const m = p.metadata || {};
      return {
        href: `gallery.html#p/${allPhotos.length - idx}`,
        title: p.title || '',
        description: p.description || '',
        locFull: (locationMap.get(p.location) && locationMap.get(p.location).name)
          || getLocationLabel(p, locationMap) || '',
        src: imgSrc(p.src),
        webpCover: coverWebp(p.src),
        webpHero: heroWebp(p.src),
        width: String(p.width || ''),
        height: String(p.height || ''),
        camera: m.camera || '',
        focal: m.focalLength || '',
        aperture: m.aperture || '',
        shutter: m.shutterSpeed || '',
        iso: m.iso != null ? String(m.iso) : '',
        tags: (p.categories || []).map((id) => (categoryMap.get(id) || {}).name || id).filter(Boolean),
      };
    });

  if (!featured.length) return;

  const PAGE_SIZE = thumbs.length;
  let startIndex = 0;

  function photoAt(slot) {
    return featured[(startIndex + slot) % featured.length];
  }

  function paintThumb(thumb, p) {
    const picture = thumb.querySelector('picture');
    const source = picture && picture.querySelector('source[type="image/webp"]');
    const img = picture && picture.querySelector('img');
    if (source) source.srcset = p.webpCover;
    if (img) {
      img.src = p.src;
      img.alt = p.title;
      if (p.width) img.width = parseInt(p.width, 10) || img.width;
      if (p.height) img.height = parseInt(p.height, 10) || img.height;
    }
    thumb.href = p.href;
    thumb.setAttribute('aria-label', `Show ${p.title} in featured frame`);
    Object.assign(thumb.dataset, {
      href: p.href,
      title: p.title,
      description: p.description,
      locFull: p.locFull,
      src: p.src,
      webpCover: p.webpCover,
      webpHero: p.webpHero,
      width: p.width,
      height: p.height,
    });
  }

  function paintMain(p) {
    const picture = main.querySelector('picture');
    const source = picture && picture.querySelector('source[type="image/webp"]');
    const img = picture && picture.querySelector('img');
    if (source) source.srcset = p.webpHero || p.webpCover;
    if (img) {
      img.src = p.src;
      img.alt = p.title;
      if (p.width) img.width = parseInt(p.width, 10) || img.width;
      if (p.height) img.height = parseInt(p.height, 10) || img.height;
    }
    main.href = p.href;
    main.setAttribute('aria-label', `View ${p.title}`);
    heading.textContent = p.title;
    if (locName) locName.textContent = p.locFull;
    lede.textContent = p.description;
    cta.href = p.href;
    main.dataset.src = p.src;
    main.dataset.href = p.href;
  }

  function syncActiveStates() {
    const currentSrc = main.dataset.src || '';
    thumbs.forEach((t) => {
      const active = !!currentSrc && t.dataset.src === currentSrc;
      t.classList.toggle('is-active', active);
      if (active) t.setAttribute('aria-current', 'true');
      else t.removeAttribute('aria-current');
    });
  }

  function readThumb(thumb) {
    return {
      href: thumb.dataset.href || '',
      title: thumb.dataset.title || '',
      description: thumb.dataset.description || '',
      locFull: thumb.dataset.locFull || '',
      src: thumb.dataset.src || '',
      webpCover: thumb.dataset.webpCover || '',
      webpHero: thumb.dataset.webpHero || '',
      width: thumb.dataset.width || '',
      height: thumb.dataset.height || '',
    };
  }

  function selectThumb(thumb) {
    if (thumb.classList.contains('is-active')) return;
    main.classList.add('is-swapping');
    requestAnimationFrame(() => {
      paintMain(readThumb(thumb));
      syncActiveStates();
      requestAnimationFrame(() => {
        main.classList.remove('is-swapping');
      });
    });
  }

  const thumbsWrap = section.querySelector('.featured__thumbs');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paginating = false;

  function advancePage() {
    if (paginating) return;
    if (!thumbsWrap || reduceMotion.matches) {
      startIndex = (startIndex + PAGE_SIZE) % featured.length;
      thumbs.forEach((thumb, i) => paintThumb(thumb, photoAt(i)));
      syncActiveStates();
      return;
    }

    paginating = true;
    thumbsWrap.classList.add('is-paginating-out');

    setTimeout(() => {
      startIndex = (startIndex + PAGE_SIZE) % featured.length;
      thumbs.forEach((thumb, i) => paintThumb(thumb, photoAt(i)));
      syncActiveStates();

      thumbsWrap.classList.remove('is-paginating-out');
      thumbsWrap.classList.add('is-paginating-in');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          thumbsWrap.classList.remove('is-paginating-in');
          setTimeout(() => { paginating = false; }, 320);
        });
      });
    }, 280);
  }

  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', (e) => {
      e.preventDefault();
      selectThumb(thumb);
    });
    thumb.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectThumb(thumb);
      }
    });
  });

  if (moreLink && featured.length > PAGE_SIZE) {
    moreLink.addEventListener('click', (e) => {
      e.preventDefault();
      advancePage();
    });
  }

  syncActiveStates();

  // Featured lightbox — create element via JS (no hardcoded HTML needed) and open as overlay
  const lbEl = createLightboxEl({ id: 'featured-lightbox', label: 'Featured photo viewer' });
  {
    const lb = initDataLightbox(lbEl, featured);

    function openAtCurrent(e) {
      e.preventDefault();
      const currentSrc = main.dataset.src || (featured[0] && featured[0].src) || '';
      const idx = featured.findIndex((f) => f.src === currentSrc);
      lb.open(idx >= 0 ? idx : 0);
    }

    main.addEventListener('click', openAtCurrent);
    cta.addEventListener('click', openAtCurrent);
  }
}
