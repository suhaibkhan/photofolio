import '../../css/style.css';
import data from '../../data/photos-local.json';

export { data };

// ============================
// 1. IMAGE HELPERS
// ============================
export function imgSrc(base) {
  return base;
}

function buildLocationMap(data) {
  return new Map((data.locations || []).map((loc) => [loc.id, loc]));
}

// Hash helpers — `#filter/p/<1-based-index>` opens the lightbox.
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

function getLocationLabel(photo, locationMap) {
  const location = locationMap.get(photo.location);
  if (!location) return photo.location || '';
  return location.shortName || location.name || location.id;
}

// ============================
// 2. MOBILE MENU
// ============================
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

// ============================
// 3. HEADER SCROLL
// ============================
export function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 100);
  }, { passive: true });
}

// ============================
// 4. HERO SLIDESHOW
// ============================
export function initHeroSlideshow(data) {
  const container = document.querySelector('.hero__slides');
  if (!container) return;
  const locationMap = buildLocationMap(data);

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  let photos = data.photos.filter((p) => (isMobile ? p.mobileHero : p.hero));

  if (photos.length === 0) {
    photos = data.photos.filter((p) => p.hero);
  }
  if (photos.length === 0) return;

  const locationName = document.querySelector('.hero__location-name');
  const heroTitle = document.querySelector('.hero__title');
  const progressBar = document.querySelector('.hero__progress-bar');
  const kbCount = 5;

  function getLocation(photo) {
    return getLocationLabel(photo, locationMap);
  }

  photos.forEach((photo, i) => {
    const slide = document.createElement('div');
    const kbClass = `kb-${(i % kbCount) + 1}`;
    slide.className = `hero__slide ${kbClass}${i === 0 ? ' active' : ''}`;

    const img = document.createElement('img');
    img.src = imgSrc(photo.src);
    img.alt = photo.title;
    img.width = photo.width;
    img.height = photo.height;
    if (i === 0) img.fetchPriority = 'high';
    else img.loading = 'lazy';
    img.decoding = 'async';

    slide.appendChild(img);
    container.appendChild(slide);
  });

  function updateUI(index) {
    if (heroTitle) {
      heroTitle.classList.remove('visible');
      setTimeout(() => {
        heroTitle.textContent = photos[index].title;
        heroTitle.classList.add('visible');
      }, 300);
    }
    if (locationName) {
      locationName.classList.remove('visible');
      setTimeout(() => {
        locationName.textContent = getLocation(photos[index]);
        locationName.classList.add('visible');
      }, 400);
    }
    if (progressBar) {
      progressBar.classList.remove('animating');
      progressBar.offsetHeight;
      progressBar.classList.add('animating');
    }
  }

  updateUI(0);

  if (photos.length <= 1) return;

  let current = 0;
  const slides = container.querySelectorAll('.hero__slide');
  let timer = null;
  let isPlaying = true;
  const SLIDE_DURATION = 8000;
  let remainingTime = SLIDE_DURATION;
  let segmentStartTime = null;

  function restartKenBurns(slide) {
    let kbClass = '';
    slide.classList.forEach((c) => {
      if (c.indexOf('kb-') === 0) kbClass = c;
    });
    if (kbClass) {
      slide.classList.remove(kbClass);
      void slide.offsetWidth;
      slide.classList.add(kbClass);
    }
  }

  function nextSlide() {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    restartKenBurns(slides[current]);
    slides[current].classList.add('active');
    updateUI(current);
  }

  function prevSlide() {
    slides[current].classList.remove('active');
    current = (current - 1 + slides.length) % slides.length;
    restartKenBurns(slides[current]);
    slides[current].classList.add('active');
    updateUI(current);
  }

  // Schedule next slide after `delay` ms, then resume normal SLIDE_DURATION cycle.
  function scheduleNext(delay) {
    clearTimeout(timer);
    segmentStartTime = Date.now();
    timer = setTimeout(() => {
      nextSlide();
      remainingTime = SLIDE_DURATION;
      if (isPlaying) scheduleNext(SLIDE_DURATION);
    }, delay);
  }

  function startTimer() {
    remainingTime = SLIDE_DURATION;
    scheduleNext(SLIDE_DURATION);
  }

  // Capture how much time is left in the current slide interval.
  function stopTimer() {
    clearTimeout(timer);
    timer = null;
    if (segmentStartTime !== null) {
      remainingTime = Math.max(0, remainingTime - (Date.now() - segmentStartTime));
      segmentStartTime = null;
    }
  }

  // Resume from the exact point where the timer was stopped.
  function resumeTimer() {
    scheduleNext(remainingTime);
  }

  const ctrlPrev = document.querySelector('.hero__ctrl--prev');
  const ctrlPlay = document.querySelector('.hero__ctrl--play');
  const ctrlNext = document.querySelector('.hero__ctrl--next');

  if (ctrlPrev) {
    ctrlPrev.addEventListener('click', () => {
      stopTimer();
      prevSlide();
      if (isPlaying) {
        startTimer();
      } else if (progressBar) {
        progressBar.classList.add('paused');
      }
    });
  }

  if (ctrlNext) {
    ctrlNext.addEventListener('click', () => {
      stopTimer();
      nextSlide();
      if (isPlaying) {
        startTimer();
      } else if (progressBar) {
        progressBar.classList.add('paused');
      }
    });
  }

  if (ctrlPlay) {
    ctrlPlay.addEventListener('click', () => {
      if (isPlaying) {
        stopTimer();
        isPlaying = false;
        ctrlPlay.dataset.playing = 'false';
        ctrlPlay.setAttribute('aria-label', 'Play slideshow');
        if (progressBar) progressBar.classList.add('paused');
      } else {
        isPlaying = true;
        ctrlPlay.dataset.playing = 'true';
        ctrlPlay.setAttribute('aria-label', 'Pause slideshow');
        // Just lift the paused state — CSS animation continues from frozen position.
        if (progressBar) progressBar.classList.remove('paused');
        resumeTimer();
      }
    });
  }

  startTimer();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopTimer();
    } else {
      if (isPlaying) startTimer();
      updateUI(current);
    }
  });
}

// ============================
// 5. THEMES — Vol. I
// ============================
export function initThemesList(data) {
  const track = document.getElementById('categories-grid');
  if (!track) return;
  const stage = track.closest('.themes-stage');
  const rail = track.closest('.themes-rail');
  if (!stage || !rail) return;

  const prevBtn = stage.querySelector('.themes-nav--prev');
  const nextBtn = stage.querySelector('.themes-nav--next');
  const meterCurrent = stage.querySelector('.themes-meter__current');
  const meterTotal = stage.querySelector('.themes-meter__total');
  const meterProgress = stage.querySelector('.themes-meter__progress');

  const plates = [];

  data.categories.forEach((cat, i) => {
    const photo = (cat.cover && data.photos.find((p) => p.src === cat.cover))
              || data.photos.find((p) => p.categories.indexOf(cat.id) !== -1);
    if (!photo) return;

    const count = data.photos.filter((p) => p.categories.indexOf(cat.id) !== -1).length;

    const plate = document.createElement('a');
    plate.href = `gallery.html#${cat.id}`;
    plate.className = 'plate';
    plate.dataset.idx = i;
    plate.setAttribute('role', 'listitem');

    const img = document.createElement('img');
    img.className = 'plate__img';
    img.src = imgSrc(photo.src);
    img.sizes = '(max-width: 768px) 80vw, 36vw';
    img.alt = `${cat.name} photographs`;
    img.width = photo.width;
    img.height = photo.height;
    img.loading = i < 2 ? 'eager' : 'lazy';
    img.decoding = 'async';
    if (i === 0) img.fetchPriority = 'high';
    plate.appendChild(img);

    const veil = document.createElement('div');
    veil.className = 'plate__veil';
    veil.setAttribute('aria-hidden', 'true');
    plate.appendChild(veil);

    const caption = document.createElement('div');
    caption.className = 'plate__caption';

    const title = document.createElement('h3');
    title.className = 'plate__title';
    title.textContent = cat.name;

    const desc = document.createElement('p');
    desc.className = 'plate__desc';
    desc.textContent = cat.description;

    const meta = document.createElement('div');
    meta.className = 'plate__meta';

    const metaCount = document.createElement('span');
    metaCount.className = 'plate__meta-count';
    metaCount.textContent = `${count} ${count === 1 ? 'PHOTO' : 'PHOTOS'}`;

    const metaCta = document.createElement('span');
    metaCta.className = 'plate__meta-cta';
    metaCta.setAttribute('aria-label', `View ${cat.name} collection`);
    metaCta.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';

    meta.appendChild(metaCount);
    meta.appendChild(metaCta);

    caption.appendChild(title);
    caption.appendChild(desc);
    caption.appendChild(meta);

    plate.appendChild(caption);

    track.appendChild(plate);
    plates.push(plate);
  });

  if (!plates.length) return;

  function getPageSize() {
    return Math.max(1, track.clientWidth);
  }

  function getPageCount() {
    return Math.max(1, Math.ceil(track.scrollWidth / getPageSize()));
  }

  function getStep() {
    return getPageSize();
  }

  function updateMeter() {
    const max = Math.max(1, track.scrollWidth - track.clientWidth);
    const ratio = Math.min(1, Math.max(0, track.scrollLeft / max));
    if (meterProgress) meterProgress.style.transform = `scaleX(${ratio})`;

    const pages = getPageCount();
    if (meterTotal) meterTotal.textContent = String(pages).padStart(2, '0');

    const page = Math.round(ratio * (pages - 1));
    const clamped = Math.min(pages - 1, Math.max(0, page));
    if (meterCurrent) meterCurrent.textContent = String(clamped + 1).padStart(2, '0');

    const atStart = track.scrollLeft <= 2;
    const atEnd = track.scrollLeft >= max - 2;
    if (prevBtn) prevBtn.classList.toggle('is-disabled', atStart);
    if (nextBtn) nextBtn.classList.toggle('is-disabled', atEnd);
    if (prevBtn) prevBtn.disabled = atStart;
    if (nextBtn) nextBtn.disabled = atEnd;

    const overflow = track.scrollWidth > track.clientWidth + 4;
    stage.classList.toggle('has-overflow', overflow);
  }

  function scrollByDir(dir) {
    track.scrollBy({ left: dir * getStep(), behavior: 'smooth' });
  }

  if (prevBtn) prevBtn.addEventListener('click', () => scrollByDir(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => scrollByDir(1));

  // Hovering a plate clipped by the rail edge slides it into view —
  // delayed so the hover-grow plays first and the scroll math reads
  // the post-expansion bounds.
  const REVEAL_DELAY_MS = 380;
  function revealIntoView(plate) {
    const trackRect = track.getBoundingClientRect();
    const plateRect = plate.getBoundingClientRect();
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;

    const leftEdge = plateRect.left - trackRect.left + track.scrollLeft;
    const rightEdge = leftEdge + plateRect.width;

    // Detection buffer: still trigger reveal if the plate is sitting
    // under the rail's ~6% edge-fade mask.
    const detectBuffer = track.clientWidth * 0.06;

    let target = null;
    if (leftEdge < track.scrollLeft + detectBuffer) {
      target = plate.previousElementSibling
        ? leftEdge - gap
        : 0;
    } else if (rightEdge > track.scrollLeft + track.clientWidth - detectBuffer) {
      target = plate.nextElementSibling
        ? rightEdge + gap - track.clientWidth
        : track.scrollWidth - track.clientWidth;
    }

    if (target === null) return;

    track.scrollTo({ left: target, behavior: 'smooth' });
  }

  let revealTimer = null;
  function scheduleReveal(plate) {
    if (revealTimer) clearTimeout(revealTimer);
    revealTimer = setTimeout(() => {
      revealTimer = null;
      if (plate.matches(':hover') || plate.matches(':focus')) {
        revealIntoView(plate);
      }
    }, REVEAL_DELAY_MS);
  }
  function cancelReveal() {
    if (revealTimer) {
      clearTimeout(revealTimer);
      revealTimer = null;
    }
  }

  plates.forEach((plate) => {
    plate.addEventListener('mouseenter', () => scheduleReveal(plate));
    plate.addEventListener('mouseleave', cancelReveal);
    plate.addEventListener('focus', () => scheduleReveal(plate));
    plate.addEventListener('blur', cancelReveal);
  });

  let raf = null;
  track.addEventListener('scroll', () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      updateMeter();
    });
  }, { passive: true });

  window.addEventListener('resize', updateMeter);

  // Keyboard nav when track or its children are focused
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); scrollByDir(1); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); scrollByDir(-1); }
  });

  updateMeter();
}

// ============================
// 5b. ATLAS — Vol. II
// ============================
const ATLAS_SLOTS = ['hero', 'side1', 'side2', 'footL', 'footM', 'footR'];

export function initAtlas(data) {
  const grid = document.getElementById('locations-grid');
  if (!grid) return;

  const locations = data.locations || [];

  const entries = locations.map((loc) => {
    const photo = (loc.cover && data.photos.find((p) => p.src === loc.cover))
              || data.photos.find((p) => p.location === loc.id && p.hero)
              || data.photos.find((p) => p.location === loc.id);
    return { loc, photo };
  }).filter((x) => x.photo);

  entries.forEach((entry, i) => {
    const slot = ATLAS_SLOTS[i] || `extra${i}`;
    const isHero = slot === 'hero';

    const tile = document.createElement('a');
    tile.href = `gallery.html#loc-${entry.loc.id}`;
    tile.className = 'atlas-tile';
    tile.dataset.tile = slot;

    const img = document.createElement('img');
    img.src = imgSrc(entry.photo.src);
    img.sizes = isHero
      ? '(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 60vw'
      : '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 30vw';
    img.alt = `${entry.loc.name} — ${entry.photo.title}`;
    img.width = entry.photo.width;
    img.height = entry.photo.height;
    img.loading = i < 2 ? 'eager' : 'lazy';
    img.decoding = 'async';
    if (isHero) img.fetchPriority = 'high';
    tile.appendChild(img);

    const veil = document.createElement('div');
    veil.className = 'atlas-tile__veil';
    veil.setAttribute('aria-hidden', 'true');
    tile.appendChild(veil);

    const caption = document.createElement('div');
    caption.className = 'atlas-tile__caption';

    const capName = document.createElement('h3');
    capName.className = 'atlas-tile__name';
    capName.textContent = entry.loc.shortName || entry.loc.name;
    caption.appendChild(capName);

    if (entry.loc.description) {
      const capDesc = document.createElement('p');
      capDesc.className = 'atlas-tile__desc';
      capDesc.textContent = entry.loc.description;
      caption.appendChild(capDesc);
    }

    const photoCount = data.photos.filter((p) => p.location === entry.loc.id).length;

    const meta = document.createElement('div');
    meta.className = 'atlas-tile__meta';

    const metaCount = document.createElement('span');
    metaCount.className = 'atlas-tile__meta-count';
    metaCount.textContent = `${photoCount} ${photoCount === 1 ? 'PHOTO' : 'PHOTOS'}`;

    const metaCta = document.createElement('span');
    metaCta.className = 'atlas-tile__meta-cta';
    metaCta.setAttribute('aria-label', `View ${entry.loc.name}`);
    metaCta.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';

    meta.appendChild(metaCount);
    meta.appendChild(metaCta);
    caption.appendChild(meta);

    tile.appendChild(caption);
    grid.appendChild(tile);
  });

  const meter = grid.parentElement && grid.parentElement.querySelector('.atlas-meter');
  if (meter) {
    const meterCurrent = meter.querySelector('.atlas-meter__current');
    const meterTotal = meter.querySelector('.atlas-meter__total');
    const meterProgress = meter.querySelector('.atlas-meter__progress');

    function updateAtlasMeter() {
      const overflow = grid.scrollWidth - grid.clientWidth;
      if (overflow <= 4) {
        if (meterProgress) meterProgress.style.transform = 'scaleX(0)';
        return;
      }
      const ratio = Math.min(1, Math.max(0, grid.scrollLeft / overflow));
      if (meterProgress) meterProgress.style.transform = `scaleX(${ratio})`;

      const pages = Math.max(1, Math.ceil(grid.scrollWidth / Math.max(1, grid.clientWidth)));
      if (meterTotal) meterTotal.textContent = String(pages).padStart(2, '0');
      const page = Math.round(ratio * (pages - 1));
      if (meterCurrent) meterCurrent.textContent = String(Math.min(pages - 1, Math.max(0, page)) + 1).padStart(2, '0');
    }

    let raf = null;
    grid.addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        updateAtlasMeter();
      });
    }, { passive: true });
    window.addEventListener('resize', updateAtlasMeter);
    updateAtlasMeter();
  }
}

// ============================
// 7. GALLERY (filters + grid + sticky bar)
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
    const locationMap = buildLocationMap(data);
    const categoryMap = new Map((data.categories || []).map((c) => [c.id, c]));

    photos.forEach((photo) => {
      const figure = document.createElement('figure');
      figure.className = 'gallery-item';

      const img = document.createElement('img');
      img.src = imgSrc(photo.src);
      img.sizes = '(max-width: 480px) 100vw, (max-width: 1024px) 50vw, 33vw';
      img.alt = photo.title;
      img.width = photo.width;
      img.height = photo.height;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.dataset.full = imgSrc(photo.src);
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

      figure.appendChild(img);
      figure.appendChild(caption);
      grid.appendChild(figure);
    });

    initLightbox();

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

// ============================
// 8. LIGHTBOX — Editorial Plate
// ============================
export function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  if (lightbox.__rebindTriggers) {
    // Re-bind to fresh gallery items only — controls already wired.
    // Must call the original closure's binder so click handlers reach
    // the already-initialized lbImage / elTitle / etc.
    lightbox.__rebindTriggers();
    return;
  }

  const lbImage = lightbox.querySelector('.lightbox__image');
  const elTitle = lightbox.querySelector('.lightbox__title');
  const elDesc = lightbox.querySelector('.lightbox__description');
  const elLoc = lightbox.querySelector('.lightbox__location-text');
  const elTags = lightbox.querySelector('.lightbox__tags');
  const elCurrent = lightbox.querySelector('.lightbox__counter-current');
  const elTotal = lightbox.querySelector('.lightbox__counter-total');
  const elPlateNum = lightbox.querySelector('.lightbox__plate-num');
  const elPlateOf = lightbox.querySelector('.lightbox__plate-of');
  const specEls = {
    camera: lightbox.querySelector('.lightbox__spec[data-key="camera"]'),
    focal: lightbox.querySelector('.lightbox__spec[data-key="focal"]'),
    aperture: lightbox.querySelector('.lightbox__spec[data-key="aperture"]'),
    shutter: lightbox.querySelector('.lightbox__spec[data-key="shutter"]'),
    iso: lightbox.querySelector('.lightbox__spec[data-key="iso"]'),
  };
  const btnClose = lightbox.querySelector('.lightbox__close');
  const btnPrev = lightbox.querySelector('.lightbox__prev');
  const btnNext = lightbox.querySelector('.lightbox__next');
  const btnMax = lightbox.querySelector('.lightbox__maximize');
  const btnTheme = lightbox.querySelector('.lightbox__theme');

  let currentIndex = 0;
  let items = [];
  // True when *we* added a history entry for the open lightbox — controls whether
  // close should pop history (back) or quietly clean the URL.
  let pushedByUs = false;

  function urlWithPhoto(idx1OrNull) {
    const h = window.location.hash.replace('#', '');
    const base = stripPhotoFromHash(h);
    let newHash;
    if (idx1OrNull == null) newHash = base;
    else newHash = base ? `${base}/p/${idx1OrNull}` : `p/${idx1OrNull}`;
    return urlForHash(newHash);
  }

  function getItems() {
    return Array.from(document.querySelectorAll('.gallery-item img'));
  }

  function setSpec(key, value) {
    const el = specEls[key];
    if (!el) return;
    if (value && String(value).trim() !== '') {
      el.querySelector('dd').textContent = value;
      el.hidden = false;
    } else {
      el.hidden = true;
    }
  }

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function applyImage(img) {
    lbImage.src = img.dataset.full || img.src;
    lbImage.alt = img.alt || '';

    const title = img.dataset.title || img.alt || '';
    elTitle.textContent = title;

    const desc = img.dataset.description || '';
    elDesc.textContent = desc;
    elDesc.style.display = desc ? '' : 'none';

    const loc = img.dataset.location || '';
    elLoc.textContent = loc || '—';
    elLoc.parentElement.style.display = loc ? '' : 'none';

    setSpec('camera', img.dataset.camera);
    setSpec('focal', img.dataset.focal);
    setSpec('aperture', img.dataset.aperture);
    setSpec('shutter', img.dataset.shutter);
    setSpec('iso', img.dataset.iso);

    elTags.innerHTML = '';
    const tags = (img.dataset.tags || '').split('|').filter(Boolean);
    tags.forEach((tag) => {
      const li = document.createElement('li');
      li.textContent = tag;
      elTags.appendChild(li);
    });

    const total = items.length;
    if (elCurrent) elCurrent.textContent = pad(currentIndex + 1);
    if (elTotal) elTotal.textContent = pad(total);
    if (elPlateNum) elPlateNum.textContent = pad(currentIndex + 1);
    if (elPlateOf) elPlateOf.textContent = ` of ${pad(total)}`;
  }

  function transitionTo(index) {
    currentIndex = (index + items.length) % items.length;
    lightbox.classList.add('is-changing');
    setTimeout(() => {
      applyImage(items[currentIndex]);
      lightbox.classList.remove('is-changing');
    }, 180);
    history.replaceState(null, '', urlWithPhoto(currentIndex + 1));
  }

  function openLightbox(index, fromUrl = false) {
    items = getItems();
    if (!items.length) return;
    if (index < 0 || index >= items.length) return;
    const wasOpen = !lightbox.hidden;
    currentIndex = index;
    applyImage(items[currentIndex]);
    if (!wasOpen) {
      lightbox.hidden = false;
      lightbox.offsetHeight;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
      btnClose.focus({ preventScroll: true });
      if (!fromUrl) {
        // User-initiated open: push so the back button closes the lightbox.
        history.pushState(null, '', urlWithPhoto(index + 1));
        pushedByUs = true;
      }
    } else {
      // Already open — switching photos via __openByIndex.
      history.replaceState(null, '', urlWithPhoto(index + 1));
    }
  }

  function closeLightboxVisually() {
    lightbox.classList.remove('active');
    setTimeout(() => {
      lightbox.hidden = true;
      lbImage.src = '';
      lightbox.classList.remove('is-maximized');
      lightbox.classList.remove('is-dark');
      btnMax?.setAttribute('aria-pressed', 'false');
      btnTheme?.setAttribute('aria-pressed', 'false');
      btnTheme?.setAttribute('aria-label', 'Switch to dark background');
      document.body.style.overflow = '';
    }, 380);
  }

  function closeLightbox() {
    if (pushedByUs) {
      // Pop the entry we added; the resulting hashchange triggers __closeFromUrl.
      pushedByUs = false;
      history.back();
      return;
    }
    closeLightboxVisually();
    if (extractPhotoIndex(window.location.hash.replace('#', '')) != null) {
      history.replaceState(null, '', urlWithPhoto(null));
    }
  }

  lightbox.__openByIndex = (idx0, fromUrl) => openLightbox(idx0, !!fromUrl);
  lightbox.__closeFromUrl = () => {
    pushedByUs = false;
    if (!lightbox.hidden) closeLightboxVisually();
  };

  function navigate(direction) {
    transitionTo(currentIndex + direction);
  }

  function toggleMaximize(force) {
    const next = force != null ? force : !lightbox.classList.contains('is-maximized');
    lightbox.classList.toggle('is-maximized', next);
    btnMax?.setAttribute('aria-pressed', String(next));
  }

  function toggleTheme(force) {
    const next = force != null ? force : !lightbox.classList.contains('is-dark');
    lightbox.classList.toggle('is-dark', next);
    btnTheme?.setAttribute('aria-pressed', String(next));
    btnTheme?.setAttribute('aria-label', next ? 'Switch to light background' : 'Switch to dark background');
  }

  function bindGalleryTriggers(lb) {
    const triggers = getItems();
    triggers.forEach((img, i) => {
      const fig = img.closest('.gallery-item');
      if (!fig || fig.dataset.lbBound === '1') return;
      fig.dataset.lbBound = '1';
      fig.addEventListener('click', () => {
        items = getItems();
        const idx = items.indexOf(img);
        openLightbox(idx >= 0 ? idx : i);
      });
    });
  }

  bindGalleryTriggers(lightbox);
  lightbox.__rebindTriggers = () => bindGalleryTriggers(lightbox);

  btnClose.addEventListener('click', closeLightbox);
  btnPrev.addEventListener('click', () => navigate(-1));
  btnNext.addEventListener('click', () => navigate(1));
  btnMax?.addEventListener('click', () => toggleMaximize());
  btnTheme?.addEventListener('click', () => toggleTheme());

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') {
      if (lightbox.classList.contains('is-maximized')) {
        toggleMaximize(false);
      } else {
        closeLightbox();
      }
    }
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
    if (e.key === 'f' || e.key === 'F') toggleMaximize();
  });

  // Backdrop click — only when clicking the bare lightbox surface
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox__stage')) {
      closeLightbox();
    }
  });

  let touchStartX = 0;
  let touchStartY = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    const dy = e.changedTouches[0].screenY - touchStartY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      navigate(dx > 0 ? -1 : 1);
    }
  }, { passive: true });
}

// ============================
// 9. SCROLL REVEAL
// ============================
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
