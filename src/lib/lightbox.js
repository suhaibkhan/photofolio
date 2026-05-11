import '../../css/lightbox.css';

// ---------------------------------------------------------------------------
// Lightbox HTML template
// ---------------------------------------------------------------------------
const ARROW_LEFT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>`;
const ARROW_RIGHT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>`;
const ICON_CLOSE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>`;
const ICON_EXPAND = `<svg class="lightbox__icon lightbox__icon--expand" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 9 4 4 9 4"/><polyline points="20 9 20 4 15 4"/><polyline points="4 15 4 20 9 20"/><polyline points="20 15 20 20 15 20"/></svg>`;
const ICON_COLLAPSE = `<svg class="lightbox__icon lightbox__icon--collapse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 4 9 9 4 9"/><polyline points="15 4 15 9 20 9"/><polyline points="9 20 9 15 4 15"/><polyline points="15 20 15 15 20 15"/></svg>`;
const ICON_HALFCIRCLE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3 A9 9 0 0 1 12 21 Z" fill="currentColor" stroke="none"/></svg>`;
const ICON_LOCATION = `<svg class="lightbox__loc-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s-7-7.5-7-13a7 7 0 0 1 14 0c0 5.5-7 13-7 13z"/><circle cx="12" cy="9" r="2.5"/></svg>`;
const ARROW_CTA = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="13" height="13"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;

/**
 * Create and return a lightbox DOM element, appended to document.body.
 * @param {object} opts
 * @param {string}  opts.id          - Element id (default: 'lightbox')
 * @param {string}  opts.label       - aria-label (default: 'Photo viewer')
 * @param {boolean} opts.galleryLink - Include a "View in Gallery" link in the panel
 */
export function createLightboxEl({ id = 'lightbox', label = 'Photo viewer', galleryLink = false } = {}) {
  const galleryLinkHtml = galleryLink
    ? `<a href="gallery.html" class="lightbox__gallery-link" aria-label="View this photograph in the gallery">View in Gallery ${ARROW_CTA}</a>`
    : '';

  const el = document.createElement('div');
  el.className = 'lightbox';
  el.id = id;
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-label', label);
  el.hidden = true;
  el.innerHTML = `
    <div class="lightbox__topbar">
      <div class="lightbox__counter" aria-live="polite">
        <span class="lightbox__counter-current">01</span>
        <span class="lightbox__counter-sep">/</span>
        <span class="lightbox__counter-total">01</span>
      </div>
      <div class="lightbox__topbar-actions">
        <button class="lightbox__theme" aria-label="Toggle dark background" aria-pressed="false">
          <span class="lightbox__btn-icon">${ICON_HALFCIRCLE}</span>
          <span class="lightbox__btn-label lightbox__btn-label--light">Dark</span>
          <span class="lightbox__btn-label lightbox__btn-label--dark">Light</span>
        </button>
        <button class="lightbox__maximize" aria-label="Toggle full-bleed view" aria-pressed="false">
          <span class="lightbox__btn-icon">${ICON_EXPAND}${ICON_COLLAPSE}</span>
          <span class="lightbox__btn-label">View</span>
        </button>
        <button class="lightbox__close" aria-label="Close viewer">
          <span class="lightbox__btn-icon">${ICON_CLOSE}</span>
          <span class="lightbox__btn-label">Close</span>
        </button>
      </div>
    </div>

    <div class="lightbox__stage">
      <button class="lightbox__nav lightbox__prev" aria-label="Previous photo">
        <span>${ARROW_LEFT}</span>
      </button>

      <figure class="lightbox__frame">
        <div class="lightbox__image-wrap">
          <img class="lightbox__image" src="" alt="" />
        </div>

        <figcaption class="lightbox__panel" aria-label="Photograph details">
          <div class="lightbox__panel-inner">
            <div class="lightbox__plate">
              <span class="lightbox__plate-rule" aria-hidden="true"></span>
              <span class="lightbox__plate-text">Plate N\u00b0\u00a0<span class="lightbox__plate-num">01</span><span class="lightbox__plate-of"> of 01</span></span>
            </div>

            <h2 class="lightbox__title">Title</h2>
            <p class="lightbox__description">Description</p>

            <div class="lightbox__meta">
              <div class="lightbox__location">
                ${ICON_LOCATION}
                <span class="lightbox__location-text">\u2014</span>
              </div>

              <dl class="lightbox__specs">
                <div class="lightbox__spec" data-key="camera"><dt>Camera</dt><dd>\u2014</dd></div>
                <div class="lightbox__spec" data-key="focal"><dt>Focal</dt><dd>\u2014</dd></div>
                <div class="lightbox__spec" data-key="aperture"><dt>Aperture</dt><dd>\u2014</dd></div>
                <div class="lightbox__spec" data-key="shutter"><dt>Shutter</dt><dd>\u2014</dd></div>
                <div class="lightbox__spec" data-key="iso"><dt>ISO</dt><dd>\u2014</dd></div>
              </dl>

              <ul class="lightbox__tags" aria-label="Categories"></ul>

              ${galleryLinkHtml}
            </div>
          </div>
        </figcaption>
      </figure>

      <button class="lightbox__nav lightbox__next" aria-label="Next photo">
        <span>${ARROW_RIGHT}</span>
      </button>
    </div>

    <div class="lightbox__hints" aria-hidden="true">
      <span><kbd>\u2190</kbd><kbd>\u2192</kbd> Navigate</span>
      <span><kbd>F</kbd> Full-bleed</span>
      <span><kbd>Esc</kbd> Close</span>
    </div>
  `;

  document.body.appendChild(el);
  return el;
}

// ---------------------------------------------------------------------------
// Shared internal helpers
// ---------------------------------------------------------------------------
function pad(n) { return String(n).padStart(2, '0'); }

function wireSpinner(lbImageWrap, lbImage) {
  if (lbImageWrap && !lbImageWrap.querySelector('.lightbox__spinner')) {
    const s = document.createElement('div');
    s.className = 'lightbox__spinner';
    s.setAttribute('aria-hidden', 'true');
    lbImageWrap.appendChild(s);
  }
  let loadingTimer = null;
  function setLoading(on) {
    if (!lbImageWrap) return;
    if (on) {
      if (loadingTimer) return;
      loadingTimer = setTimeout(() => { lbImageWrap.classList.add('is-loading'); loadingTimer = null; }, 150);
    } else {
      if (loadingTimer) { clearTimeout(loadingTimer); loadingTimer = null; }
      lbImageWrap.classList.remove('is-loading');
    }
  }
  if (lbImage) {
    lbImage.addEventListener('load', () => setLoading(false));
    lbImage.addEventListener('error', () => setLoading(false));
  }
  return setLoading;
}

function makeToggleMaximize(el, btnMax) {
  return function toggleMaximize(force) {
    const next = force != null ? force : !el.classList.contains('is-maximized');
    el.classList.toggle('is-maximized', next);
    if (btnMax) btnMax.setAttribute('aria-pressed', String(next));
  };
}

function makeToggleTheme(el, btnTheme) {
  return function toggleTheme(force) {
    const next = force != null ? force : !el.classList.contains('is-dark');
    el.classList.toggle('is-dark', next);
    if (btnTheme) {
      btnTheme.setAttribute('aria-pressed', String(next));
      btnTheme.setAttribute('aria-label', next ? 'Switch to light background' : 'Switch to dark background');
    }
  };
}

function applyPanelData(el, item, currentIndex, totalCount, specEls) {
  const q = (s) => el.querySelector(s);
  const elTitle      = q('.lightbox__title');
  const elDesc       = q('.lightbox__description');
  const elLocWrap    = q('.lightbox__location');
  const elLoc        = q('.lightbox__location-text');
  const elTags       = q('.lightbox__tags');
  const elCurrent    = q('.lightbox__counter-current');
  const elTotal      = q('.lightbox__counter-total');
  const elPlateNum   = q('.lightbox__plate-num');
  const elPlateOf    = q('.lightbox__plate-of');
  const elGalleryLink = q('.lightbox__gallery-link');

  if (elTitle) elTitle.textContent = item.title || '';
  if (elDesc) { elDesc.textContent = item.description || ''; elDesc.style.display = item.description ? '' : 'none'; }
  const loc = item.locFull || '';
  if (elLoc) elLoc.textContent = loc || '\u2014';
  if (elLocWrap) elLocWrap.style.display = loc ? '' : 'none';

  ['camera', 'focal', 'aperture', 'shutter', 'iso'].forEach((key) => {
    const specEl = specEls[key];
    if (!specEl) return;
    const value = item[key];
    if (value && String(value).trim()) { specEl.querySelector('dd').textContent = value; specEl.hidden = false; }
    else specEl.hidden = true;
  });

  if (elTags) {
    elTags.innerHTML = '';
    (item.tags || []).forEach((tag) => { const li = document.createElement('li'); li.textContent = tag; elTags.appendChild(li); });
  }

  if (elCurrent) elCurrent.textContent = pad(currentIndex + 1);
  if (elTotal)   elTotal.textContent   = pad(totalCount);
  if (elPlateNum) elPlateNum.textContent = pad(currentIndex + 1);
  if (elPlateOf)  elPlateOf.textContent  = ` of ${pad(totalCount)}`;
  if (elGalleryLink) elGalleryLink.href  = item.href || 'gallery.html';
}

function wireBaseInteraction(el, closeFn, navigateFn, toggleMaximize, toggleTheme) {
  const q = (s) => el.querySelector(s);
  const btnClose = q('.lightbox__close');
  const btnPrev  = q('.lightbox__prev');
  const btnNext  = q('.lightbox__next');
  const btnMax   = q('.lightbox__maximize');
  const btnTheme = q('.lightbox__theme');

  if (btnClose) btnClose.addEventListener('click', closeFn);
  if (btnPrev)  btnPrev.addEventListener('click', () => navigateFn(-1));
  if (btnNext)  btnNext.addEventListener('click', () => navigateFn(1));
  if (btnMax)   btnMax.addEventListener('click', () => toggleMaximize());
  if (btnTheme) btnTheme.addEventListener('click', () => toggleTheme());

  document.addEventListener('keydown', (e) => {
    if (el.hidden) return;
    if (e.key === 'Escape') { if (el.classList.contains('is-maximized')) toggleMaximize(false); else closeFn(); }
    if (e.key === 'ArrowLeft')          navigateFn(-1);
    if (e.key === 'ArrowRight')         navigateFn(1);
    if (e.key === 'f' || e.key === 'F') toggleMaximize();
  });

  el.addEventListener('click', (e) => {
    if (e.target === el || e.target.classList.contains('lightbox__stage')) closeFn();
  });

  let touchStartX = 0, touchStartY = 0;
  el.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; touchStartY = e.changedTouches[0].screenY; }, { passive: true });
  el.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    const dy = e.changedTouches[0].screenY - touchStartY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) navigateFn(dx > 0 ? -1 : 1);
  }, { passive: true });
}

function getSpecEls(el) {
  return Object.fromEntries(
    ['camera', 'focal', 'aperture', 'shutter', 'iso'].map((k) => [k, el.querySelector(`.lightbox__spec[data-key="${k}"]`)]),
  );
}

// ---------------------------------------------------------------------------
// Data-driven lightbox — home page / featured section
// items: plain objects { src, title, description, locFull,
//        camera, focal, aperture, shutter, iso, tags[], href }
// ---------------------------------------------------------------------------
export function initDataLightbox(el, items) {
  if (!el || !items.length) return { open() {}, close() {} };

  const lbImage        = el.querySelector('.lightbox__image');
  const lbImageWrap    = el.querySelector('.lightbox__image-wrap');
  const btnClose       = el.querySelector('.lightbox__close');
  const btnMax         = el.querySelector('.lightbox__maximize');
  const btnTheme       = el.querySelector('.lightbox__theme');
  const specEls        = getSpecEls(el);
  const setLoading     = wireSpinner(lbImageWrap, lbImage);
  const toggleMaximize = makeToggleMaximize(el, btnMax);
  const toggleTheme    = makeToggleTheme(el, btnTheme);

  let currentIndex = 0;

  function applyItem(item) {
    if (!lbImage) return;
    const src = item.src;
    if (lbImage.src !== src) {
      setLoading(true);
      lbImage.src = src;
      if (lbImage.complete && lbImage.naturalWidth > 0) setLoading(false);
    }
    lbImage.alt = item.title || '';
    applyPanelData(el, item, currentIndex, items.length, specEls);
  }

  function open(index) {
    currentIndex = Math.max(0, Math.min(index, items.length - 1));
    applyItem(items[currentIndex]);
    el.hidden = false;
    el.offsetHeight;
    el.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (btnClose) btnClose.focus({ preventScroll: true });
  }

  function close() {
    el.classList.remove('active');
    setTimeout(() => {
      el.hidden = true;
      if (lbImage) lbImage.src = '';
      setLoading(false);
      el.classList.remove('is-maximized', 'is-dark');
      if (btnMax)   btnMax.setAttribute('aria-pressed', 'false');
      if (btnTheme) { btnTheme.setAttribute('aria-pressed', 'false'); btnTheme.setAttribute('aria-label', 'Switch to dark background'); }
      document.body.style.overflow = '';
    }, 380);
  }

  function navigate(dir) {
    currentIndex = (currentIndex + dir + items.length) % items.length;
    el.classList.add('is-changing');
    setTimeout(() => { applyItem(items[currentIndex]); el.classList.remove('is-changing'); }, 180);
  }

  wireBaseInteraction(el, close, navigate, toggleMaximize, toggleTheme);
  return { open, close };
}

// ---------------------------------------------------------------------------
// DOM-driven lightbox — gallery page
// Reads photo data from .gallery-item img dataset attributes.
// URL-synced via hash routing; expects stripPhotoFromHash / extractPhotoIndex /
// urlForHash helpers passed in from gallery.js (they live there for routing).
// ---------------------------------------------------------------------------
export function initLightbox({ stripPhotoFromHash, extractPhotoIndex, urlForHash }) {
  const el = document.getElementById('lightbox');
  if (!el) return;

  // Re-bind only if already initialised (called after each renderGrid)
  if (el.__rebindTriggers) {
    el.__rebindTriggers();
    return;
  }

  const lbImage        = el.querySelector('.lightbox__image');
  const lbImageWrap    = el.querySelector('.lightbox__image-wrap');
  const btnClose       = el.querySelector('.lightbox__close');
  const btnMax         = el.querySelector('.lightbox__maximize');
  const btnTheme       = el.querySelector('.lightbox__theme');
  const specEls        = getSpecEls(el);
  const setLoading     = wireSpinner(lbImageWrap, lbImage);
  const toggleMaximize = makeToggleMaximize(el, btnMax);
  const toggleTheme    = makeToggleTheme(el, btnTheme);

  let currentIndex = 0;
  let items = [];
  let pushedByUs = false;

  function getItems() { return Array.from(document.querySelectorAll('.gallery-item img')); }

  function urlWithPhoto(idx1OrNull) {
    const h = window.location.hash.replace('#', '');
    const base = stripPhotoFromHash(h);
    const newHash = idx1OrNull == null ? base : (base ? `${base}/p/${idx1OrNull}` : `p/${idx1OrNull}`);
    return urlForHash(newHash);
  }

  function applyImage(img) {
    const nextSrc = img.dataset.full || img.src;
    if (lbImage.src !== nextSrc) {
      const cached = lbImage.complete && lbImage.naturalWidth > 0 && lbImage.currentSrc === nextSrc;
      if (!cached) setLoading(true);
      lbImage.src = nextSrc;
      if (lbImage.complete && lbImage.naturalWidth > 0) setLoading(false);
    }
    lbImage.alt = img.alt || '';
    applyPanelData(el, {
      title:       img.dataset.title || img.alt || '',
      description: img.dataset.description || '',
      locFull:     img.dataset.location || '',
      camera:      img.dataset.camera,
      focal:       img.dataset.focal,
      aperture:    img.dataset.aperture,
      shutter:     img.dataset.shutter,
      iso:         img.dataset.iso,
      tags:        (img.dataset.tags || '').split('|').filter(Boolean),
    }, currentIndex, items.length, specEls);
  }

  function closeLightboxVisually() {
    el.classList.remove('active');
    setTimeout(() => {
      el.hidden = true;
      lbImage.src = '';
      setLoading(false);
      el.classList.remove('is-maximized', 'is-dark');
      if (btnMax)   btnMax.setAttribute('aria-pressed', 'false');
      if (btnTheme) { btnTheme.setAttribute('aria-pressed', 'false'); btnTheme.setAttribute('aria-label', 'Switch to dark background'); }
      document.body.style.overflow = '';
    }, 380);
  }

  function hasSameOriginReferrer() {
    if (!document.referrer) return false;
    try { return new URL(document.referrer).origin === window.location.origin; } catch (_) { return false; }
  }

  function closeLightbox() {
    if (pushedByUs) { pushedByUs = false; history.back(); return; }
    if (hasSameOriginReferrer() && history.length > 1) { history.back(); return; }
    closeLightboxVisually();
    if (extractPhotoIndex(window.location.hash.replace('#', '')) != null) {
      history.replaceState(null, '', urlWithPhoto(null));
    }
  }

  function openLightbox(index, fromUrl = false) {
    items = getItems();
    if (!items.length || index < 0 || index >= items.length) return;
    const wasOpen = !el.hidden;
    currentIndex = index;
    applyImage(items[currentIndex]);
    if (!wasOpen) {
      el.hidden = false;
      el.offsetHeight;
      el.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (btnClose) btnClose.focus({ preventScroll: true });
      if (!fromUrl) { history.pushState(null, '', urlWithPhoto(index + 1)); pushedByUs = true; }
    } else {
      history.replaceState(null, '', urlWithPhoto(index + 1));
    }
  }

  function navigate(dir) {
    currentIndex = (currentIndex + items.length + dir) % items.length;
    el.classList.add('is-changing');
    setTimeout(() => { applyImage(items[currentIndex]); el.classList.remove('is-changing'); }, 180);
    history.replaceState(null, '', urlWithPhoto(currentIndex + 1));
  }

  function bindGalleryTriggers() {
    getItems().forEach((img, i) => {
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

  wireBaseInteraction(el, closeLightbox, navigate, toggleMaximize, toggleTheme);
  bindGalleryTriggers();
  el.__rebindTriggers = bindGalleryTriggers;
  el.__openByIndex    = (idx0, fromUrl) => openLightbox(idx0, !!fromUrl);
  el.__closeFromUrl   = () => { pushedByUs = false; if (!el.hidden) closeLightboxVisually(); };
}
