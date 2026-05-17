import '../../css/hero-slideshow.css';
import { heroWebp, buildLocationMap, getLocationLabel } from './shared.js';

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
      img.src = photo.src;
    } else {
      webpSource.dataset.srcset = heroWebp(photo.src);
      img.dataset.src = photo.src;
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
      ensureLoading((current + 1) % slides.length);
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

  whenImageReady(slides[0].querySelector('img')).then(() => ensureLoading(1 % slides.length));

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
