export function wrapText(value, lineWidth = 60) {
  if (typeof value !== 'string' || !value.trim()) return '';
  return value
    .split(/\r?\n/)
    .map((line) => {
      const words = line.trim().split(/\s+/).filter(Boolean);
      if (!words.length) return '';
      const wrapped = [];
      let current = '';
      for (const word of words) {
        if (!current) { current = word; continue; }
        if (`${current} ${word}`.length <= lineWidth) { current = `${current} ${word}`; continue; }
        wrapped.push(current);
        current = word;
      }
      if (current) wrapped.push(current);
      return wrapped.join('\n');
    })
    .join('\n')
    .trim();
}
