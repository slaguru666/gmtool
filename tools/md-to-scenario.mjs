#!/usr/bin/env node
// CLI: node tools/md-to-scenario.mjs <input.md> [output.js]
// Reads a structured scenario markdown file and writes a scenario-data JS module
// (to <output.js>, or stdout if omitted). See tools/scenario-md.js for the format.
import { readFileSync, writeFileSync } from 'node:fs';
import { parseScenarioMarkdown, emitScenarioModule } from './scenario-md.js';

const [, , inPath, outPath] = process.argv;
if (!inPath) {
  console.error('Usage: node tools/md-to-scenario.mjs <input.md> [output.js]');
  process.exit(1);
}

let js;
try {
  js = emitScenarioModule(parseScenarioMarkdown(readFileSync(inPath, 'utf8')));
} catch (e) {
  console.error(`Error: ${e.message}`);
  process.exit(1);
}

if (outPath) {
  writeFileSync(outPath, js);
  console.error(`Wrote ${outPath}`);
} else {
  process.stdout.write(js);
}
