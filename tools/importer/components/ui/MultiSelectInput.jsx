import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

// options: [{ value, label }]
// defaultSelected: string[]
export function MultiSelectInput({ options, defaultSelected = [], onSubmit, onBack }) {
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState(new Set(defaultSelected));

  useInput((input, key) => {
    if (key.upArrow) {
      setCursor((c) => Math.max(0, c - 1));
    } else if (key.downArrow) {
      setCursor((c) => Math.min(options.length - 1, c + 1));
    } else if (input === ' ') {
      setSelected((s) => {
        const next = new Set(s);
        const val = options[cursor]?.value;
        if (val == null) return s;
        if (next.has(val)) next.delete(val);
        else next.add(val);
        return next;
      });
    } else if (key.return) {
      onSubmit([...selected]);
    } else if (key.escape || key.leftArrow) {
      onBack?.();
    }
  });

  return (
    <Box flexDirection="column">
      {options.map((opt, i) => {
        const active   = i === cursor;
        const checked  = selected.has(opt.value);
        return (
          <Box key={String(opt.value)} gap={1}>
            <Text color={active ? 'cyan' : undefined}>{active ? '›' : ' '}</Text>
            <Text color={checked ? 'green' : 'gray'}>{checked ? '◆' : '◇'}</Text>
            <Text bold={active}>{opt.label}</Text>
          </Box>
        );
      })}
    </Box>
  );
}
