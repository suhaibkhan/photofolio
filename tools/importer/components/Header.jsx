import React from 'react';
import { Box, Text } from 'ink';

export function Header({ photoIndex, photoTotal, stepIndex, stepTotal = 6 }) {
  const hasPhoto = photoIndex != null && photoTotal != null;
  return (
    <Box
      borderStyle="single"
      borderColor="cyan"
      borderTop={false}
      borderLeft={false}
      borderRight={false}
      paddingX={1}
      gap={4}
    >
      <Text bold color="cyan">◆ LOCAL PHOTO IMPORTER</Text>
      {hasPhoto && (
        <Text dimColor>
          Photo <Text bold color="cyan">{photoIndex + 1}</Text>
          <Text dimColor>/{photoTotal}</Text>
        </Text>
      )}
      {hasPhoto && stepIndex != null && (
        <Text dimColor>
          Step <Text bold>{stepIndex + 1}</Text>/{stepTotal}
        </Text>
      )}
      <Text dimColor>Suhaib Khan Photography</Text>
    </Box>
  );
}
