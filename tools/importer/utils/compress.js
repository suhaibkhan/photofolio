import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

export const PASSES = {
  covers: { maxDimension: 1200, quality: 80, subDir: path.join('images', 'covers') },
  hero:   { maxDimension: 2400, quality: 85, subDir: path.join('images', 'hero') },
};
export const LOGO_QUALITY = 90;

export function formatBytes(bytes) {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function mtime(absPath) {
  try { return (await fs.stat(absPath)).mtimeMs; } catch { return null; }
}

export async function fileSize(absPath) {
  try { return (await fs.stat(absPath)).size; } catch { return 0; }
}

export function collectCoverSources(data) {
  const s = new Set();
  for (const loc  of data.locations  ?? []) if (loc.cover)  s.add(loc.cover);
  for (const cat  of data.categories ?? []) if (cat.cover)  s.add(cat.cover);
  for (const photo of data.photos    ?? []) if (photo.src)  s.add(photo.src);
  return [...s].sort();
}

export function collectHeroSources(data) {
  const s = new Set();
  for (const photo of data.photos ?? []) {
    if (photo.src && (photo.hero || photo.mobileHero || photo.featured)) s.add(photo.src);
  }
  return [...s].sort();
}

async function isFresh(srcAbs, outAbs, force) {
  if (force) return false;
  const [src, out] = await Promise.all([mtime(srcAbs), mtime(outAbs)]);
  return src != null && out != null && out >= src;
}

// Returns: { status: 'compressed' | 'skipped' | 'missing', sourceSize, webpSize, relativeSrc }
export async function compressPhoto(root, relativeSrc, { maxDimension, quality, subDir }, force) {
  const srcAbs  = path.join(root, 'public', relativeSrc);
  const webpOut = path.join(root, 'public', subDir, `${path.parse(relativeSrc).name}.webp`);

  const sourceSize = await fileSize(srcAbs);
  if (!sourceSize) return { relativeSrc, status: 'missing', sourceSize: 0, webpSize: 0 };

  if (await isFresh(srcAbs, webpOut, force)) {
    return { relativeSrc, status: 'skipped', sourceSize, webpSize: await fileSize(webpOut) };
  }

  await sharp(srcAbs, { failOn: 'none' })
    .rotate()
    .resize({ width: maxDimension, height: maxDimension, fit: 'inside', withoutEnlargement: true })
    .webp({ quality, effort: 5 })
    .toFile(webpOut);

  return { relativeSrc, status: 'compressed', sourceSize, webpSize: await fileSize(webpOut) };
}

export async function compressLogo(root, force) {
  const srcAbs  = path.join(root, 'images', 'logo.png');
  const webpOut = path.join(root, 'images', 'logo.webp');

  const sourceSize = await fileSize(srcAbs);
  if (!sourceSize) return { relativeSrc: 'images/logo.png', status: 'missing', sourceSize: 0, webpSize: 0 };

  if (await isFresh(srcAbs, webpOut, force)) {
    return { relativeSrc: 'images/logo.png', status: 'skipped', sourceSize, webpSize: await fileSize(webpOut) };
  }

  await sharp(srcAbs, { failOn: 'none' })
    .webp({ quality: LOGO_QUALITY, effort: 6 })
    .toFile(webpOut);

  return { relativeSrc: 'images/logo.png', status: 'compressed', sourceSize, webpSize: await fileSize(webpOut) };
}
