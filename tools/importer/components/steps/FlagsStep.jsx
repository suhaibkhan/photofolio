import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

const FLAGS = [
  { key: 'hero',       label: 'Desktop hero slideshow' },
  { key: 'mobileHero', label: 'Mobile hero slideshow' },
  { key: 'featured',   label: 'Featured frame section' },
];

export function FlagsStep({ defaultFlags = {}, onSubmit, onBack }) {
  const [cursor, setCursor] = useState(0);
  const [flags, setFlags] = useState({
    hero:       defaultFlags.hero       ?? false,
    mobileHero: defaultFlags.mobileHero ?? false,
    featured:   defaultFlags.featured   ?? false,
  });

  useInput((input, key) => {
    if (key.upArrow)    setCursor((c) => Math.max(0, c - 1));
    if (key.downArrow)  setCursor((c) => Math.min(FLAGS.length - 1, c + 1));
    if (input === ' ') {
      const flagKey = FLAGS[cursor].key;
      setFlags((f) => ({ ...f, [flagKey]: !f[flagKey] }));
    }
    if (key.return)  onSubmit(flags);
    if (key.escape || key.leftArrow) onBack();
  });

  return (
    <Box flexDirection="column">
      <Text bold color="cyan">Slideshow & featured flags</Text>
      <Box marginTop={1} flexDirection="column">
        {FLAGS.map(({ key, label }, i) => {
          const active  = i === cursor;
          const checked = flags[key];
          return (
            <Box key={key} gap={1}>
              <Text color={active ? 'cyan' : undefined}>{active ? '›' : ' '}</Text>
              <Text color={checked ? 'green' : 'gray'}>{checked ? '◆' : '◇'}</Text>
              <Text bold={active}>{label}</Text>
            </Box>
          );
        })}
      </Box>
      <Box marginTop={1}>
        <Text dimColor>↑↓ move  ·  Space toggle  ·  Enter confirm  ·  ← back</Text>
      </Box>
    </Box>
  );
}
