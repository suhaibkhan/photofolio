import React from 'react';
import { Box, Text } from 'ink';

const DEFAULT_HINTS = [
  { key: '↑↓', label: 'navigate' },
  { key: 'Enter', label: 'select' },
  { key: '←/Esc', label: 'back' },
  { key: '^C', label: 'quit' },
];

export function KeyHints({ hints = DEFAULT_HINTS }) {
  return (
    <Box borderStyle="single" borderColor="gray" borderTop borderBottom={false} borderLeft={false} borderRight={false} paddingX={1} paddingTop={0} gap={4} marginTop={1}>
      {hints.map(({ key, label }) => (
        <Text key={key} dimColor>
          <Text bold>{key}</Text>
          {' '}{label}
        </Text>
      ))}
    </Box>
  );
}
