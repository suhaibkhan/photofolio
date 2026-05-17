export function formatFraction(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
  if (value >= 1) return `${value.toFixed(2).replace(/\.00$/, '')}s`;
  const denominator = Math.round(1 / value);
  if (!Number.isFinite(denominator) || denominator <= 0) return `${value.toFixed(4)}s`;
  return `1/${denominator}s`;
}

export function normalizeFNumber(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
  return `f/${value.toFixed(1).replace(/\.0$/, '')}`;
}

export function normalizeFocalLength(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
  return `${value.toFixed(0)}mm`;
}

export function normalizeCamera(make, model) {
  const parts = [make, model]
    .map((p) => (typeof p === 'string' ? p.trim() : ''))
    .filter(Boolean);
  if (!parts.length) return null;
  if (parts.length === 2 && parts[1].toLowerCase().startsWith(parts[0].toLowerCase())) return parts[1];
  return parts.join(' ');
}
