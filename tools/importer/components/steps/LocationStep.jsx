import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { SelectInput } from '../ui/SelectInput.jsx';
import { Panel } from '../ui/Panel.jsx';
import { slugify, uniqueSlug } from '../../utils/slug.js';

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

export function LocationStep({ data, onSelect, onBack, onDataChange }) {
  const [mode, setMode] = useState('select'); // 'select' | 'form-name' | 'form-shortname' | 'form-id' | 'form-desc'
  const [draft, setDraft] = useState({});

  useInput((input, key) => {
    if (key.escape && mode !== 'select') setMode('select');
  });

  const existingOptions = data.locations.map((loc) => ({
    value: loc.id,
    label: loc.name,
    hint: loc.shortName !== loc.name ? loc.shortName : undefined,
  }));
  const allOptions = [
    ...existingOptions,
    { value: '__new__', label: '+ Add new location…' },
  ];

  function handleSelectOption(opt) {
    if (!opt) { onBack(); return; }
    if (opt.value === '__new__') {
      setMode('form-name');
      return;
    }
    const loc = data.locations.find((l) => l.id === opt.value);
    onSelect(loc.id, loc.shortName || loc.name);
  }

  function handleName(name) {
    setDraft({ name });
    setMode('form-shortname');
  }

  function handleShortName(shortName) {
    setDraft((d) => ({ ...d, shortName: shortName || d.name }));
    setMode('form-id');
  }

  function handleId(raw) {
    const existingIds = new Set(data.locations.map((l) => l.id));
    const auto = uniqueSlug(slugify(draft.name) || 'location', existingIds);
    const id = uniqueSlug(slugify(raw) || auto, existingIds);
    setDraft((d) => ({ ...d, id }));
    setMode('form-desc');
  }

  function handleDesc(description) {
    const newLoc = { ...draft, description };
    onDataChange((prev) => ({ ...prev, locations: [...prev.locations, newLoc] }));
    onSelect(newLoc.id, newLoc.shortName || newLoc.name);
  }

  if (mode === 'select') {
    return (
      <Box flexDirection="column">
        <Text bold color="cyan">Select a location</Text>
        <Box marginTop={1}>
          <SelectInput options={allOptions} onSelect={handleSelectOption} />
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text bold color="cyan">New location</Text>
      <Box marginTop={1} flexDirection="column">
        {mode === 'form-name' && (
          <Field label="Name" required placeholder="e.g. Santorini, Greece" onSubmit={handleName} />
        )}
        {mode === 'form-shortname' && (
          <Field label="Short name" placeholder={`e.g. ${draft.name} (leave blank to use name)`} onSubmit={handleShortName} />
        )}
        {mode === 'form-id' && (
          <Field label="Slug (id)" placeholder={`auto: ${slugify(draft.name) || 'location'} (leave blank)`} onSubmit={handleId} />
        )}
        {mode === 'form-desc' && (
          <Field label="Description" placeholder="optional" onSubmit={handleDesc} />
        )}
      </Box>
      {draft.name && (
        <Panel title="Preview" borderColor="blue" marginTop={1}>
          <Box flexDirection="column">
            <Text dimColor>{'Name'.padEnd(12)}</Text><Text>{draft.name}</Text>
            {draft.shortName && draft.shortName !== draft.name && (
              <><Text dimColor>{'Short name'.padEnd(12)}</Text><Text>{draft.shortName}</Text></>
            )}
          </Box>
        </Panel>
      )}
    </Box>
  );
}
