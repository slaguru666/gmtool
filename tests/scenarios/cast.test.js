import { describe, it, expect } from 'vitest';
import continuum from '../../src/con/continuum-2026.js';
import { getScenario } from '../../src/scenarios/index.js';

const scenarios = continuum.slots.map((s) => getScenario(s.scenarioId));

describe('ported cast rosters', () => {
  it('every Continuum scenario has a non-empty cast', () => {
    for (const sc of scenarios) {
      expect(sc.cast.length, sc.meta.id).toBeGreaterThan(0);
    }
  });

  it('cast entries are well-formed with unique ids and a valid kind', () => {
    for (const sc of scenarios) {
      const ids = sc.cast.map((c) => c.id);
      expect(new Set(ids).size, sc.meta.id + ' unique ids').toBe(ids.length);
      for (const c of sc.cast) {
        expect(typeof c.id, sc.meta.id).toBe('string');
        expect(c.id.length, sc.meta.id).toBeGreaterThan(0);
        expect(typeof c.name, sc.meta.id).toBe('string');
        expect(c.name.length, sc.meta.id).toBeGreaterThan(0);
        expect(['pc', 'npc'], sc.meta.id + ' ' + c.id).toContain(c.kind);
      }
    }
  });
});
