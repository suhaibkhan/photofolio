import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import path from 'node:path';
import { useExif } from '../hooks/useExif.js';
import { ExifPanel } from './ui/ExifPanel.jsx';
import { StepBar } from './ui/StepBar.jsx';
import { KeyHints } from './ui/KeyHints.jsx';
import { ConfirmStep } from './steps/ConfirmStep.jsx';
import { LocationStep } from './steps/LocationStep.jsx';
import { CategoryStep } from './steps/CategoryStep.jsx';
import { CopyStep } from './steps/CopyStep.jsx';
import { FlagsStep } from './steps/FlagsStep.jsx';
import { ReviewStep } from './steps/ReviewStep.jsx';

const STEP_COUNT = 6;

const EMPTY_CHOICES = {
  location:      null,
  locationLabel: null,
  categories:    [],
  title:         '',
  description:   '',
  hero:          false,
  mobileHero:    false,
  featured:      false,
};

export function PhotoWizard({
  root,
  fileName,
  photosDir,
  data,
  onDataChange,
  photoIndex,
  photoTotal,
  onSave,
  onSkip,
}) {
  const absolutePath = path.join(photosDir, fileName);
  const localSrc     = `images/photos/${fileName}`;
  const exifState    = useExif(absolutePath);

  const [step, setStep]       = useState(0);
  const [choices, setChoices] = useState(EMPTY_CHOICES);

  // Reset wizard state when the photo changes
  useEffect(() => {
    setStep(0);
    setChoices(EMPTY_CHOICES);
  }, [fileName]);

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  // Step 0 — Confirm
  function handleConfirm(yes) {
    if (yes) setStep(1); else onSkip();
  }

  // Step 1 — Location
  function handleLocation(locationId, locationLabel) {
    setChoices((c) => ({ ...c, location: locationId, locationLabel }));
    setStep(2);
  }

  // Step 2 — Categories
  function handleCategories(categories) {
    setChoices((c) => ({ ...c, categories }));
    setStep(3);
  }

  // Step 3 — Copy
  function handleCopy(title, description) {
    setChoices((c) => ({ ...c, title, description }));
    setStep(4);
  }

  // Step 4 — Flags
  function handleFlags(flags) {
    setChoices((c) => ({ ...c, ...flags }));
    setStep(5);
  }

  // Step 5 — Save
  function handleSave() {
    const exif = exifState.data;
    const photoEntry = {
      title:       choices.title,
      description: choices.description,
      src:         localSrc,
      width:       exif?.width  ?? 0,
      height:      exif?.height ?? 0,
      location:    choices.location,
      categories:  choices.categories,
      hero:        choices.hero,
      mobileHero:  choices.mobileHero,
      featured:    choices.featured,
      metadata:    exif?.metadata ?? {},
    };
    onSave(photoEntry, choices.locationLabel);
  }

  return (
    <Box flexDirection="column" paddingX={1} paddingY={1}>
      <ExifPanel exifState={exifState} fileName={fileName} />
      <StepBar current={step} total={STEP_COUNT} />

      <Box marginTop={1} marginBottom={1}>
        {step === 0 && <ConfirmStep onConfirm={handleConfirm} />}

        {step === 1 && (
          <LocationStep
            data={data}
            onSelect={handleLocation}
            onBack={goBack}
            onDataChange={onDataChange}
          />
        )}

        {step === 2 && (
          <CategoryStep
            data={data}
            defaultSelected={choices.categories}
            onSubmit={handleCategories}
            onBack={goBack}
            onDataChange={onDataChange}
          />
        )}

        {step === 3 && (
          <CopyStep
            absolutePath={absolutePath}
            fileName={fileName}
            locationLabel={choices.locationLabel}
            categories={choices.categories}
            metadata={exifState.data?.metadata ?? {}}
            onSubmit={handleCopy}
            onBack={goBack}
          />
        )}

        {step === 4 && (
          <FlagsStep
            defaultFlags={choices}
            onSubmit={handleFlags}
            onBack={goBack}
          />
        )}

        {step === 5 && (
          <ReviewStep
            choices={choices}
            locationLabel={choices.locationLabel}
            exifData={exifState.data}
            onSave={handleSave}
            onBack={goBack}
          />
        )}
      </Box>

      <KeyHints />
    </Box>
  );
}
