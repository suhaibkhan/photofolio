# Suhaib Khan Photography Portfolio

Vanilla JS/HTML/CSS landscape photography portfolio. Static site bundled with **Vite** and deployed to GitHub Pages via Actions. No UI framework — just ES modules.

## Architecture

- **Data-driven**: All photos, locations, and categories defined in `data/photos.json`, imported directly into JS at build time (no runtime fetch)
- **Multi-page Vite setup**: `index.html` and `gallery.html` are both Vite entry points with their own thin module entry under `src/pages/`
- **Single gallery page**: `gallery.html` uses hash routing (`#loc-dubai`, `#mountains`, etc.) to filter by location or category. Append `/p/<1-based-index>` (e.g. `#loc-dubai/p/3`) to deep-link into the lightbox
- **Shared module**: `src/lib/app.js` exports all init functions (mobile menu, hero, themes, atlas, gallery, lightbox, scroll reveal); page entries import what they need
- **CSS via JS import**: `css/style.css` is imported at the top of `app.js`; Vite extracts, hashes and bundles it. No inline critical CSS

## File Structure

```
index.html               # Landing page entry (Vite processes <script type="module">)
gallery.html             # Gallery page entry
package.json             # Vite + scripts (dev / build / preview)
vite.config.js           # Multi-page input config, base: './' for portable deploys
src/
  pages/index.js         # Index page bootstrap
  pages/gallery.js       # Gallery page bootstrap
  lib/app.js             # Shared module — exports init functions, imports CSS + JSON
css/style.css            # Single stylesheet (imported by app.js)
data/photos.json         # Photo / location / category data (imported by app.js)
images/logo.png          # Signature-style logo (referenced from HTML, hashed by Vite)
public/.nojekyll         # Passes through to dist/ root
.github/workflows/deploy.yml  # Build + deploy on push to main
```

## Key Design Decisions

- **Fonts**: EB Garamond (display/headings) + Alegreya Sans (body/nav) via Google Fonts — old-style print aesthetic
- **Logo**: PNG image, inverted to white via CSS `filter` on transparent header over hero, reverts to black on scroll
- **Hero**: Cinematic slideshow with Ken Burns effect (5 motion patterns), progress bar, image title + location labels, vertical side text
- **Header**: Transparent over hero (120px), shrinks to 80px/70px logo on scroll. Gallery page uses solid 80px header
- **Nav**: Static links — Home, Locations, Categories, Gallery, Instagram. Gallery page shows Home, Gallery, Instagram
- **Locations section**: Editorial layout — asymmetric grid (featured tall card + smaller cards), scroll-reveal animations. Shows Dubai, Georgia, Sharjah, Switzerland, Germany
- **Categories section**: Grid of thematic category cards — Mountains, Nature, Cityscapes, Landscape, Desert
- **Gallery filter bar**: Toggle between Locations/Categories mode with pill-style filter buttons. Syncs with hash routing
- **Gallery masonry**: CSS `column-count` (3/2/1 responsive), not JS-based
- **Lightbox**: Keyboard (Escape/arrows) + touch swipe support. URL-synced via `/p/<1-based-index>` suffix on the filter hash — opening a photo `pushState`s a history entry (so browser back closes the lightbox), prev/next `replaceState` so each photo is shareable without polluting history. Deep-link loads open without pushing; close cleans the URL via `replaceState`. The first `initLightbox` call wires controls and stashes a re-binder on `lightbox.__rebindTriggers` so subsequent re-renders only rebind fresh figures (avoids a TDZ trap from the original closure)
- **Instagram CTA**: Simple link to @suhaib_s_khan, no API

## photos.json Schema

```json
{
  "locations": [{ "id": "dubai", "name": "Dubai", "shortName": "Dubai", "description": "..." }],
  "categories": [{ "id": "mountains", "name": "Mountains", "description": "..." }],
  "photos": [{
    "title": "...",
    "src": "https://images.unsplash.com/photo-XXXX",
    "width": 1600, "height": 1067,
    "location": "dubai",
    "categories": ["cityscapes"],
    "hero": true,
    "mobileHero": false
  }]
}
```

- `src`: Base Unsplash URL, JS appends `?auto=format&q=80&w=WIDTH` for responsive variants
- `hero` / `mobileHero`: Controls which photos appear in the hero slideshow per viewport
- `locations[].shortName`: Compact label used for UI contexts that need shorter text
- `photos[].location`: Matches `locations[].id` for filtering and lookup
- A photo can belong to multiple categories
- Gallery hash routing: `#loc-dubai` for locations, `#mountains` for categories; optional `/p/<N>` suffix opens the lightbox at the Nth photo of the active filter (e.g. `#mountains/p/2`, `#p/5` for all-photos)

## Performance

- Native `loading="lazy"` on all below-fold images
- `srcset` with 3 size variants (400w, 600w, 900w)
- Unsplash `auto=format` auto-serves WebP
- System font fallbacks, Google Fonts with `display=swap`
- `fetchpriority="high"` on first hero image
- `preconnect` to fonts.googleapis.com, fonts.gstatic.com, images.unsplash.com
- `prefers-reduced-motion` disables all animations
- Vite bundles + minifies + hashes CSS/JS/logo for long-term caching; `photos.json` is bundled into the JS chunk so the gallery renders synchronously
- Note: Vite's default CSS is render-blocking (single hashed `<link>`). The previous inline-critical-CSS trick was removed when migrating; if you want it back, add a Vite plugin (`vite-plugin-critical` or similar)

## Local Development

```bash
npm install         # first time
npm run dev         # starts Vite dev server on http://localhost:5173 with HMR
npm run build       # production build into dist/
npm run preview     # serve the built dist/ locally to sanity-check
```

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) builds on every push to `main` and deploys `dist/` via the official Pages actions. Set repo Settings > Pages > Source to **GitHub Actions** (not "Deploy from a branch") for this to take effect.

`vite.config.js` uses `base: './'` so the build is portable — works whether deployed at the root or under a project sub-path (e.g. `username.github.io/photo-portfolio/`) without changing config.
