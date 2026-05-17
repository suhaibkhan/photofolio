/**
 * Dev-only font switcher — combobox edition.
 *
 * Each slot renders a custom autocomplete: "Suggested" fonts at top,
 * then every font in GOOGLE_FONTS_ALL, filtered by live search.
 *
 * Never bundled in production (guarded by import.meta.env.DEV in callers).
 */

import { SLOTS, GOOGLE_FONTS_ALL } from './fonts.js';

const DEFAULTS = {
  slots: SLOTS,
  storageKey: 'dev:font-switcher',
  preloadAll: false,
};

// ---------- Google Fonts loader ----------

function makeLoader() {
  const loaded = new Set();
  return function loadFont(font) {
    if (!font.googleParams || loaded.has(font.googleParams)) return;
    loaded.add(font.googleParams);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${font.googleParams}&display=swap`;
    document.head.appendChild(link);
  };
}

// ---------- Persistence ----------

function loadState(storageKey, defaults) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (!saved) return { ...defaults };
    return { ...defaults, ...saved };
  } catch {
    return { ...defaults };
  }
}

function saveState(storageKey, state) {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

// ---------- Drag ----------

function makeDraggable(panelEl, handleEl, onDragEnd) {
  let dragging = false;
  let ox = 0, oy = 0;

  function onMouseMove(e) {
    if (!dragging) return;
    panelEl.style.left = Math.max(0, Math.min(e.clientX - ox, window.innerWidth  - panelEl.offsetWidth))  + 'px';
    panelEl.style.top  = Math.max(0, Math.min(e.clientY - oy, window.innerHeight - panelEl.offsetHeight)) + 'px';
  }

  function onMouseUp() {
    if (!dragging) return;
    dragging = false;
    handleEl.style.cursor = 'grab';
    document.body.style.userSelect = '';
    onDragEnd({ left: panelEl.style.left, top: panelEl.style.top });
  }

  handleEl.addEventListener('mousedown', e => {
    if (e.target.closest('.fs-close')) return;
    e.preventDefault();
    const rect = panelEl.getBoundingClientRect();
    panelEl.style.top    = rect.top  + 'px';
    panelEl.style.left   = rect.left + 'px';
    panelEl.style.bottom = 'auto';
    panelEl.style.right  = 'auto';
    ox = e.clientX - rect.left;
    oy = e.clientY - rect.top;
    dragging = true;
    handleEl.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup',   onMouseUp);
  return () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup',   onMouseUp);
  };
}

// ---------- Styles ----------

const PANEL_STYLES = `
#fs-trigger {
  position: fixed;
  bottom: 1.5rem;
  left: 1.5rem;
  z-index: 99999;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: 1.5px solid rgba(255,255,255,0.22);
  background: rgba(10,10,10,0.85);
  color: rgba(255,255,255,0.75);
  font-size: 0.78rem;
  font-family: Georgia, serif;
  font-style: italic;
  letter-spacing: 0.02em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 14px rgba(0,0,0,0.4);
  transition: transform 0.15s ease, border-color 0.15s, color 0.15s;
  user-select: none;
}
#fs-trigger:hover {
  transform: scale(1.08);
  border-color: rgba(255,255,255,0.5);
  color: #fff;
}
#fs-trigger.fs-active {
  border-color: rgba(255,255,255,0.6);
  color: #fff;
}

#fs-panel {
  position: fixed;
  bottom: 5rem;
  left: 1.5rem;
  z-index: 99999;
  width: 300px;
  max-height: calc(100vh - 6rem);
  display: flex;
  flex-direction: column;
  background: rgba(10,10,10,0.97);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #d8d8d8;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 0.8rem;
  font-style: normal;
  font-weight: 400;
  backdrop-filter: blur(14px);
  box-shadow: 0 10px 40px rgba(0,0,0,0.6);
  transform-origin: bottom left;
  animation: fs-appear 0.16s ease;
}
@keyframes fs-appear {
  from { opacity: 0; transform: scale(0.95) translateY(5px); }
  to   { opacity: 1; transform: scale(1)    translateY(0);   }
}

.fs-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 0.9rem;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  cursor: grab;
  user-select: none;
}
.fs-header:active { cursor: grabbing; }

.fs-drag-hint {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}
.fs-drag-icon {
  display: grid;
  grid-template-columns: repeat(2, 3px);
  gap: 2.5px;
  opacity: 0.25;
}
.fs-drag-icon span {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: currentColor;
  display: block;
}
.fs-title {
  font-size: 0.6rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
}
.fs-close {
  all: unset;
  color: rgba(255,255,255,0.3);
  font-size: 1.05rem;
  line-height: 1;
  cursor: pointer;
  padding: 0.1rem 0.2rem;
}
.fs-close:hover { color: rgba(255,255,255,0.8); }

.fs-body {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
}
.fs-body::-webkit-scrollbar { width: 3px; }
.fs-body::-webkit-scrollbar-track { background: transparent; }
.fs-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 2px; }

.fs-group {
  padding: 0.7rem 0.9rem;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.fs-group-label {
  font-size: 0.58rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.28);
  margin-bottom: 0.45rem;
}

/* Combobox trigger */
.fs-combo {
  position: relative;
}
.fs-combo-trigger {
  all: unset;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 4px;
  color: rgba(255,255,255,0.82);
  font-size: 0.82rem;
  padding: 0.38rem 0.55rem;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  line-height: 1.4;
}
.fs-combo-trigger:hover {
  border-color: rgba(255,255,255,0.22);
  background: rgba(255,255,255,0.08);
}
.fs-combo-trigger.fs-open {
  border-color: rgba(255,255,255,0.32);
  background: rgba(255,255,255,0.08);
}
.fs-combo-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-style: normal;
}
.fs-combo-arrow {
  font-size: 0.6rem;
  opacity: 0.35;
  margin-left: 0.4rem;
  flex-shrink: 0;
  transition: transform 0.15s;
  font-style: normal;
}
.fs-combo-trigger.fs-open .fs-combo-arrow {
  transform: rotate(180deg);
  opacity: 0.55;
}

/* Dropdown — appended to body, fixed-positioned */
.fs-combo-dropdown {
  position: fixed;
  z-index: 999999;
  display: flex;
  flex-direction: column;
  background: rgba(12,12,12,0.99);
  border: 1px solid rgba(255,255,255,0.13);
  border-radius: 6px;
  box-shadow: 0 10px 36px rgba(0,0,0,0.72);
  backdrop-filter: blur(16px);
  overflow: hidden;
  animation: fs-dropdown-in 0.12s ease;
}
@keyframes fs-dropdown-in {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}

.fs-combo-search-wrap {
  flex-shrink: 0;
  padding: 0.45rem 0.45rem 0.35rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.fs-combo-search {
  all: unset;
  display: block;
  width: 100%;
  box-sizing: border-box;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 3px;
  color: rgba(255,255,255,0.82);
  font-size: 0.75rem;
  font-family: system-ui, -apple-system, sans-serif;
  font-style: normal;
  padding: 0.28rem 0.5rem;
  line-height: 1.4;
  transition: border-color 0.12s;
}
.fs-combo-search::placeholder {
  color: rgba(255,255,255,0.22);
  font-style: italic;
}
.fs-combo-search:focus {
  border-color: rgba(255,255,255,0.24);
  outline: none;
}

.fs-combo-list {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0.2rem 0;
}
.fs-combo-list::-webkit-scrollbar { width: 3px; }
.fs-combo-list::-webkit-scrollbar-track { background: transparent; }
.fs-combo-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

.fs-combo-section-label {
  padding: 0.38rem 0.6rem 0.18rem;
  font-size: 0.54rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.24);
  user-select: none;
  font-family: system-ui, -apple-system, sans-serif;
}
.fs-combo-divider {
  height: 1px;
  background: rgba(255,255,255,0.05);
  margin: 0.18rem 0;
}

.fs-combo-option {
  all: unset;
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 0.28rem 0.6rem;
  font-size: 0.8rem;
  font-style: normal;
  color: rgba(255,255,255,0.58);
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: background 0.08s, color 0.08s;
  line-height: 1.5;
}
.fs-combo-option:hover {
  background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.92);
}
.fs-combo-option--active {
  color: #fff;
}
.fs-combo-option--active::after {
  content: ' ✓';
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 0.62rem;
  opacity: 0.5;
}
.fs-combo-option--focused {
  background: rgba(255,255,255,0.09);
  color: rgba(255,255,255,0.92);
  outline: none;
}
.fs-combo-empty {
  padding: 0.7rem 0.6rem;
  font-size: 0.72rem;
  color: rgba(255,255,255,0.2);
  font-style: italic;
  text-align: center;
}

.fs-footer {
  flex-shrink: 0;
  padding: 0.6rem 0.9rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(255,255,255,0.05);
}
.fs-reset {
  all: unset;
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.25);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.fs-reset:hover { color: rgba(255,255,255,0.55); }
.fs-devbadge {
  font-size: 0.55rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255,200,80,0.4);
  border: 1px solid rgba(255,200,80,0.18);
  border-radius: 2px;
  padding: 0.1rem 0.35rem;
}
`;

// ---------- Combobox widget ----------

function makeCombobox(slot, getState, onSelect, loadFont) {
  const suggestedLabels = new Set(slot.fonts.map(f => f.label.toLowerCase()));

  function resolveFont(idOrName) {
    const suggested = slot.fonts.find(f => f.id === idOrName);
    if (suggested) return suggested;
    // All-fonts entry: derive params from the name string
    const name = idOrName;
    const encoded = name.split(/\s+/).join('+');
    return {
      label: name,
      family: `'${name}', ${slot.fallback || 'system-ui, sans-serif'}`,
      googleParams: `family=${encoded}:ital,wght@0,300;0,400;0,500;1,300;1,400`,
    };
  }

  const el = document.createElement('div');
  el.className = 'fs-combo';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'fs-combo-trigger';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.innerHTML = '<span class="fs-combo-label"></span><span class="fs-combo-arrow">▾</span>';
  el.appendChild(trigger);

  let dropdown = null;

  function sync() {
    const font = resolveFont(getState(slot.key));
    const labelEl = trigger.querySelector('.fs-combo-label');
    labelEl.textContent = font.label;
    labelEl.style.fontFamily = font.family;
  }

  function buildOption(idOrName, font, isActive) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fs-combo-option' + (isActive ? ' fs-combo-option--active' : '');
    btn.dataset.value = idOrName;
    btn.textContent = font.label;
    if (font.family) btn.style.fontFamily = font.family;
    btn.addEventListener('mousedown', e => {
      // Use mousedown so the blur on search input doesn't close before click fires
      e.preventDefault();
    });
    btn.addEventListener('click', () => {
      onSelect(slot.key, idOrName);
      // Update active state in the open list without re-rendering
      if (dropdown) {
        dropdown.querySelectorAll('.fs-combo-option--active').forEach(el => {
          el.classList.remove('fs-combo-option--active');
        });
        btn.classList.add('fs-combo-option--active');
      }
    });
    return btn;
  }

  function renderList(search) {
    const list = dropdown.querySelector('.fs-combo-list');
    list.innerHTML = '';
    const q = search.toLowerCase().trim();
    const currentId = getState(slot.key);

    const filteredSuggested = slot.fonts.filter(
      f => !q || f.label.toLowerCase().includes(q)
    );
    const filteredAll = GOOGLE_FONTS_ALL.filter(
      name => !suggestedLabels.has(name.toLowerCase()) &&
              (!q || name.toLowerCase().includes(q))
    );

    if (!filteredSuggested.length && !filteredAll.length) {
      const empty = document.createElement('div');
      empty.className = 'fs-combo-empty';
      empty.textContent = 'No fonts match';
      list.appendChild(empty);
      return;
    }

    if (filteredSuggested.length) {
      const sec = document.createElement('div');
      sec.className = 'fs-combo-section-label';
      sec.textContent = 'Suggested';
      list.appendChild(sec);
      filteredSuggested.forEach(font => {
        list.appendChild(buildOption(font.id, font, currentId === font.id));
      });
    }

    if (filteredAll.length) {
      if (filteredSuggested.length) {
        const div = document.createElement('div');
        div.className = 'fs-combo-divider';
        list.appendChild(div);
      }
      const sec = document.createElement('div');
      sec.className = 'fs-combo-section-label';
      sec.textContent = 'All Google Fonts';
      list.appendChild(sec);
      filteredAll.forEach(name => {
        const font = { label: name, family: null }; // don't style — not loaded
        list.appendChild(buildOption(name, font, currentId === name));
      });
    }
  }

  function open() {
    if (dropdown) return;
    dropdown = document.createElement('div');
    dropdown.className = 'fs-combo-dropdown';
    dropdown.setAttribute('role', 'listbox');
    dropdown.innerHTML = `
      <div class="fs-combo-search-wrap">
        <input class="fs-combo-search" type="text" placeholder="Search fonts…" autocomplete="off" spellcheck="false" />
      </div>
      <div class="fs-combo-list"></div>
    `;
    document.body.appendChild(dropdown);
    renderList('');

    // Position below trigger, flip up if needed
    const rect = trigger.getBoundingClientRect();
    const w = Math.min(300, window.innerWidth - 16);
    const maxH = 300;
    dropdown.style.width = w + 'px';
    dropdown.style.maxHeight = maxH + 'px';

    let left = rect.left;
    if (left + w > window.innerWidth - 8) left = window.innerWidth - w - 8;

    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const spaceAbove = rect.top - 8;
    if (spaceBelow >= Math.min(maxH, 160) || spaceBelow >= spaceAbove) {
      dropdown.style.top  = (rect.bottom + 4) + 'px';
    } else {
      dropdown.style.bottom = 'auto';
      dropdown.style.top    = Math.max(8, rect.top - maxH - 4) + 'px';
    }
    dropdown.style.left = left + 'px';

    trigger.classList.add('fs-open');
    trigger.setAttribute('aria-expanded', 'true');

    const search = dropdown.querySelector('.fs-combo-search');
    search.focus();
    search.addEventListener('input', () => renderList(search.value));
    search.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.stopPropagation(); close(); return; }
      if (e.key === 'Enter') { e.preventDefault(); close(); return; }

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const options = [...dropdown.querySelectorAll('.fs-combo-option')];
        if (!options.length) return;
        const cur = dropdown.querySelector('.fs-combo-option--focused');
        const idx = cur ? options.indexOf(cur) : -1;
        let next;
        if (e.key === 'ArrowDown') {
          next = idx === -1 ? options[0] : options[Math.min(idx + 1, options.length - 1)];
        } else {
          next = idx === -1 ? options[options.length - 1] : options[Math.max(idx - 1, 0)];
        }
        options.forEach(o => o.classList.remove('fs-combo-option--focused'));
        next.classList.add('fs-combo-option--focused');
        next.scrollIntoView({ block: 'nearest' });

        // Apply immediately — no Enter needed
        const value = next.dataset.value;
        onSelect(slot.key, value);
        dropdown.querySelectorAll('.fs-combo-option--active').forEach(o => o.classList.remove('fs-combo-option--active'));
        next.classList.add('fs-combo-option--active');
      }
    });

    requestAnimationFrame(() => {
      const active = dropdown.querySelector('.fs-combo-option--active');
      if (active) {
        active.classList.add('fs-combo-option--focused');
        active.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  function close() {
    if (!dropdown) return;
    dropdown.remove();
    dropdown = null;
    trigger.classList.remove('fs-open');
    trigger.setAttribute('aria-expanded', 'false');
  }

  trigger.addEventListener('click', e => {
    e.stopPropagation();
    dropdown ? close() : open();
  });

  return { el, sync, close };
}

// ---------- Panel ----------

function buildPanelHTML() {
  return `
    <div class="fs-header">
      <div class="fs-drag-hint">
        <div class="fs-drag-icon" aria-hidden="true">
          ${Array(6).fill('<span></span>').join('')}
        </div>
        <span class="fs-title">Font Lab</span>
      </div>
      <button class="fs-close" aria-label="Close panel">×</button>
    </div>
    <div class="fs-body"></div>
    <div class="fs-footer">
      <button class="fs-reset">Reset to defaults</button>
      <span class="fs-devbadge">dev only</span>
    </div>
  `;
}

// ---------- Core ----------

function _init(config) {
  const { slots, storageKey, preloadAll } = config;

  const loadFont = makeLoader();

  const stateDefaults = Object.fromEntries(slots.map(s => [s.key, s.defaultId]));
  stateDefaults.pos = null;
  const state = loadState(storageKey, stateDefaults);

  function applyFont(slot, idOrName) {
    if (!idOrName) return;
    const suggested = slot.fonts.find(f => f.id === idOrName);
    if (suggested) {
      loadFont(suggested);
      document.documentElement.style.setProperty(slot.cssVar, suggested.family);
      return;
    }
    const name    = idOrName;
    const encoded = name.split(/\s+/).join('+');
    const font    = {
      label:        name,
      family:       `'${name}', ${slot.fallback || 'system-ui, sans-serif'}`,
      googleParams: `family=${encoded}:ital,wght@0,300;0,400;0,500;1,300;1,400`,
    };
    loadFont(font);
    document.documentElement.style.setProperty(slot.cssVar, font.family);
  }

  // Restore persisted selections immediately
  slots.forEach(slot => applyFont(slot, state[slot.key]));

  const styleEl = document.createElement('style');
  styleEl.textContent = PANEL_STYLES;
  document.head.appendChild(styleEl);

  const triggerBtn = document.createElement('button');
  triggerBtn.id = 'fs-trigger';
  triggerBtn.textContent = 'Aa';
  triggerBtn.title = 'Font Lab (dev only)';
  triggerBtn.setAttribute('aria-label', 'Toggle font switcher');
  document.body.appendChild(triggerBtn);

  let panelEl   = null;
  let comboMap  = new Map(); // slotKey → combo instance
  let cleanupDrag = null;
  let suppressNextOutsideClick = false;

  function selectFont(slotKey, idOrName) {
    state[slotKey] = idOrName;
    applyFont(slots.find(s => s.key === slotKey), idOrName);
    saveState(storageKey, state);
    comboMap.get(slotKey)?.sync();
  }

  function resetFonts() {
    slots.forEach(slot => {
      state[slot.key] = slot.defaultId;
      applyFont(slot, slot.defaultId);
      comboMap.get(slot.key)?.sync();
    });
    saveState(storageKey, state);
  }

  function closeAllDropdowns() {
    comboMap.forEach(c => c.close());
  }

  function open() {
    if (panelEl) return;

    comboMap.clear();
    panelEl = document.createElement('div');
    panelEl.id = 'fs-panel';
    panelEl.setAttribute('role', 'dialog');
    panelEl.setAttribute('aria-label', 'Font Lab');
    panelEl.innerHTML = buildPanelHTML();

    const body = panelEl.querySelector('.fs-body');
    slots.forEach(slot => {
      const group = document.createElement('div');
      group.className = 'fs-group';

      const label = document.createElement('div');
      label.className = 'fs-group-label';
      label.textContent = slot.label;
      group.appendChild(label);

      const combo = makeCombobox(slot, key => state[key], selectFont, loadFont);
      combo.sync();
      comboMap.set(slot.key, combo);
      group.appendChild(combo.el);
      body.appendChild(group);
    });

    panelEl.querySelector('.fs-close').addEventListener('click', close);
    panelEl.querySelector('.fs-reset').addEventListener('click', resetFonts);
    document.body.appendChild(panelEl);

    if (preloadAll) {
      slots.forEach(slot => slot.fonts.forEach(font => loadFont(font)));
    }

    if (state.pos) {
      const w = panelEl.offsetWidth;
      const h = panelEl.offsetHeight;
      panelEl.style.left   = Math.max(0, Math.min(parseInt(state.pos.left), window.innerWidth  - w)) + 'px';
      panelEl.style.top    = Math.max(0, Math.min(parseInt(state.pos.top),  window.innerHeight - h)) + 'px';
      panelEl.style.bottom = 'auto';
    }

    cleanupDrag = makeDraggable(panelEl, panelEl.querySelector('.fs-header'), pos => {
      state.pos = pos;
      saveState(storageKey, state);
      suppressNextOutsideClick = true;
    });

    triggerBtn.classList.add('fs-active');
    triggerBtn.setAttribute('aria-expanded', 'true');
  }

  function close() {
    closeAllDropdowns();
    cleanupDrag?.();
    cleanupDrag = null;
    panelEl?.remove();
    panelEl = null;
    comboMap.clear();
    triggerBtn.classList.remove('fs-active');
    triggerBtn.setAttribute('aria-expanded', 'false');
  }

  triggerBtn.addEventListener('click', () => (panelEl ? close() : open()));

  document.addEventListener('click', e => {
    if (suppressNextOutsideClick) { suppressNextOutsideClick = false; return; }
    const openDropdown = document.querySelector('.fs-combo-dropdown');
    // Close any open dropdown when clicking outside it (and not on its own trigger)
    if (openDropdown && !openDropdown.contains(e.target) && !e.target.closest('.fs-combo-trigger')) {
      closeAllDropdowns();
    }
    // Close panel when clicking outside panel, trigger, and dropdown
    if (panelEl && !panelEl.contains(e.target) && e.target !== triggerBtn && !openDropdown?.contains(e.target)) {
      close();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (document.querySelector('.fs-combo-dropdown')) {
      closeAllDropdowns();
    } else if (panelEl) {
      close();
    }
  });
}

// ---------- Public API ----------

/**
 * @param {object}  [config]
 * @param {Array}   [config.slots]       – slot definitions (default: SLOTS from fonts.js)
 * @param {string}  [config.storageKey]  – localStorage key
 * @param {boolean} [config.preloadAll]  – load all suggested fonts on panel open
 */
export function init(config = {}) {
  const resolved = { ...DEFAULTS, ...config };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => _init(resolved), { once: true });
  } else {
    _init(resolved);
  }
}
