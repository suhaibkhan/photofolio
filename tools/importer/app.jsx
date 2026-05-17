import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { KeyHints } from './components/ui/KeyHints.jsx';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getDataPath, readData, writeData } from './hooks/dataFile.js';
import { Header } from './components/Header.jsx';
import { MainMenu } from './components/MainMenu.jsx';
import { LightroomSync } from './components/LightroomSync.jsx';
import { PhotoWizard } from './components/PhotoWizard.jsx';
import { SummaryScreen } from './components/SummaryScreen.jsx';
import { CompressScreen } from './components/CompressScreen.jsx';

function NoPhotosScreen({ onBack }) {
  useInput((input, key) => {
    if (key.escape || key.leftArrow || key.return) onBack();
  });
  return (
    <Box flexDirection="column">
      <Box padding={1} flexDirection="column">
        <Text>No new photos found in <Text bold>public/images/photos/</Text></Text>
        <Text dimColor>Add photos to that folder and re-run import.</Text>
      </Box>
      <KeyHints hints={[{ key: 'Esc', label: 'back to menu' }, { key: '^C', label: 'quit' }]} />
    </Box>
  );
}

const PHOTOS_DIR_REL = path.join('public', 'images', 'photos');
const LIGHTROOM_DIR  = '/Users/suhaibkhan/Pictures/Lightroom Catalogs/Lightroom Exports/Web';
const SUPPORTED      = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.heic']);

function findNewFiles(files, data) {
  const existingSrc  = new Set(data.photos.map((p) => p.src));
  const existingBase = new Set(data.photos.map((p) => p.src).filter(Boolean).map((s) => path.basename(s)));
  return files.filter((name) => {
    const relSrc = `images/photos/${name}`;
    return !existingSrc.has(relSrc) && !existingBase.has(name);
  });
}

async function scanPhotos(photosDir, data) {
  try {
    const entries = await fs.readdir(photosDir, { withFileTypes: true });
    const files = entries
      .filter((e) => e.isFile() && SUPPORTED.has(path.extname(e.name).toLowerCase()))
      .map((e) => e.name)
      .sort((a, b) => a.localeCompare(b));
    return findNewFiles(files, data);
  } catch {
    return [];
  }
}

// phases: loading | menu | lightroom | wizard | summary | compress | done
export default function App({ root, startCompress = false, force = false }) {
  const { exit } = useApp();
  const dataPath  = useMemo(() => getDataPath(root), [root]);
  const photosDir = useMemo(() => path.join(root, PHOTOS_DIR_REL), [root]);

  const [phase, setPhase]              = useState('loading');
  const [data, setDataRaw]             = useState(null);
  const [newFiles, setNewFiles]         = useState([]);
  const [photoIndex, setPhotoIndex]     = useState(0);
  const [addedPhotos, setAddedPhotos]   = useState([]);
  const [hasLightroom, setHasLightroom] = useState(false);
  const [loadError, setLoadError]       = useState(null);

  const setData = useCallback((updater) => {
    setDataRaw((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      writeData(dataPath, next).catch(() => {});
      return next;
    });
  }, [dataPath]);

  // Initial load
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const lrExists = await fs.access(LIGHTROOM_DIR).then(() => true).catch(() => false);
        const loaded   = await readData(dataPath);
        const files    = await scanPhotos(photosDir, loaded);
        if (!cancelled) {
          setDataRaw(loaded);
          setNewFiles(files);
          setHasLightroom(lrExists);
          setPhase(startCompress ? 'compress' : 'menu');
        }
      } catch (err) {
        if (!cancelled) setLoadError(err.message);
      }
    }
    init();
    return () => { cancelled = true; };
  }, []);

  const handleMenuSelect = useCallback((choice) => {
    if (choice === 'import') {
      if (hasLightroom)            setPhase('lightroom');
      else if (newFiles.length > 0) setPhase('wizard');
      // else: stay on menu — hint already shows "no new files detected"
    } else {
      setPhase('compress');
    }
  }, [hasLightroom, newFiles.length]);

  const handlePhotoSaved = useCallback((photoEntry, locationLabel) => {
    setData((prev) => ({ ...prev, photos: [...prev.photos, photoEntry] }));
    setAddedPhotos((prev) => [...prev, { ...photoEntry, locationLabel }]);
    setPhotoIndex((prev) => {
      const next = prev + 1;
      if (next < newFiles.length) return next;
      setPhase('summary');
      return prev;
    });
  }, [setData, newFiles.length]);

  const handlePhotoSkipped = useCallback(() => {
    setPhotoIndex((prev) => {
      const next = prev + 1;
      if (next < newFiles.length) return next;
      setPhase(addedPhotos.length > 0 ? 'summary' : 'menu');
      return prev;
    });
  }, [newFiles.length, addedPhotos.length]);

  const handleLightroomDone = useCallback(async () => {
    const loaded = await readData(dataPath);
    const files  = await scanPhotos(photosDir, loaded);
    setDataRaw(loaded);
    setNewFiles(files);
    setPhase(files.length > 0 ? 'wizard' : 'menu');
  }, [dataPath, photosDir]);

  const handleLightroomSkip = useCallback(() => {
    setPhase('wizard');
  }, []);

  const handleLightroomBack = useCallback(() => {
    setPhase('menu');
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────────

  if (loadError) {
    return (
      <Box padding={1} flexDirection="column">
        <Text color="red" bold>✖ Failed to load</Text>
        <Text dimColor>{loadError}</Text>
      </Box>
    );
  }

  if (phase === 'loading') {
    return <Box padding={1}><Text dimColor>Initializing…</Text></Box>;
  }

  if (phase === 'menu') {
    return (
      <Box flexDirection="column">
        <Header />
        <MainMenu newPhotoCount={newFiles.length} onSelect={handleMenuSelect} />
      </Box>
    );
  }

  if (phase === 'lightroom') {
    return (
      <Box flexDirection="column">
        <Header />
        <LightroomSync
          lightroomDir={LIGHTROOM_DIR}
          photosDir={photosDir}
          onDone={handleLightroomDone}
          onSkip={handleLightroomSkip}
          onBack={handleLightroomBack}
        />
      </Box>
    );
  }

  if (phase === 'wizard' && newFiles.length === 0) {
    return (
      <Box flexDirection="column">
        <Header />
        <NoPhotosScreen onBack={() => setPhase('menu')} />
      </Box>
    );
  }

  if (phase === 'wizard') {
    return (
      <Box flexDirection="column">
        <Header photoIndex={photoIndex} photoTotal={newFiles.length} />
        <PhotoWizard
          root={root}
          fileName={newFiles[photoIndex]}
          photosDir={photosDir}
          data={data}
          onDataChange={setData}
          photoIndex={photoIndex}
          photoTotal={newFiles.length}
          onSave={handlePhotoSaved}
          onSkip={handlePhotoSkipped}
        />
      </Box>
    );
  }

  if (phase === 'summary') {
    return (
      <Box flexDirection="column">
        <Header />
        <SummaryScreen
          addedPhotos={addedPhotos}
          dataPath={dataPath}
          root={root}
          onCompress={() => setPhase('compress')}
          onDone={exit}
        />
      </Box>
    );
  }

  if (phase === 'compress') {
    return (
      <Box flexDirection="column">
        <Header />
        <CompressScreen root={root} force={force} onDone={() => setPhase('menu')} />
      </Box>
    );
  }

  return null;
}
