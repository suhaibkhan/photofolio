import '../../css/themes-carousel.css';
import { imgSrc, coverWebp } from './paths.js';

export function initThemesCarousel(data) {
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
