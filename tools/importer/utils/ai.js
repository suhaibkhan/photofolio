import { generateText } from 'ai';
import { createVertex } from '@ai-sdk/google-vertex';
import fs from 'node:fs/promises';

const DEFAULT_MODEL_ID = 'gemini-3-flash-preview';

const SYSTEM_PROMPT = [
  'You are a photography copywriter for travel, nature, and landscape images.',
  'Generate evocative but concise copy from the photo and user notes.',
  'Return ONLY valid JSON with this exact shape:',
  '{"title":"...","description":"..."}',
  'Title rules: 2 to 7 words, no hashtags, no emojis.',
  'Description rules: 1 to 2 sentences, under 220 characters, vivid and grounded.',
].join('\n');

export function createAiModel() {
  const modelId = process.env.LOCAL_PHOTO_AI_MODEL || DEFAULT_MODEL_ID;
  const vertex = createVertex({ apiKey: process.env.GOOGLE_VERTEX_API_KEY });
  return vertex(modelId);
}

export function extractJsonObject(rawText) {
  if (typeof rawText !== 'string' || !rawText.trim()) return null;
  const trimmed = rawText.trim();
  const direct = trimmed.startsWith('{') && trimmed.endsWith('}') ? trimmed : null;
  const candidate = direct || trimmed.match(/\{[\s\S]*\}/)?.[0] || null;
  if (!candidate) return null;
  try { return JSON.parse(candidate); } catch { return null; }
}

function normalizeStr(value, max) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ').slice(0, max);
}

export async function generateAICopy({ model, absolutePath, fileName, userWords, location, categories, metadata, revisionNotes }) {
  const imageBuffer = await fs.readFile(absolutePath);

  const metaContext = [
    metadata?.camera       ? `Camera: ${metadata.camera}`            : null,
    metadata?.focalLength  ? `Focal length: ${metadata.focalLength}` : null,
    metadata?.aperture     ? `Aperture: ${metadata.aperture}`        : null,
    metadata?.shutterSpeed ? `Shutter: ${metadata.shutterSpeed}`     : null,
    metadata?.iso != null  ? `ISO: ${metadata.iso}`                  : null,
  ].filter(Boolean).join(', ');

  const prompt = [
    'Create a title and description for this photo.',
    `Filename: ${fileName}`,
    `Location: ${location || 'Unknown'}`,
    `Categories: ${categories.length ? categories.join(', ') : 'Unspecified'}`,
    metaContext ? `Camera settings: ${metaContext}` : null,
    `Photographer notes: ${userWords || 'No extra notes provided'}`,
    revisionNotes ? `Revision request: ${revisionNotes}` : null,
  ].filter(Boolean).join('\n');

  const result = await generateText({
    model,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image', image: imageBuffer },
        ],
      },
    ],
  });

  const parsed = extractJsonObject(result.text);
  if (!parsed || typeof parsed !== 'object') throw new Error('AI response did not contain valid JSON.');

  const title = normalizeStr(parsed.title, 120);
  const description = normalizeStr(parsed.description, 260);
  if (!title || !description) throw new Error('AI response is missing title or description.');

  return { title, description };
}
