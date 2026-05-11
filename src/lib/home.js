import '../../css/critical.css';
import { imgSrc, coverWebp, heroWebp, buildLocationMap, getLocationLabel } from './shared.js';

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

  const prerendered = container.querySelectorAll('.hero__slide').length > 0;
  const startIndex = prerendered ? 1 : 0;

  for (let i = startIndex; i < photos.length; i += 1) {
    const photo = photos[i];
    const slide = document.createElement('div');
    const kbClass = `kb-${(i % kbCount) + 1}`;
    slide.className = `hero__slide ${kbClass}${i === 0 ? ' active' : ''}`;

    const picture = document.createElement('picture');
    const webpSource = document.createElement('source');
    webpSource.type = 'image/webp';
    picture.appendChild(webpSource);

    const img = document.createElement('img');
    img.alt = photo.title;
    img.width = photo.width;
    img.height = photo.height;
    img.decoding = 'async';

    // Slide 0 (non-prerendered case) loads immediately; the rest defer until the
    // sequential preload chain or `advance()` reaches them.
    if (i === 0) {
      img.fetchPriority = 'high';
      webpSource.srcset = heroWebp(photo.src);
      img.src = imgSrc(photo.src);
    } else {
      webpSource.dataset.srcset = heroWebp(photo.src);
      img.dataset.src = imgSrc(photo.src);
    }

    picture.appendChild(img);
    slide.appendChild(picture);
    container.appendChild(slide);
  }

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

  if (!prerendered) {
    updateUI(0);
  } else {
    // Hero title/location already rendered with `.visible`; start the progress bar.
    if (progressBar) {
      progressBar.classList.remove('animating');
      progressBar.offsetHeight;
      progressBar.classList.add('animating');
    }
  }

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

  function ensureLoading(index) {
    const slide = slides[index];
    if (!slide) return;
    const source = slide.querySelector('source[type="image/webp"]');
    if (source && source.dataset.srcset) {
      source.srcset = source.dataset.srcset;
      delete source.dataset.srcset;
    }
    const img = slide.querySelector('img');
    if (img && img.dataset.src) {
      img.src = img.dataset.src;
      delete img.dataset.src;
    }
  }

  function whenImageReady(img) {
    if (!img || (img.complete && img.naturalWidth > 0)) return Promise.resolve();
    return new Promise((resolve) => {
      const done = () => resolve();
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
      // Hard cap so a stalled fetch can't freeze the slideshow forever.
      setTimeout(done, SLIDE_DURATION);
    });
  }

  // Load slides one at a time, in order — each fetch waits for the previous
  // to finish so the active slide isn't starved of bandwidth.
  async function preloadChain() {
    for (let i = 1; i < slides.length; i += 1) {
      ensureLoading(i);
      const img = slides[i].querySelector('img');
      await whenImageReady(img);
    }
  }

  function advance(dir) {
    const nextIndex = (current + dir + slides.length) % slides.length;
    ensureLoading(nextIndex);
    const img = slides[nextIndex].querySelector('img');
    const needsWait = !(img && img.complete && img.naturalWidth > 0);
    if (needsWait && progressBar) progressBar.classList.add('paused');
    return whenImageReady(img).then(() => {
      if (needsWait && progressBar && isPlaying) progressBar.classList.remove('paused');
      slides[current].classList.remove('active');
      current = nextIndex;
      restartKenBurns(slides[current]);
      slides[current].classList.add('active');
      updateUI(current);
    });
  }

  // Schedule next slide after `delay` ms, then resume normal SLIDE_DURATION cycle.
  function scheduleNext(delay) {
    clearTimeout(timer);
    segmentStartTime = Date.now();
    timer = setTimeout(async () => {
      await advance(1);
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
      advance(-1).then(() => {
        if (isPlaying) {
          startTimer();
        } else if (progressBar) {
          progressBar.classList.add('paused');
        }
      });
    });
  }

  if (ctrlNext) {
    ctrlNext.addEventListener('click', () => {
      stopTimer();
      advance(1).then(() => {
        if (isPlaying) {
          startTimer();
        } else if (progressBar) {
          progressBar.classList.add('paused');
        }
      });
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

  // Start sequential preload of slides 1..N once the active slide is on screen,
  // so the LCP image doesn't share bandwidth with the rest.
  whenImageReady(slides[0].querySelector('img')).then(() => preloadChain());

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
// 4b. FEATURED FRAME — thumb-to-main swap
// ============================
export function initFeatured() {
  const section = document.getElementById('featured');
  if (!section) return;

  const main = section.querySelector('.featured__main');
  const heading = section.querySelector('.featured__heading');
  const locName = section.querySelector('.featured__location-name');
  const lede = section.querySelector('.featured__lede');
  const cta = section.querySelector('.featured__cta');
  if (!main || !heading || !lede || !cta) return;

  const SWAP_KEYS = ['href', 'title', 'description', 'locTag', 'locFull', 'src', 'webpCover', 'webpHero', 'width', 'height'];

  function readPhoto(el) {
    return {
      href: el.dataset.href || '',
      title: el.dataset.title || '',
      description: el.dataset.description || '',
      locTag: el.dataset.locTag || '',
      locFull: el.dataset.locFull || '',
      src: el.dataset.src || '',
      webpCover: el.dataset.webpCover || '',
      webpHero: el.dataset.webpHero || '',
      width: el.dataset.width || '',
      height: el.dataset.height || '',
    };
  }

  function writePhotoData(el, p) {
    SWAP_KEYS.forEach((k) => { el.dataset[k] = p[k] || ''; });
    if (el.matches('.featured__thumb')) {
      el.setAttribute('aria-label', `Show ${p.title} in featured frame`);
    }
  }

  function paintImage(container, p, webpSrc) {
    const picture = container.querySelector('picture');
    const source = picture?.querySelector('source[type="image/webp"]');
    const img = picture?.querySelector('img');
    if (source) source.srcset = webpSrc;
    if (img) {
      img.src = p.src;
      img.alt = p.title;
      if (p.width) img.width = parseInt(p.width, 10) || img.width;
      if (p.height) img.height = parseInt(p.height, 10) || img.height;
    }
  }

  function paintMain(p) {
    paintImage(main, p, p.webpHero || p.webpCover);
    main.href = p.href;
    main.setAttribute('aria-label', `View ${p.title}`);
    const tag = main.querySelector('.featured__main-tag');
    if (tag) tag.textContent = p.locTag;
    heading.textContent = p.title;
    if (locName) locName.textContent = p.locFull;
    lede.textContent = p.description;
    cta.href = p.href;
  }

  function swap(thumb) {
    const fromThumb = readPhoto(thumb);
    const fromMain = readPhoto(main);

    // Cross-fade the main image while keeping the thumb crisp.
    main.classList.add('is-swapping');

    // Thumb takes the main's previous photo immediately (cover-sized webp).
    paintImage(thumb, fromMain, fromMain.webpCover || fromMain.webpHero);
    thumb.href = fromMain.href;
    writePhotoData(thumb, fromMain);

    // Main rebinds to the thumb's photo on the next frame so the fade reads.
    requestAnimationFrame(() => {
      paintMain(fromThumb);
      writePhotoData(main, fromThumb);
      requestAnimationFrame(() => {
        main.classList.remove('is-swapping');
      });
    });
  }

  section.querySelectorAll('.featured__thumb').forEach((thumb) => {
    if (thumb.classList.contains('featured__thumb--more')) return;
    thumb.addEventListener('click', (e) => {
      e.preventDefault();
      swap(thumb);
    });
    thumb.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        swap(thumb);
      }
    });
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

  if (track.children.length > 0) {
    Array.from(track.children).forEach((el) => plates.push(el));
  } else {
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

      const picture = document.createElement('picture');
      const webpSource = document.createElement('source');
      webpSource.type = 'image/webp';
      webpSource.srcset = coverWebp(photo.src);
      picture.appendChild(webpSource);

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
      picture.appendChild(img);
      plate.appendChild(picture);

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
  }

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

  if (grid.children.length === 0) {
    entries.forEach((entry, i) => {
      const slot = ATLAS_SLOTS[i] || `extra${i}`;
      const isHero = slot === 'hero';

      const tile = document.createElement('a');
      tile.href = `gallery.html#loc-${entry.loc.id}`;
      tile.className = 'atlas-tile';
      tile.dataset.tile = slot;

      const picture = document.createElement('picture');
      const webpSource = document.createElement('source');
      webpSource.type = 'image/webp';
      webpSource.srcset = coverWebp(entry.photo.src);
      picture.appendChild(webpSource);

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
      picture.appendChild(img);
      tile.appendChild(picture);

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
  }

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
