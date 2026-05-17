import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import { SelectInput } from '../ui/SelectInput.jsx';
import { Panel } from '../ui/Panel.jsx';
import { generateAICopy, createAiModel } from '../../utils/ai.js';
import { wrapText } from '../../utils/text.js';
import path from 'node:path';

const AI_OPTIONS = [
  { value: 'accept', label: 'Accept — use this title & description' },
  { value: 'refine', label: 'Refine — give feedback and regenerate' },
  { value: 'manual', label: 'Write manually' },
];

const MANUAL_OPTIONS = [
  { value: 'manual', label: 'Write title & description manually' },
];

function Field({ label, placeholder, defaultValue = '', required, onSubmit }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <Box gap={1} marginBottom={1}>
      <Text color="cyan" bold>{label}:</Text>
      <TextInput
        value={value}
        onChange={setValue}
        placeholder={placeholder || ''}
        onSubmit={(v) => {
          if (required && !v.trim()) return;
          onSubmit(v.trim());
        }}
      />
    </Box>
  );
}

export function CopyStep({
  absolutePath, fileName, locationLabel, categories, metadata, onSubmit, onBack,
}) {
  const defaultTitle = path.parse(fileName).name.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  const [mode, setMode] = useState('method'); // method | notes | generating | review | refine-notes | manual-title | manual-desc
  const [useAi, setUseAi] = useState(true);
  const [userNotes, setUserNotes] = useState('');
  const [revisionNotes, setRevisionNotes] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [error, setError] = useState(null);
  const [manualTitle, setManualTitle] = useState('');
  const TEXT_BACK = { notes: 'method', 'manual-title': 'method', 'manual-desc': 'manual-title', 'refine-notes': 'review' };
  useInput((input, key) => {
    if (key.escape && TEXT_BACK[mode]) setMode(TEXT_BACK[mode]);
  });

  const [model] = useState(() => {
    try { return createAiModel(); } catch { return null; }
  });

  // Trigger AI generation
  useEffect(() => {
    if (mode !== 'generating') return;
    let cancelled = false;
    setError(null);

    generateAICopy({
      model,
      absolutePath,
      fileName,
      userWords: userNotes,
      location: locationLabel,
      categories,
      metadata,
      revisionNotes: revisionNotes || undefined,
    })
      .then((result) => {
        if (!cancelled) { setAiResult(result); setMode('review'); }
      })
      .catch((err) => {
        if (!cancelled) { setError(err.message); setMode('ai-error'); }
      });

    return () => { cancelled = true; };
  }, [mode]);

  function handleMethod(opt) {
    if (!opt) { onBack(); return; }
    if (opt.value === 'ai') { setUseAi(true); setMode('notes'); }
    else { setUseAi(false); setMode('manual-title'); }
  }

  function handleAiChoice(opt) {
    if (!opt) { onBack(); return; }
    if (opt.value === 'accept') onSubmit(aiResult.title, aiResult.description);
    else if (opt.value === 'refine') { setRevisionNotes(''); setMode('refine-notes'); }
    else setMode('manual-title');
  }

  if (mode === 'method') {
    return (
      <Box flexDirection="column">
        <Text bold color="cyan">How would you like to write the copy?</Text>
        <Box marginTop={1}>
          <SelectInput
            options={[
              { value: 'ai', label: model ? 'Use AI (Gemini) to generate suggestions' : 'Use AI  (no API key — will fail)' },
              { value: 'manual', label: 'Write manually' },
            ]}
            onSelect={handleMethod}
          />
        </Box>
      </Box>
    );
  }

  if (mode === 'notes') {
    return (
      <Box flexDirection="column">
        <Text bold color="cyan">Notes for the AI</Text>
        <Text dimColor>mood, subject, story, focal point… (press Enter to skip)</Text>
        <Box marginTop={1}>
          <Field
            label="Notes"
            placeholder="optional"
            onSubmit={(v) => { setUserNotes(v); setMode('generating'); }}
          />
        </Box>
      </Box>
    );
  }

  if (mode === 'generating') {
    return (
      <Box gap={1}>
        <Text color="cyan"><Spinner type="dots" /></Text>
        <Text dimColor>{revisionNotes ? 'Regenerating…' : 'Generating AI copy…'}</Text>
      </Box>
    );
  }

  if (mode === 'review' && aiResult) {
    const isRevision = Boolean(revisionNotes);
    const descLines = wrapText(aiResult.description, 56);
    return (
      <Box flexDirection="column">
        <Panel title={isRevision ? '↺ Revised suggestion' : '✦ AI suggestion'} borderColor={isRevision ? 'yellow' : 'green'}>
          <Box flexDirection="column">
            <Text bold color="green">{aiResult.title}</Text>
            <Box marginTop={1}>
              <Text dimColor italic>{descLines}</Text>
            </Box>
          </Box>
        </Panel>
        <SelectInput options={AI_OPTIONS} onSelect={handleAiChoice} />
      </Box>
    );
  }

  if (mode === 'ai-error') {
    return (
      <Box flexDirection="column">
        <Text color="red">✖ AI generation failed</Text>
        <Text dimColor>{error}</Text>
        <Box marginTop={1}>
          <SelectInput
            options={[
              { value: 'retry', label: 'Try again' },
              { value: 'manual', label: 'Write manually instead' },
            ]}
            onSelect={(opt) => {
              if (!opt) { onBack(); return; }
              if (opt.value === 'retry') setMode('generating');
              else setMode('manual-title');
            }}
          />
        </Box>
      </Box>
    );
  }

  if (mode === 'refine-notes') {
    return (
      <Box flexDirection="column">
        <Text bold color="cyan">What should change?</Text>
        <Box marginTop={1}>
          <Field
            label="Feedback"
            placeholder="e.g. make it more dramatic, focus on the light"
            required
            onSubmit={(v) => { setRevisionNotes(v); setMode('generating'); }}
          />
        </Box>
      </Box>
    );
  }

  if (mode === 'manual-title') {
    return (
      <Box flexDirection="column">
        <Text bold color="cyan">Write a title</Text>
        <Text dimColor>2–7 words, no hashtags</Text>
        <Box marginTop={1}>
          <Field
            label="Title"
            defaultValue={defaultTitle}
            required
            onSubmit={(v) => { setManualTitle(v); setMode('manual-desc'); }}
          />
        </Box>
      </Box>
    );
  }

  if (mode === 'manual-desc') {
    return (
      <Box flexDirection="column">
        <Text bold color="cyan">Write a description</Text>
        <Text dimColor>1–2 sentences, under 220 characters</Text>
        <Box marginTop={1}>
          <Field
            label="Description"
            placeholder="optional"
            onSubmit={(v) => onSubmit(manualTitle, v)}
          />
        </Box>
      </Box>
    );
  }

  return null;
}
