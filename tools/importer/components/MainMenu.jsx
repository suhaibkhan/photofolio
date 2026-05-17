import React from 'react';
import { Box, Text } from 'ink';
import { SelectInput } from './ui/SelectInput.jsx';

export function MainMenu({ newPhotoCount, onSelect }) {
  const options = [
    {
      value: 'import',
      label: 'Import new photos',
      hint: newPhotoCount > 0
        ? `${newPhotoCount} new file${newPhotoCount !== 1 ? 's' : ''} ready`
        : 'no new files detected',
    },
    {
      value: 'compress',
      label: 'Compress images',
      hint: 'generate WebP covers + hero (skip up-to-date)',
    },
  ];

  return (
    <Box flexDirection="column" paddingX={1} paddingTop={1}>
      <Text bold color="cyan">What would you like to do?</Text>
      <Box marginTop={1}>
        <SelectInput options={options} onSelect={(opt) => opt && onSelect(opt.value)} />
      </Box>
    </Box>
  );
}
