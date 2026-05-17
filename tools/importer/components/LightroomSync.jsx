import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import Spinner from 'ink-spinner';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Panel } from './ui/Panel.jsx';
import { MultiSelectInput } from './ui/MultiSelectInput.jsx';
import { KeyHints } from './ui/KeyHints.jsx';

const SUPPORTED = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.heic']);

const HINTS_SCANNING = [
  { key: 'Esc', label: 'back to menu' },
  { key: '^C', label: 'quit' },
];
const HINTS_CONFIRM = [
  { key: '↑↓', label: 'navigate' },
  { key: 'Space', label: 'toggle' },
  { key: 'Enter', label: 'copy selected' },
  { key: 's', label: 'skip' },
  { key: 'Esc', label: 'back' },
];

export function LightroomSync({ lightroomDir, photosDir, onDone, onSkip, onBack }) {
  const [phase, setPhase] = useState('scanning'); // scanning | confirm | copying
  const [newFiles, setNewFiles] = useState([]);
  const [copyStatus, setCopyStatus] = useState('');

  useInput((input, key) => {
    if (phase === 'scanning') {
      if (key.escape || key.leftArrow) onBack?.();
    }
    if (phase === 'confirm') {
      if (input === 's') onSkip?.();
    }
  });

  useEffect(() => {
    let cancelled = false;
    async function scan() {
      try {
        const [lrEntries, destEntries] = await Promise.all([
          fs.readdir(lightroomDir, { withFileTypes: true }),
          fs.readdir(photosDir, { withFileTypes: true }).catch(() => []),
        ]);
        const destNames = new Set(destEntries.filter((e) => e.isFile()).map((e) => e.name));
        const found = lrEntries
          .filter((e) => e.isFile() && SUPPORTED.has(path.extname(e.name).toLowerCase()))
          .map((e) => e.name)
          .filter((n) => !destNames.has(n))
          .sort((a, b) => a.localeCompare(b));
        if (!cancelled) {
          if (found.length > 0) {
            setNewFiles(found);
            setPhase('confirm');
          } else {
            onSkip?.();
          }
        }
      } catch {
        if (!cancelled) onSkip?.();
      }
    }
    scan();
    return () => { cancelled = true; };
  }, [lightroomDir, photosDir]);

  async function handleCopy(selected) {
    if (!selected.length) { onSkip?.(); return; }
    setPhase('copying');
    const copied = [];
    for (let i = 0; i < selected.length; i++) {
      const name = selected[i];
      setCopyStatus(`Copying ${i + 1}/${selected.length}  ${name}`);
      await fs.copyFile(path.join(lightroomDir, name), path.join(photosDir, name));
      copied.push(name);
    }
    onDone(copied);
  }

  if (phase === 'scanning') {
    return (
      <Box flexDirection="column">
        <Box padding={1} gap={1}>
          <Text color="magenta"><Spinner type="dots" /></Text>
          <Text dimColor>Checking Lightroom exports…</Text>
        </Box>
        <KeyHints hints={HINTS_SCANNING} />
      </Box>
    );
  }

  if (phase === 'confirm') {
    const options = newFiles.map((n) => ({ value: n, label: n }));
    return (
      <Box flexDirection="column">
        <Box flexDirection="column" padding={1}>
          <Panel title="Lightroom Exports" borderColor="magenta">
            <Text>
              <Text bold color="magenta">{newFiles.length}</Text>
              <Text dimColor> new file{newFiles.length !== 1 ? 's' : ''} not yet in photos/</Text>
            </Text>
          </Panel>
          <Text bold color="cyan">Select files to copy into public/images/photos/</Text>
          <Box marginTop={1}>
            <MultiSelectInput
              options={options}
              defaultSelected={newFiles}
              onSubmit={handleCopy}
              onBack={() => onBack?.()}
            />
          </Box>
        </Box>
        <KeyHints hints={HINTS_CONFIRM} />
      </Box>
    );
  }

  if (phase === 'copying') {
    return (
      <Box padding={1} gap={1}>
        <Text color="magenta"><Spinner type="dots" /></Text>
        <Text dimColor>{copyStatus}</Text>
      </Box>
    );
  }

  return null;
}
