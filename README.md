# Suhaib Khan Photography

Landscape photography portfolio — Dubai, Georgia, Sharjah, Switzerland, Germany.

**Live:** https://suhaibkhan.github.io/photofolio/
**Instagram:** [@suhaib_s_khan](https://instagram.com/suhaib_s_khan)

## Stack

Vanilla JS, HTML, CSS — bundled with [Vite](https://vitejs.dev), deployed to GitHub Pages via Actions. No UI framework.

## Development

```bash
npm install
npm run dev      # dev server on http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve dist/ locally
```

## Structure

- `index.html`, `gallery.html` — page entries
- `src/lib/app.js` — shared module (hero, gallery, lightbox, etc.)
- `css/style.css` — single stylesheet
- `data/photos.json` — photo / location / category data
- `public/images/photos/` — image assets

Filter by location or category via hash routing (`#loc-dubai`, `#mountains`). Append `/p/<N>` to deep-link the lightbox (e.g. `#loc-dubai/p/3`).
