// Node-safe pure utilities shared by the browser module and the Vite prerender plugin.

export const ATLAS_PAGE_SIZE = 5;

// Named grid slots in the 5-tile layout order.
export const ATLAS_SLOTS = ['hero', 'side1', 'side2', 'footL', 'footR'];

/**
 * Return the slot names for a given tile count within one frame.
 * Handles partial frames (< 5 tiles) with graceful fallback layouts.
 */
export function slotsForCount(n) {
  if (n === 1) return ['solo'];
  if (n === 2) return ['half-L', 'half-R'];
  return ATLAS_SLOTS.slice(0, n);
}

/**
 * Split entries into frames of `pageSize`.
 * If the last frame would be undersized, it extends backward to always
 * show exactly `pageSize` items (borrowing from the previous frame).
 */
export function computeAtlasFrames(entries, pageSize) {
  if (!entries.length) return [];
  if (entries.length <= pageSize) return [entries.slice()];

  const frames = [];
  let i = 0;
  while (i < entries.length) {
    const remaining = entries.length - i;
    if (remaining < pageSize) {
      const newItems = entries.slice(i);
      const borrowed = entries.slice(i - (pageSize - remaining), i)
        .map(e => ({ ...e, _borrowed: true }));
      frames.push([...newItems, ...borrowed]);
      break;
    }
    frames.push(entries.slice(i, i + pageSize));
    i += pageSize;
  }
  return frames;
}
