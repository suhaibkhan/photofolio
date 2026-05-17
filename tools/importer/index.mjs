#!/usr/bin/env node
import process from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenvFlow from 'dotenv-flow';
import React from 'react';
import { render } from 'ink';
import App from './app.jsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..', '..');

dotenvFlow.config();

const startCompress = process.argv.includes('--compress');
const force         = process.argv.includes('--force');

process.stdout.write('\x1B[?1049h\x1B[H');

function cleanup() { process.stdout.write('\x1B[?1049l'); }
process.on('exit', cleanup);
process.on('SIGTERM', () => { cleanup(); process.exit(0); });

const { waitUntilExit } = render(
  React.createElement(App, { root: ROOT, startCompress, force }),
  { exitOnCtrlC: true }
);

await waitUntilExit().catch(() => {});
