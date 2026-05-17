import React from 'react';
import { Box, Text } from 'ink';
import path from 'node:path';
import { Panel } from './ui/Panel.jsx';
import { SelectInput } from './ui/SelectInput.jsx';

const OPTIONS = [
  { value: 'compress', label: 'Compress images now  (generate WebP covers & hero)' },
  { value: 'done',     label: 'Exit' },
];

export function SummaryScreen({ addedPhotos, dataPath, root, onCompress, onDone }) {
  function handleSelect(opt) {
    if (!opt || opt.value === 'done') onDone();
    else onCompress();
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Panel
        title={` ${addedPhotos.length} Photo${addedPhotos.length !== 1 ? 's' : ''} Imported `}
        borderColor="green"
      >
        <Box flexDirection="column">
          {addedPhotos.map((photo, i) => (
            <Box key={i} gap={2}>
              <Text color="green">✓</Text>
              <Text bold>{photo.title}</Text>
              <Text dimColor>{photo.locationLabel}</Text>
              {photo.categories?.length > 0 && (
                <Text dimColor>· {photo.categories.join(', ')}</Text>
              )}
            </Box>
          ))}
        </Box>
      </Panel>
      <Box marginBottom={1}>
        <Text dimColor>Saved → </Text>
        <Text>{path.relative(root, dataPath)}</Text>
      </Box>
      <SelectInput options={OPTIONS} onSelect={handleSelect} />
    </Box>
  );
}
