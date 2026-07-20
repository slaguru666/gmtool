import { describe, it, expect } from 'vitest';
import { generateNpc } from '../../src/npc/generator.js';

const pack = {
  id: 'test', label: 'Test',
  tables: {
    firstNames: ['A', 'B'], surnames: ['X', 'Y'],
    looks: ['look0', 'look1'], manners: ['man0', 'man1'],
    wants: ['want0', 'want1'], secrets: ['sec0', 'sec1'], voices: ['voi0', 'voi1'],
  },
};
// deterministic rng replaying a fixed sequence
function seq(values) { let i = 0; return () => values[i++ % values.length]; }

describe('generateNpc', () => {
  it('assembles a character by picking from tables with the injected rng', () => {
    // order of picks: firstName, surname, look, manner, wants, secret, voice
    const rng = seq([0.0, 0.9, 0.9, 0.0, 0.9, 0.0, 0.9]);
    const npc = generateNpc(pack, '  nervous foreman  ', rng);
    expect(npc.name).toBe('A Y');       // 0.0->A, 0.9->Y
    expect(npc.look).toBe('look1');     // 0.9
    expect(npc.manner).toBe('man0');    // 0.0
    expect(npc.wants).toBe('want1');    // 0.9
    expect(npc.secret).toBe('sec0');    // 0.0
    expect(npc.voice).toBe('voi1');     // 0.9
    expect(npc.seed).toBe('nervous foreman'); // trimmed, echoed
    expect(npc.genre).toBe('Test');
  });

  it('is fully determined by the rng (same sequence -> same npc)', () => {
    const a = generateNpc(pack, 's', seq([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]));
    const b = generateNpc(pack, 's', seq([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]));
    expect(a).toEqual(b);
  });
});
