export function coverWebp(src) {
  return swapToWebp(src, '/covers');
}

export function heroWebp(src) {
  return swapToWebp(src, '/hero');
}

function swapToWebp(src, replacementSuffix) {
  if (!src) return '';
  const slash = src.lastIndexOf('/');
  const dir = slash === -1 ? '' : src.slice(0, slash);
  const file = slash === -1 ? src : src.slice(slash + 1);
  const dot = file.lastIndexOf('.');
  const name = dot === -1 ? file : file.slice(0, dot);
  const base = dir.replace(/\/photos$/, replacementSuffix);
  return `${base}/${name}.webp`;
}
