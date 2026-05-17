import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

// options: [{ value, label, hint? }]
export function SelectInput({ options, onSelect, initialIndex = 0 }) {
  const [cursor, setCursor] = useState(initialIndex);

  useInput((input, key) => {
    if (key.upArrow)    setCursor((c) => Math.max(0, c - 1));
    if (key.downArrow)  setCursor((c) => Math.min(options.length - 1, c + 1));
    if (key.return)     onSelect(options[cursor]);
    if (key.escape || key.leftArrow) onSelect(null);
  });

  return (
    <Box flexDirection="column">
      {options.map((opt, i) => {
        const active = i === cursor;
        return (
          <Box key={String(opt.value)} gap={1}>
            <Text color={active ? 'cyan' : undefined}>{active ? '›' : ' '}</Text>
            <Text bold={active} color={active ? 'cyan' : undefined}>{opt.label}</Text>
            {opt.hint && <Text dimColor>{opt.hint}</Text>}
          </Box>
        );
      })}
      <Box marginTop={1}>
        <Text dimColor>↑↓ move  ·  Enter select  ·  ← back</Text>
      </Box>
    </Box>
  );
}
