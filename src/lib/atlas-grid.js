import '../../css/atlas-grid.css';
import { coverWebp } from './paths.js';
import { ATLAS_PAGE_SIZE, ATLAS_SLOTS, slotsForCount, computeAtlasFrames } from './atlas-utils.js';

const ARROW_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';

function buildAtlasTile(entry, slot, globalIdx, photos) {
  const isHero = slot === 'hero' || slot === 'solo' || slot === 'half-L' || slot === 'half-R';

  const tile = document.createElement('a');
  tile.href = `gallery.html#loc-${entry.loc.id}`;
  tile.className = 'atlas-tile';
  tile.dataset.tile = slot;
  if (entry._borrowed) tile.dataset.borrowed = 'true';

  const picture = document.createElement('picture');
  const webpSource = document.createElement('source');
  webpSource.type = 'image/webp';
  webpSource.srcset = coverWebp(entry.photo.src);
  picture.appendChild(webpSource);

  const img = document.createElement('img');
  img.src = entry.photo.src;
  img.sizes = isHero
    ? '(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 60vw'
    : '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 30vw';
  img.alt = `${entry.loc.name} — ${entry.photo.title}`;
  img.width = entry.photo.width;
  img.height = entry.photo.height;
  img.loading = globalIdx < 2 ? 'eager' : 'lazy';
  img.decoding = 'async';
  if (globalIdx === 0) img.fetchPriority = 'high';
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

  const photoCount = photos.filter((p) => p.location === entry.loc.id).length;
  const meta = document.createElement('div');
  meta.className = 'atlas-tile__meta';

  const metaCount = document.createElement('span');
  metaCount.className = 'atlas-tile__meta-count';
  metaCount.textContent = `${photoCount} ${photoCount === 1 ? 'PHOTO' : 'PHOTOS'}`;

  const metaCta = document.createElement('span');
  metaCta.className = 'atlas-tile__meta-cta';
  metaCta.setAttribute('aria-label', `View ${entry.loc.name}`);
  metaCta.innerHTML = ARROW_SVG;

  meta.appendChild(metaCount);
  meta.appendChild(metaCta);
  caption.appendChild(meta);
  tile.appendChild(caption);

  return tile;
}

function initAtlasNav(track) {
  const stage = track.closest('.atlas__stage');
  if (!stage) return;

  const prevBtn = stage.querySelector('.atlas-nav--prev');
  const nextBtn = stage.querySelector('.atlas-nav--next');

  function updateState() {
    const overflow = track.scrollWidth > track.clientWidth + 4;
    stage.classList.toggle('has-overflow', overflow);

    const atStart = track.scrollLeft <= 2;
    const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
    if (prevBtn) { prevBtn.classList.toggle('is-disabled', atStart); prevBtn.disabled = atStart; }
    if (nextBtn) { nextBtn.classList.toggle('is-disabled', atEnd);   nextBtn.disabled = atEnd;   }
    stage.classList.toggle('at-start', atStart);
    stage.classList.toggle('at-end', atEnd);
  }

  if (prevBtn) prevBtn.addEventListener('click', () => track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' }));
  if (nextBtn) nextBtn.addEventListener('click', () => track.scrollBy({ left:  track.clientWidth, behavior: 'smooth' }));

  let raf = null;
  track.addEventListener('scroll', () => {
    if (raf) return;
    raf = requestAnimationFrame(() => { raf = null; updateState(); });
  }, { passive: true });
  window.addEventListener('resize', updateState);
  updateState();
}

function initAtlasMeter(track) {
  const meter = document.querySelector('.atlas-meter');
  if (!meter) return;

  const meterCurrent = meter.querySelector('.atlas-meter__current');
  const meterTotal   = meter.querySelector('.atlas-meter__total');
  const meterProgress = meter.querySelector('.atlas-meter__progress');

  function update() {
    const overflow = track.scrollWidth - track.clientWidth;
    if (overflow <= 4) { if (meterProgress) meterProgress.style.transform = 'scaleX(0)'; return; }
    const ratio = Math.min(1, Math.max(0, track.scrollLeft / overflow));
    if (meterProgress) meterProgress.style.transform = `scaleX(${ratio})`;
    const pages = Math.max(1, Math.ceil(track.scrollWidth / Math.max(1, track.clientWidth)));
    if (meterTotal) meterTotal.textContent = String(pages).padStart(2, '0');
    const page = Math.round(ratio * (pages - 1));
    if (meterCurrent) meterCurrent.textContent = String(Math.min(pages - 1, Math.max(0, page)) + 1).padStart(2, '0');
  }

  let raf = null;
  track.addEventListener('scroll', () => {
    if (raf) return;
    raf = requestAnimationFrame(() => { raf = null; update(); });
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
}

export function initAtlas(data) {
  const track = document.getElementById('locations-grid');
  if (!track) return;

  const entries = (data.locations || []).map((loc) => {
    const photo = (loc.cover && data.photos.find((p) => p.src === loc.cover))
               || data.photos.find((p) => p.location === loc.id && p.hero)
               || data.photos.find((p) => p.location === loc.id);
    return { loc, photo };
  }).filter((x) => x.photo);

  if (track.children.length === 0) {
    const frames = computeAtlasFrames(entries, ATLAS_PAGE_SIZE);
    frames.forEach((frameEntries, frameIdx) => {
      const slots = slotsForCount(frameEntries.length);
      const frameEl = document.createElement('div');
      frameEl.className = 'atlas__frame';

      frameEntries.forEach((entry, relIdx) => {
        const globalIdx = frameIdx * ATLAS_PAGE_SIZE + relIdx;
        frameEl.appendChild(buildAtlasTile(entry, slots[relIdx], globalIdx, data.photos));
      });

      track.appendChild(frameEl);
    });
  }

  initAtlasNav(track);
  initAtlasMeter(track);
}
