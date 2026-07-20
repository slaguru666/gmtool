import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseScenarioMarkdown, emitScenarioModule } from '../../tools/scenario-md.js';
import { validateScenario } from '../../src/core/scenario.js';

const MD = `---
id: demo
title: DEMO
system: coc-d100
players: 4
playMinutes: 210
slot: Sat · Slot 4
---

## Timeline
- [0] The opening {hard} #open
- [35] Interview | cut: summarise the ledger
- [120] The reveal {hard}

## Clues
- The door-cam face {essential} {act: Act One} | fallback: the monologue cards
- A colour detail

## Cast
- MARY FLETCHER — Innkeeper; saw the watchers | secret: she saw Crowe sew
- DANNY TATE — Stable boy, 14
- THE NARRATOR {pc}
`;

// Load the emitted module string as a real ES module value.
async function importModule(js) {
  const url = 'data:text/javascript;base64,' + Buffer.from(js).toString('base64');
  return (await import(url)).default;
}

describe('markdown → scenario-data', () => {
  it('parses frontmatter into meta with numeric coercion', () => {
    const s = parseScenarioMarkdown(MD);
    expect(s.meta).toEqual({ id: 'demo', title: 'DEMO', system: 'coc-d100', players: 4, playMinutes: 210, slot: 'Sat · Slot 4' });
  });

  it('parses timeline beats with minutes, hard triggers, cut hints and ids', () => {
    const { timeline } = parseScenarioMarkdown(MD);
    expect(timeline[0]).toEqual({ id: 'open', label: 'The opening', targetMin: 0, hardTrigger: true });
    expect(timeline[1]).toEqual({ id: 'interview', label: 'Interview', targetMin: 35, cutHint: 'summarise the ledger' });
    expect(timeline[2]).toEqual({ id: 'the-reveal', label: 'The reveal', targetMin: 120, hardTrigger: true });
  });

  it('parses clues with essential / act / fallback and auto-ids', () => {
    const { clues } = parseScenarioMarkdown(MD);
    expect(clues[0]).toEqual({ id: 'the-door-cam-face', label: 'The door-cam face', essential: true, act: 'Act One', fallback: 'the monologue cards' });
    expect(clues[1]).toEqual({ id: 'a-colour-detail', label: 'A colour detail', essential: false });
  });

  it('parses cast with name/note/secret and pc/npc kind', () => {
    const { cast } = parseScenarioMarkdown(MD);
    expect(cast[0]).toEqual({ id: 'mary-fletcher', name: 'MARY FLETCHER', kind: 'npc', note: 'Innkeeper; saw the watchers', secret: 'she saw Crowe sew' });
    expect(cast[1]).toEqual({ id: 'danny-tate', name: 'DANNY TATE', kind: 'npc', note: 'Stable boy, 14' });
    expect(cast[2]).toEqual({ id: 'the-narrator', name: 'THE NARRATOR', kind: 'pc' });
  });

  it('produces a module that validates and round-trips back to the same data', async () => {
    const parsed = parseScenarioMarkdown(MD);
    const js = emitScenarioModule(parsed);
    const mod = await importModule(js);
    expect(validateScenario(mod)).toEqual([]);
    expect(mod).toEqual(parsed);
  });

  it('dedupes ids derived from identical labels', () => {
    const s = parseScenarioMarkdown(`---
id: dup
system: year-zero
---
## Timeline
- [0] Beat
- [10] Beat
`);
    expect(s.timeline.map((b) => b.id)).toEqual(['beat', 'beat-2']);
  });

  it('throws on missing frontmatter and on an empty timeline', () => {
    expect(() => parseScenarioMarkdown('## Timeline\n- [0] x')).toThrow(/frontmatter/);
    expect(() => parseScenarioMarkdown('---\nid: x\nsystem: year-zero\n---\n')).toThrow(/invalid scenario/);
  });

  it('regenerates the shipped example markdown into a valid module', async () => {
    const md = readFileSync('tools/example-scenario.md', 'utf8'); // vitest runs from repo root
    const mod = await importModule(emitScenarioModule(parseScenarioMarkdown(md)));
    expect(validateScenario(mod)).toEqual([]);
    expect(mod.meta.id).toBe('example-md');
    expect(mod.timeline).toHaveLength(4);
    expect(mod.clues.filter((c) => c.essential)).toHaveLength(2);
    expect(mod.cast).toHaveLength(2);
  });
});
