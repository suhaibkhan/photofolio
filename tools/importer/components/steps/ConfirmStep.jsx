import React from 'react';
import { Box, Text, useInput } from 'ink';
import { SelectInput } from '../ui/SelectInput.jsx';

const OPTIONS = [
  { value: 'yes', label: 'Import this photo' },
  { value: 'no',  label: 'Skip' },
];

export function ConfirmStep({ onConfirm }) {
  function handleSelect(opt) {
    if (!opt) return; // ← / Esc — nothing to go back to on step 0
    onConfirm(opt.value === 'yes');
  }

  return (
    <Box flexDirection="column">
      <Text bold color="cyan">Include this photo in the import?</Text>
      <Box marginTop={1}>
        <SelectInput options={OPTIONS} onSelect={handleSelect} />
      </Box>
    </Box>
  );
}
