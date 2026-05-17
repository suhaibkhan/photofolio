export function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function uniqueSlug(base, existingIds) {
  const start = slugify(base) || 'item';
  if (!existingIds.has(start)) return start;
  let index = 2;
  let candidate = `${start}-${index}`;
  while (existingIds.has(candidate)) { index += 1; candidate = `${start}-${index}`; }
  return candidate;
}
