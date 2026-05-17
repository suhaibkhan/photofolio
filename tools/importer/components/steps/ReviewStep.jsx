import React from 'react';
import { Box, Text } from 'ink';
import { SelectInput } from '../ui/SelectInput.jsx';
import { Panel } from '../ui/Panel.jsx';
import { wrapText } from '../../utils/text.js';

const OPTIONS = [
  { value: 'save', label: 'Save & continue' },
  { value: 'back', label: '← Edit (go back to flags)' },
];

function Flag({ label, value }) {
  return (
    <Box gap={1}>
      <Text dimColor>{label.padEnd(14)}</Text>
      <Text color={value ? 'green' : 'gray'}>{value ? 'Yes' : 'No'}</Text>
    </Box>
  );
}

export function ReviewStep({ choices, locationLabel, exifData, onSave, onBack }) {
  const cats = choices.categories.length ? choices.categories.join(', ') : '—';
  const descLines = choices.description ? wrapText(choices.description, 52) : '—';

  function handleSelect(opt) {
    if (!opt || opt.value === 'back') { onBack(); return; }
    onSave();
  }

  return (
    <Box flexDirection="column">
      <Panel title="Review" borderColor="yellow" marginBottom={1}>
        <Box flexDirection="column">
          <Box>
            <Text dimColor>{'Title'.padEnd(14)}</Text>
            <Text bold color="cyan">{choices.title || '—'}</Text>
          </Box>
          <Box>
            <Text dimColor>{'Description'.padEnd(14)}</Text>
            <Text>{descLines}</Text>
          </Box>
          <Box>
            <Text dimColor>{'Location'.padEnd(14)}</Text>
            <Text>{locationLabel || choices.location || '—'}</Text>
          </Box>
          <Box>
            <Text dimColor>{'Categories'.padEnd(14)}</Text>
            <Text>{cats}</Text>
          </Box>
          {exifData && (
            <Box>
              <Text dimColor>{'Dimensions'.padEnd(14)}</Text>
              <Text>{exifData.width} × {exifData.height}</Text>
            </Box>
          )}
          <Flag label="Hero" value={choices.hero} />
          <Flag label="Mobile hero" value={choices.mobileHero} />
          <Flag label="Featured" value={choices.featured} />
        </Box>
      </Panel>
      <SelectInput options={OPTIONS} onSelect={handleSelect} />
    </Box>
  );
}
