import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { MultiSelectInput } from '../ui/MultiSelectInput.jsx';
import { SelectInput } from '../ui/SelectInput.jsx';
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

const ADD_MORE_OPTIONS = [
  { value: 'yes', label: '+ Add another category' },
  { value: 'no',  label: 'Done' },
];

export function CategoryStep({ data, defaultSelected = [], onSubmit, onBack, onDataChange }) {
  const [mode, setMode] = useState(data.categories.length > 0 ? 'multiselect' : 'add-prompt');
  const [chosen, setChosen] = useState(new Set(defaultSelected));
  const [formDraft, setFormDraft] = useState({});
  const [formStep, setFormStep] = useState('name');

  const catOptions = data.categories.map((c) => ({ value: c.id, label: c.name }));

  function handleMultiSubmit(ids) {
    setChosen(new Set(ids));
    setMode('add-prompt');
  }

  function handleAddMore(opt) {
    if (!opt) { onBack(); return; }
    if (opt.value === 'yes') {
      setFormDraft({});
      setFormStep('name');
      setMode('form-name');
    } else {
      onSubmit([...chosen]);
    }
  }

  function handleFormName(name) {
    setFormDraft({ name });
    setFormStep('id');
    setMode('form-id');
  }

  function handleFormId(raw) {
    const existingIds = new Set(data.categories.map((c) => c.id));
    const auto = uniqueSlug(slugify(formDraft.name) || 'category', existingIds);
    const id = uniqueSlug(slugify(raw) || auto, existingIds);
    setFormDraft((d) => ({ ...d, id }));
    setFormStep('desc');
    setMode('form-desc');
  }

  function handleFormDesc(description) {
    const newCat = { ...formDraft, description };
    onDataChange((prev) => ({ ...prev, categories: [...prev.categories, newCat] }));
    setChosen((s) => new Set([...s, newCat.id]));
    setMode('add-prompt');
  }

  if (mode === 'multiselect') {
    return (
      <Box flexDirection="column">
        <Text bold color="cyan">Select categories</Text>
        <Box marginTop={1}>
          <MultiSelectInput
            options={catOptions}
            defaultSelected={[...chosen]}
            onSubmit={handleMultiSubmit}
            onBack={onBack}
          />
        </Box>
      </Box>
    );
  }

  if (mode === 'add-prompt') {
    return (
      <Box flexDirection="column">
        <Text bold color="cyan">Categories selected: </Text>
        <Text color="green">{[...chosen].join(', ') || 'none'}</Text>
        <Box marginTop={1}>
          <SelectInput options={ADD_MORE_OPTIONS} onSelect={handleAddMore} />
        </Box>
      </Box>
    );
  }

  if (mode === 'add-new-prompt') {
    return (
      <Box flexDirection="column">
        <Text bold color="cyan">No categories yet — add one?</Text>
        <Box marginTop={1}>
          <SelectInput
            options={[{ value: 'yes', label: 'Add a new category' }, { value: 'no', label: 'Skip' }]}
            onSelect={(opt) => {
              if (!opt) { onBack(); return; }
              if (opt.value === 'yes') { setFormDraft({}); setFormStep('name'); setMode('form-name'); }
              else onSubmit([]);
            }}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text bold color="cyan">New category</Text>
      <Box marginTop={1} flexDirection="column">
        {mode === 'form-name' && (
          <Field label="Name" required placeholder="e.g. Golden Hour" onSubmit={handleFormName} />
        )}
        {mode === 'form-id' && (
          <Field label="Slug (id)" placeholder={`auto: ${slugify(formDraft.name) || 'category'}`} onSubmit={handleFormId} />
        )}
        {mode === 'form-desc' && (
          <Field label="Description" placeholder="optional" onSubmit={handleFormDesc} />
        )}
      </Box>
    </Box>
  );
}
