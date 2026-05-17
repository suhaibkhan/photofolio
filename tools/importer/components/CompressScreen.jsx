import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import Spinner from 'ink-spinner';
import path from 'node:path';
import fs from 'node:fs/promises';
import {
  PASSES, formatBytes, collectCoverSources, collectHeroSources,
  compressPhoto, compressLogo,
} from '../utils/compress.js';
import { readData } from '../hooks/dataFile.js';
import { getDataPath } from '../hooks/dataFile.js';
import { Panel } from './ui/Panel.jsx';

function statusIcon(status) {
  if (status === 'compressed') return <Text color="green">✓</Text>;
  if (status === 'skipped')    return <Text dimColor>○</Text>;
  return <Text color="red">✖</Text>;
}

function PassSummary({ label, results }) {
  if (!results.length) return null;
  const compressed = results.filter((r) => r.status === 'compressed').length;
  const skipped    = results.filter((r) => r.status === 'skipped').length;
  const missing    = results.filter((r) => r.status === 'missing').length;
  const totalSrc   = results.reduce((s, r) => s + r.sourceSize, 0);
  const totalWebp  = results.reduce((s, r) => s + r.webpSize, 0);
  const savings    = totalSrc > 0 ? ((1 - totalWebp / totalSrc) * 100).toFixed(1) : null;

  return (
    <Panel title={label} borderColor="green" marginBottom={1}>
      <Box gap={3}>
        <Text><Text color="green">✓</Text> {compressed} compressed</Text>
        <Text><Text dimColor>○</Text> {skipped} skipped</Text>
        {missing > 0 && <Text><Text color="red">✖</Text> {missing} missing</Text>}
        {savings && <Text color="green">−{savings}%</Text>}
      </Box>
      <Box gap={2} marginTop={0}>
        <Text dimColor>{formatBytes(totalSrc)} → {formatBytes(totalWebp)}</Text>
      </Box>
    </Panel>
  );
}

export function CompressScreen({ root, force, onDone }) {
  const { exit } = useApp();
  const [phase, setPhase]           = useState('loading');
  const [currentFile, setCurrentFile] = useState('');
  const [coverResults, setCoverResults] = useState([]);
  const [heroResults, setHeroResults]   = useState([]);
  const [logoResult, setLogoResult]     = useState(null);
  const [sources, setSources]           = useState(null);
  const [error, setError]               = useState(null);

  useInput((input, key) => {
    if (phase === 'done' || phase === 'error') {
      if (input === 'q') exit();
      else if (key.return || key.escape || key.leftArrow) onDone();
    }
  });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const dataPath  = getDataPath(root);
        const data      = await readData(dataPath);
        const coverSrcs = collectCoverSources(data);
        const heroSrcs  = collectHeroSources(data);

        const coversDir = path.join(root, 'public', PASSES.covers.subDir);
        const heroDir   = path.join(root, 'public', PASSES.hero.subDir);
        await Promise.all([
          fs.mkdir(coversDir, { recursive: true }),
          fs.mkdir(heroDir,   { recursive: true }),
        ]);

        if (!cancelled) {
          setSources({ covers: coverSrcs, hero: heroSrcs });
          setPhase('covers');
        }

        // Pass 1: covers
        for (const src of coverSrcs) {
          if (cancelled) return;
          setCurrentFile(src);
          const result = await compressPhoto(root, src, PASSES.covers, force);
          if (!cancelled) setCoverResults((prev) => [...prev, result]);
        }

        // Pass 2: hero
        if (!cancelled) setPhase('hero');
        for (const src of heroSrcs) {
          if (cancelled) return;
          setCurrentFile(src);
          const result = await compressPhoto(root, src, PASSES.hero, force);
          if (!cancelled) setHeroResults((prev) => [...prev, result]);
        }

        // Pass 3: logo
        if (!cancelled) { setPhase('logo'); setCurrentFile('images/logo.png'); }
        const logo = await compressLogo(root, force);
        if (!cancelled) { setLogoResult(logo); setPhase('done'); setCurrentFile(''); }

      } catch (err) {
        if (!cancelled) { setError(err.message); setPhase('error'); }
      }
    }

    run();
    return () => { cancelled = true; };
  }, [root, force]);

  const passLabels = { covers: 'Pass 1/3: Covers', hero: 'Pass 2/3: Hero', logo: 'Pass 3/3: Logo' };
  const isRunning  = phase !== 'done' && phase !== 'error' && phase !== 'loading';

  if (phase === 'loading') {
    return <Box padding={1}><Text dimColor>Loading photo data…</Text></Box>;
  }

  if (phase === 'error') {
    return (
      <Box padding={1} flexDirection="column">
        <Text color="red" bold>✖ Compression failed</Text>
        <Text dimColor>{error}</Text>
        <Box marginTop={1}><Text dimColor>Enter / ← back to menu   q quit</Text></Box>
      </Box>
    );
  }

  const coverTotal = sources?.covers.length ?? 0;
  const heroTotal  = sources?.hero.length   ?? 0;

  return (
    <Box flexDirection="column" paddingX={1} paddingY={1}>
      {/* Completed passes */}
      {(phase === 'hero' || phase === 'logo' || phase === 'done') && (
        <PassSummary
          label={`Covers  (${coverTotal} files)`}
          results={coverResults}
        />
      )}
      {(phase === 'logo' || phase === 'done') && heroTotal > 0 && (
        <PassSummary
          label={`Hero  (${heroTotal} files)`}
          results={heroResults}
        />
      )}
      {phase === 'done' && logoResult && (
        <PassSummary label="Logo" results={[logoResult]} />
      )}

      {/* Active pass */}
      {isRunning && (
        <Box flexDirection="column">
          <Text bold color="cyan">{passLabels[phase]}</Text>
          {phase === 'covers' && (
            <Text dimColor>{coverResults.length}/{coverTotal}</Text>
          )}
          {phase === 'hero' && (
            <Text dimColor>{heroResults.length}/{heroTotal}</Text>
          )}
          <Box marginTop={1} gap={1}>
            <Text color="cyan"><Spinner type="dots" /></Text>
            <Text dimColor>{path.basename(currentFile)}</Text>
          </Box>
          {/* Live tally of current pass */}
          {phase !== 'logo' && (
            <Box gap={3} marginTop={1}>
              <Text>
                <Text color="green">✓</Text>
                {' '}{(phase === 'covers' ? coverResults : heroResults).filter((r) => r.status === 'compressed').length}
              </Text>
              <Text>
                <Text dimColor>○</Text>
                {' '}{(phase === 'covers' ? coverResults : heroResults).filter((r) => r.status === 'skipped').length}
              </Text>
            </Box>
          )}
        </Box>
      )}

      {phase === 'done' && (
        <Box marginTop={1}>
          <Text dimColor>Enter / ← back to menu   q quit</Text>
        </Box>
      )}
    </Box>
  );
}
