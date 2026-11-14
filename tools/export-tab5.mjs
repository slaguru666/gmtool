// Usage: npm run export:tab5 -- <outDir>
// Writes <outDir>/director/… for copying to the Tab5's microSD card.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { buildTab5Export } from './tab5-export.js';

const outDir = process.argv[2];
if (!outDir) {
  console.error('usage: node tools/export-tab5.mjs <outDir>');
  process.exit(1);
}
const root = join(resolve(outDir), 'director');
const files = buildTab5Export();
for (const [rel, value] of files) {
  const path = join(root, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n');
}
console.log(`wrote ${files.size} files to ${root}`);
