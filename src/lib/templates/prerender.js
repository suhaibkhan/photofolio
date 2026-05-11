import { imgSrc, coverWebp, heroWebp } from '../paths.js';

const ATLAS_SLOTS = ['hero', 'side1', 'side2', 'footL', 'footM', 'footR'];

const ARROW_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';

function esc(value) {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildLocationMap(data) {
  return new Map((data.locations || []).map((loc) => [loc.id, loc]));
}

function getLocationLabel(photo, locationMap) {
  const location = locationMap.get(photo.location);
  if (!location) return photo.location || '';
  return location.shortName || location.name || location.id;
}

export function renderHeroFirstSlide(data) {
  const photos = data.photos || [];
  const desktop = photos.find((p) => p.hero);
  if (!desktop) return { slideHtml: '', titleText: '', locationText: '', preloadLinks: '' };

  const mobile = photos.find((p) => p.mobileHero) || desktop;
  const locationMap = buildLocationMap(data);

  const desktopWebp = esc(heroWebp(desktop.src));
  const desktopJpg = esc(imgSrc(desktop.src));
  const mobileWebp = esc(heroWebp(mobile.src));
  const mobileJpg = esc(imgSrc(mobile.src));

  const mobileSources = mobile !== desktop
    ? `<source type="image/webp" media="(max-width: 768px)" srcset="${mobileWebp}">`
      + `<source media="(max-width: 768px)" srcset="${mobileJpg}">`
    : '';

  const slideHtml = `<div class="hero__slide kb-1 active">`
    + `<picture>`
    + mobileSources
    + `<source type="image/webp" srcset="${desktopWebp}">`
    + `<img src="${desktopJpg}" alt="${esc(desktop.title)}" width="${desktop.width}" height="${desktop.height}" fetchpriority="high" decoding="async">`
    + `</picture>`
    + `</div>`;

  const preloadMobile = mobile !== desktop
    ? `<link rel="preload" as="image" type="image/webp" media="(max-width: 768px)" href="${mobileWebp}">`
    : '';
  const preloadLinks = preloadMobile
    + `<link rel="preload" as="image" type="image/webp" href="${desktopWebp}" fetchpriority="high">`;

  return {
    slideHtml,
    titleText: esc(desktop.title),
    locationText: esc(getLocationLabel(desktop, locationMap)),
    preloadLinks,
  };
}

export function renderAtlasHtml(data) {
  const locations = data.locations || [];
  const photos = data.photos || [];

  const entries = locations.map((loc) => {
    const photo = (loc.cover && photos.find((p) => p.src === loc.cover))
      || photos.find((p) => p.location === loc.id && p.hero)
      || photos.find((p) => p.location === loc.id);
    return { loc, photo };
  }).filter((x) => x.photo);

  return entries.map((entry, i) => {
    const slot = ATLAS_SLOTS[i] || `extra${i}`;
    const isHero = slot === 'hero';
    const { loc, photo } = entry;

    const sizes = isHero
      ? '(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 60vw'
      : '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 30vw';

    const loading = i < 2 ? 'eager' : 'lazy';
    const fetchAttr = isHero ? ' fetchpriority="high"' : '';

    const photoCount = photos.filter((p) => p.location === loc.id).length;
    const countLabel = `${photoCount} ${photoCount === 1 ? 'PHOTO' : 'PHOTOS'}`;

    const descHtml = loc.description
      ? `<p class="atlas-tile__desc">${esc(loc.description)}</p>`
      : '';

    return `<a href="gallery.html#loc-${esc(loc.id)}" class="atlas-tile" data-tile="${esc(slot)}">`
      + `<picture>`
      + `<source type="image/webp" srcset="${esc(coverWebp(photo.src))}">`
      + `<img src="${esc(imgSrc(photo.src))}" sizes="${sizes}" alt="${esc(loc.name)} — ${esc(photo.title)}" width="${photo.width}" height="${photo.height}" loading="${loading}" decoding="async"${fetchAttr}>`
      + `</picture>`
      + `<div class="atlas-tile__veil" aria-hidden="true"></div>`
      + `<div class="atlas-tile__caption">`
      + `<h3 class="atlas-tile__name">${esc(loc.shortName || loc.name)}</h3>`
      + descHtml
      + `<div class="atlas-tile__meta">`
      + `<span class="atlas-tile__meta-count">${esc(countLabel)}</span>`
      + `<span class="atlas-tile__meta-cta" aria-label="View ${esc(loc.name)}">${ARROW_SVG}</span>`
      + `</div>`
      + `</div>`
      + `</a>`;
  }).join('');
}

function galleryUrlForPhoto(photo, photos) {
  const idx = photos.indexOf(photo);
  if (idx === -1) return 'gallery.html';
  // Gallery's "all" mode reverses data.photos, so the 1-based URL index
  // is (length - originalIndex). Keep this in sync with renderGrid() in gallery.js.
  const n = photos.length - idx;
  return `gallery.html#p/${n}`;
}

export function renderFeaturedHtml(data) {
  const photos = data.photos || [];
  const featured = photos.filter((p) => p.featured).reverse();
  if (!featured.length) return '';

  const main = featured[0];
  const thumbs = featured.slice(0, 4);
  const more = Math.max(0, featured.length - 4);
  const locationMap = buildLocationMap(data);

  function dataAttrs(p) {
    const url = galleryUrlForPhoto(p, photos);
    const locShort = getLocationLabel(p, locationMap);
    const locFull = (locationMap.get(p.location)?.name) || locShort;
    return ` data-href="${esc(url)}"`
      + ` data-title="${esc(p.title)}"`
      + ` data-description="${esc(p.description)}"`
      + ` data-loc-tag="${esc((locShort || '').toUpperCase())}"`
      + ` data-loc-full="${esc(locFull)}"`
      + ` data-src="${esc(imgSrc(p.src))}"`
      + ` data-webp-cover="${esc(coverWebp(p.src))}"`
      + ` data-webp-hero="${esc(heroWebp(p.src))}"`
      + ` data-width="${p.width}"`
      + ` data-height="${p.height}"`;
  }

  const mainUrl = galleryUrlForPhoto(main, photos);
  const mainLoc = getLocationLabel(main, locationMap);
  const mainLocFull = (locationMap.get(main.location)?.name) || mainLoc;

  const thumbsHtml = thumbs.map((p, i) => {
    const activeClass = i === 0 ? ' is-active' : '';
    const ariaCurrent = i === 0 ? ' aria-current="true"' : '';
    return `<a href="${esc(galleryUrlForPhoto(p, photos))}" class="featured__thumb${activeClass}" aria-label="Show ${esc(p.title)} in featured frame"${ariaCurrent}${dataAttrs(p)}>`
      + `<picture>`
      + `<source type="image/webp" srcset="${esc(coverWebp(p.src))}">`
      + `<img src="${esc(imgSrc(p.src))}" alt="${esc(p.title)}" width="${p.width}" height="${p.height}" loading="lazy" decoding="async">`
      + `</picture>`
      + `<span class="featured__thumb-frame" aria-hidden="true"></span>`
      + `</a>`;
  }).join('');

  const moreLink = more > 0
    ? `<a href="gallery.html" class="featured__more" aria-label="View all featured photographs">`
      + `<span class="featured__more-label">+${more} More</span>`
      + `<span class="featured__more-rule" aria-hidden="true"></span>`
      + `<span class="featured__more-arrow" aria-hidden="true">&rarr;</span>`
      + `</a>`
    : '';

  const thumbsBlock = thumbsHtml
    ? `<div class="featured__thumbs">${thumbsHtml}</div>`
    : '';

  return `<div class="featured__text reveal">`
    + `<div class="section-marker section-marker--inline">`
    + `<span class="section-marker__rule section-marker__rule--lead"></span>`
    + `<span class="section-marker__label">Featured Frame</span>`
    + `<span class="section-marker__rule"></span>`
    + `</div>`
    + `<h2 class="featured__heading" id="featured-heading">${esc(main.title)}</h2>`
    + `<p class="featured__location"><em>from</em> <span class="featured__location-name">${esc(mainLocFull)}</span></p>`
    + `<p class="featured__lede">${esc(main.description)}</p>`
    + `<a href="${esc(mainUrl)}" class="featured__cta">`
    + `<span class="featured__cta-label">View the Photograph</span>`
    + `<span class="featured__cta-rule" aria-hidden="true"></span>`
      + `<span class="featured__cta-arrow" aria-hidden="true">${ARROW_SVG}</span>`
    + `</a>`
    + `</div>`
    + `<div class="featured__media reveal">`
    + `<a href="${esc(mainUrl)}" class="featured__main" aria-label="View ${esc(main.title)}"${dataAttrs(main)}>`
    + `<picture>`
    + `<source type="image/webp" srcset="${esc(heroWebp(main.src))}">`
    + `<img src="${esc(imgSrc(main.src))}" sizes="(max-width: 1024px) 100vw, 60vw" alt="${esc(main.title)}" width="${main.width}" height="${main.height}" loading="lazy" decoding="async">`
    + `</picture>`
    + `</a>`
    + thumbsBlock
    + moreLink
    + `</div>`;
}

export function renderThemesHtml(data) {
  const categories = data.categories || [];
  const photos = data.photos || [];

  return categories.map((cat, i) => {
    const photo = (cat.cover && photos.find((p) => p.src === cat.cover))
      || photos.find((p) => (p.categories || []).indexOf(cat.id) !== -1);
    if (!photo) return '';

    const count = photos.filter((p) => (p.categories || []).indexOf(cat.id) !== -1).length;
    const countLabel = `${count} ${count === 1 ? 'PHOTO' : 'PHOTOS'}`;

    const loading = i < 2 ? 'eager' : 'lazy';
    const fetchAttr = i === 0 ? ' fetchpriority="high"' : '';

    return `<a href="gallery.html#${esc(cat.id)}" class="plate" data-idx="${i}" role="listitem">`
      + `<picture>`
      + `<source type="image/webp" srcset="${esc(coverWebp(photo.src))}">`
      + `<img class="plate__img" src="${esc(imgSrc(photo.src))}" sizes="(max-width: 768px) 80vw, 36vw" alt="${esc(cat.name)} photographs" width="${photo.width}" height="${photo.height}" loading="${loading}" decoding="async"${fetchAttr}>`
      + `</picture>`
      + `<div class="plate__veil" aria-hidden="true"></div>`
      + `<div class="plate__caption">`
      + `<h3 class="plate__title">${esc(cat.name)}</h3>`
      + `<p class="plate__desc">${esc(cat.description)}</p>`
      + `<div class="plate__meta">`
      + `<span class="plate__meta-count">${esc(countLabel)}</span>`
      + `<span class="plate__meta-cta" aria-label="View ${esc(cat.name)} collection">${ARROW_SVG}</span>`
      + `</div>`
      + `</div>`
      + `</a>`;
  }).join('');
}
