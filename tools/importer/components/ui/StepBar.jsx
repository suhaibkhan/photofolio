import React from 'react';
import { Box, Text } from 'ink';

const STEP_LABELS = ['Confirm', 'Location', 'Categories', 'Copy', 'Flags', 'Review'];

export function StepBar({ current, total = STEP_LABELS.length }) {
  return (
    <Box gap={1} marginBottom={1}>
      {Array.from({ length: total }, (_, i) => {
        const done    = i < current;
        const active  = i === current;
        const color   = done ? 'green' : active ? 'cyan' : 'gray';
        const dot     = done ? '●' : active ? '◉' : '○';
        const label   = STEP_LABELS[i] ?? String(i + 1);
        return (
          <Box key={i} gap={0}>
            <Text color={color}>{dot}</Text>
            {active && <Text color="cyan" bold> {label}</Text>}
          </Box>
        );
      })}
    </Box>
  );
}
