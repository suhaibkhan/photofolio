import React from 'react';
import { Box, Text } from 'ink';
import { Panel } from './Panel.jsx';

function Row({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <Box>
      <Text dimColor>{label.padEnd(13)}</Text>
      <Text>{String(value)}</Text>
    </Box>
  );
}

export function ExifPanel({ exifState, fileName }) {
  const { loading, error, data } = exifState;
  return (
    <Panel title="EXIF" borderColor="gray" marginBottom={1}>
      <Box flexDirection="column" gap={0}>
        <Row label="File" value={fileName} />
        {loading && <Text dimColor>Reading metadata…</Text>}
        {error && <Text dimColor>Metadata unavailable</Text>}
        {data && (
          <>
            <Row label="Dimensions" value={`${data.width} × ${data.height} px`} />
            <Row label="Camera" value={data.metadata.camera} />
            <Row label="Aperture" value={data.metadata.aperture} />
            <Row label="Shutter" value={data.metadata.shutterSpeed} />
            <Row label="Focal length" value={data.metadata.focalLength} />
            <Row label="ISO" value={data.metadata.iso} />
          </>
        )}
      </Box>
    </Panel>
  );
}
