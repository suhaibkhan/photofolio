import fs from 'node:fs/promises';
import path from 'node:path';

export function getDataPath(root) {
  return path.join(root, 'data', 'photos-local.json');
}

export async function readData(dataPath) {
  try {
    await fs.access(dataPath);
  } catch {
    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    await fs.writeFile(
      dataPath,
      JSON.stringify({ locations: [], categories: [], photos: [] }, null, 2) + '\n',
      'utf8'
    );
  }
  const parsed = JSON.parse(await fs.readFile(dataPath, 'utf8'));
  if (!Array.isArray(parsed.locations))  parsed.locations  = [];
  if (!Array.isArray(parsed.categories)) parsed.categories = [];
  if (!Array.isArray(parsed.photos))     parsed.photos     = [];
  return parsed;
}

export async function writeData(dataPath, data) {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}
