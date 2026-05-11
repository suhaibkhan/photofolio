import '../../css/style.css';
import { imgSrc, coverWebp, buildLocationMap } from './shared.js';
import { createLightboxEl, initLightbox } from './lightbox.js';

function stripPhotoFromHash(h) {
  const i = h.indexOf('/p/');
  if (i >= 0) return h.slice(0, i);
  if (h.indexOf('p/') === 0) return '';
  return h;
}

function extractPhotoIndex(h) {
  const i = h.indexOf('/p/');
  let raw;
  if (i >= 0) raw = h.slice(i + 3);
  else if (h.indexOf('p/') === 0) raw = h.slice(2);
  else return null;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n >= 1 ? n : null;
}

function urlForHash(hash) {
  return hash
    ? `${window.location.pathname}${window.location.search}#${hash}`
    : `${window.location.pathname}${window.location.search}`;
}

// ============================
// GALLERY (filters + grid + sticky bar)
// ============================
export function initGalleryPage(data) {
  const intro = document.getElementById('gallery-intro');
  const kickerEl = document.getElementById('gallery-kicker');
  const titleEl = document.getElementById('gallery-title');
  const ledeEl = document.getElementById('gallery-lede');
  const countEl = document.getElementById('gallery-count');
  const countLabelEl = document.getElementById('gallery-count-label');
  const modeEl = document.getElementById('gallery-mode');
  const pillsEl = document.getElementById('gallery-pills');
  const bar = document.getElementById('gallery-bar');
  const grid = document.querySelector('.masonry-grid');
  if (!intro || !modeEl || !pillsEl || !grid) return;

  const locations = data.locations || [];
  const categories = data.categories || [];

  function parseHash() {
    const h = window.location.hash.replace('#', '');
    const photoIndex = extractPhotoIndex(h);
    const base = stripPhotoFromHash(h);
    if (!base) return { mode: 'all', id: null, photoIndex };
    if (base.indexOf('loc-') === 0) return { mode: 'location', id: base.slice(4), photoIndex };
    return { mode: 'category', id: base, photoIndex };
  }

  function filterKeyOf(f) { return `${f.mode}:${f.id || ''}`; }
  let lastFilterKey = filterKeyOf(parseHash());

  // Track which pill set the user is browsing (independent of active filter)
  let browseMode = (() => {
    const f = parseHash();
    return f.mode === 'category' ? 'categories' : 'locations';
  })();

  // ---- Mode toggle ("By Place" / "By Theme") ----
  function buildMode() {
    modeEl.innerHTML = '';
    [
      { key: 'locations', label: 'By Place' },
      { key: 'categories', label: 'By Theme' },
    ].forEach(({ key, label }) => {
      const btn = document.createElement('button');
      btn.className = `gallery-bar__mode-btn${browseMode === key ? ' is-active' : ''}`;
      btn.dataset.mode = key;
      btn.textContent = label;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', String(browseMode === key));
      btn.addEventListener('click', () => {
        if (browseMode === key) return;
        browseMode = key;
        buildMode();
        buildPills();
      });
      modeEl.appendChild(btn);
    });
  }

  // ---- Pills row ----
  function buildPills() {
    pillsEl.innerHTML = '';
    const items = browseMode === 'locations' ? locations : categories;
    const prefix = browseMode === 'locations' ? 'loc-' : '';

    const allBtn = document.createElement('button');
    allBtn.className = 'gallery-bar__pill gallery-bar__pill--all';
    allBtn.textContent = 'All';
    allBtn.dataset.hash = '';
    pillsEl.appendChild(allBtn);

    items.forEach((item) => {
      const btn = document.createElement('button');
      btn.className = 'gallery-bar__pill';
      btn.textContent = item.shortName || item.name;
      btn.dataset.hash = prefix + item.id;
      pillsEl.appendChild(btn);
    });

    pillsEl.querySelectorAll('.gallery-bar__pill').forEach((b) => {
      b.addEventListener('click', () => applyFilter(b.dataset.hash));
    });
    syncActivePill();
  }

  function syncActivePill() {
    const f = parseHash();
    const targetHash = f.mode === 'all' ? '' : (f.mode === 'location' ? 'loc-' : '') + f.id;
    pillsEl.querySelectorAll('.gallery-bar__pill').forEach((b) => {
      const isActive = b.dataset.hash === targetHash;
      b.classList.toggle('is-active', isActive);
      if (isActive) {
        // Bring active pill into view if pills overflow
        b.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' });
      }
    });
  }

  // ---- Intro text ----
  function setIntro(filter) {
    if (filter.mode === 'all') {
      kickerEl.textContent = 'The Collection';
      titleEl.textContent = 'Gallery';
      ledeEl.textContent = 'A wandering collection of frames, gathered across continents.';
    } else if (filter.mode === 'location') {
      const loc = locations.find((l) => l.id === filter.id);
      const idx = Math.max(0, locations.findIndex((l) => l.id === filter.id));
      const total = locations.length;
      kickerEl.textContent = `Place · N° ${String(idx + 1).padStart(2, '0')} of ${String(total).padStart(2, '0')}`;
      titleEl.textContent = loc ? (loc.shortName || loc.name) : filter.id;
      ledeEl.textContent = loc ? loc.description : '';
    } else {
      const cat = categories.find((c) => c.id === filter.id);
      const idx = Math.max(0, categories.findIndex((c) => c.id === filter.id));
      const total = categories.length;
      kickerEl.textContent = `Theme · N° ${String(idx + 1).padStart(2, '0')} of ${String(total).padStart(2, '0')}`;
      titleEl.textContent = cat ? cat.name : filter.id;
      ledeEl.textContent = cat ? cat.description : '';
    }
  }

  // ---- Render gallery + counter ----
  function renderGrid(filter) {
    let photos;
    if (filter.mode === 'location') {
      photos = data.photos.filter((p) => p.location === filter.id);
    } else if (filter.mode === 'category') {
      photos = data.photos.filter((p) => (p.categories || []).indexOf(filter.id) !== -1);
    } else {
      photos = data.photos.slice();
    }
    photos.reverse();

    countEl.textContent = String(photos.length).padStart(2, '0');
    countLabelEl.textContent = photos.length === 1 ? 'Photograph' : 'Photographs';

    grid.innerHTML = '';
    if (grid.__imgObserver) {
      grid.__imgObserver.disconnect();
      grid.__imgObserver = null;
    }
    const locationMap = buildLocationMap(data);
    const categoryMap = new Map((data.categories || []).map((c) => [c.id, c]));

    const supportsIO = 'IntersectionObserver' in window;
    const loadImg = (img) => {
      if (img.dataset.webp) {
        const source = img.previousElementSibling;
        if (source && source.tagName === 'SOURCE') {
          source.srcset = img.dataset.webp;
        }
        delete img.dataset.webp;
      }
      if (img.dataset.src) {
        img.src = img.dataset.src;
        delete img.dataset.src;
      }
    };
    const imgObserver = supportsIO
      ? new IntersectionObserver((entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadImg(entry.target);
              obs.unobserve(entry.target);
            }
          });
        }, { rootMargin: '300px 0px', threshold: 0.01 })
      : null;
    if (imgObserver) grid.__imgObserver = imgObserver;

    photos.forEach((photo, i) => {
      const figure = document.createElement('figure');
      figure.className = 'gallery-item is-loading';

      const picture = document.createElement('picture');
      const webpSource = document.createElement('source');
      webpSource.type = 'image/webp';
      picture.appendChild(webpSource);

      const img = document.createElement('img');
      const fullSrc = imgSrc(photo.src);
      const webpSrc = coverWebp(photo.src);
      img.sizes = '(max-width: 480px) 100vw, (max-width: 1024px) 50vw, 33vw';
      img.alt = photo.title;
      img.width = photo.width;
      img.height = photo.height;
      img.decoding = 'async';
      const clearPlaceholder = () => figure.classList.remove('is-loading');
      img.addEventListener('load', clearPlaceholder, { once: true });
      img.addEventListener('error', clearPlaceholder, { once: true });
      if (i < 6) {
        // Prioritise the first batch so above-the-fold paints fast.
        webpSource.srcset = webpSrc;
        img.src = fullSrc;
        img.fetchPriority = 'high';
      } else if (imgObserver) {
        img.dataset.webp = webpSrc;
        img.dataset.src = fullSrc;
        imgObserver.observe(img);
      } else {
        webpSource.srcset = webpSrc;
        img.loading = 'lazy';
        img.src = fullSrc;
      }
      img.dataset.full = fullSrc;
      img.dataset.title = photo.title || '';
      img.dataset.description = photo.description || '';

      const locFull = locationMap.get(photo.location);
      img.dataset.location = locFull ? (locFull.name || locFull.shortName || '') : (photo.location || '');

      const tagNames = (photo.categories || [])
        .map((id) => (categoryMap.get(id)?.name) || id)
        .filter(Boolean);
      img.dataset.tags = tagNames.join('|');

      const m = photo.metadata || {};
      img.dataset.camera = m.camera || '';
      img.dataset.iso = m.iso != null ? String(m.iso) : '';
      img.dataset.aperture = m.aperture || '';
      img.dataset.shutter = m.shutterSpeed || '';
      img.dataset.focal = m.focalLength || '';

      const caption = document.createElement('figcaption');
      caption.textContent = photo.title;

      picture.appendChild(img);
      figure.appendChild(picture);
      figure.appendChild(caption);
      grid.appendChild(figure);
    });

    initLightbox({ stripPhotoFromHash, extractPhotoIndex, urlForHash });

    if (filter.photoIndex != null) {
      const lb = document.getElementById('lightbox');
      lb?.__openByIndex?.(filter.photoIndex - 1, true);
    }
  }

  // ---- Apply filter (preserves scroll) ----
  function applyFilter(hashVal) {
    history.replaceState(null, '', urlForHash(hashVal));

    const filter = parseHash();
    lastFilterKey = filterKeyOf(filter);
    // Sync browse mode to active filter (so pills row shows the right set)
    if (filter.mode === 'category' && browseMode !== 'categories') {
      browseMode = 'categories';
      buildMode();
      buildPills();
    } else if (filter.mode === 'location' && browseMode !== 'locations') {
      browseMode = 'locations';
      buildMode();
      buildPills();
    }

    setIntro(filter);
    renderGrid(filter);
    syncActivePill();
  }

  // Sticky-state observer: toggles `is-stuck` on the bar when intro scrolls away
  if (bar && intro && 'IntersectionObserver' in window) {
    const sentinel = document.createElement('div');
    sentinel.className = 'gallery-bar__sentinel';
    sentinel.setAttribute('aria-hidden', 'true');
    intro.after(sentinel);
    const io = new IntersectionObserver(([entry]) => {
      bar.classList.toggle('is-stuck', !entry.isIntersecting);
    }, { rootMargin: '-81px 0px 0px 0px', threshold: 0 });
    io.observe(sentinel);
  }

  // Create the lightbox element once (JS-generated, no HTML needed)
  createLightboxEl({ id: 'lightbox', label: 'Photo viewer' });

  // Initial render — preserves any /p/N suffix in the current URL
  buildMode();
  buildPills();
  {
    const initial = parseHash();
    lastFilterKey = filterKeyOf(initial);
    setIntro(initial);
    renderGrid(initial);
    syncActivePill();
  }

  // Back/forward navigation
  window.addEventListener('hashchange', () => {
    const f = parseHash();
    const key = filterKeyOf(f);
    if (key !== lastFilterKey) {
      lastFilterKey = key;
      if (f.mode === 'category' && browseMode !== 'categories') {
        browseMode = 'categories';
        buildMode();
        buildPills();
      } else if (f.mode === 'location' && browseMode !== 'locations') {
        browseMode = 'locations';
        buildMode();
        buildPills();
      }
      setIntro(f);
      renderGrid(f);
      syncActivePill();
      return;
    }
    // Filter unchanged — only the photo part of the hash moved (back/forward).
    const lb = document.getElementById('lightbox');
    if (f.photoIndex != null) {
      lb?.__openByIndex?.(f.photoIndex - 1, true);
    } else {
      lb?.__closeFromUrl?.();
    }
  });
}

// Backwards-compatible exports — gallery page now uses initGalleryPage
export function initGalleryFilters(data) {
  initGalleryPage(data);
}

export function initGallery(_data) {
  // no-op: handled by initGalleryPage
}

