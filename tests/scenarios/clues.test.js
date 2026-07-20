import { describe, it, expect } from 'vitest';
import continuum from '../../src/con/continuum-2026.js';
import { getScenario } from '../../src/scenarios/index.js';
import { analyzeClues } from '../../src/clues/safety-net.js';

const scenarios = continuum.slots.map((s) => getScenario(s.scenarioId));

describe('ported clue trails', () => {
  it('every Continuum scenario has a non-empty clue trail', () => {
    for (const sc of scenarios) {
      expect(sc.clues.length, sc.meta.id).toBeGreaterThan(0);
    }
  });

  it('clues are well-formed with unique ids and at least one essential', () => {
    for (const sc of scenarios) {
      const ids = sc.clues.map((c) => c.id);
      expect(new Set(ids).size, sc.meta.id + ' unique ids').toBe(ids.length);
      for (const c of sc.clues) {
        expect(typeof c.label, sc.meta.id).toBe('string');
        expect(c.label.length, sc.meta.id).toBeGreaterThan(0);
        expect(typeof c.essential, sc.meta.id).toBe('boolean');
      }
      expect(sc.clues.some((c) => c.essential), sc.meta.id + ' has essentials').toBe(true);
    }
  });

  it('the safety-net reads each trail: unsolved cold, solvable once essentials revealed', () => {
    for (const sc of scenarios) {
      const cold = analyzeClues(sc.clues, []);
      expect(cold.solvable, sc.meta.id).toBe(false);
      const essentialIds = sc.clues.filter((c) => c.essential).map((c) => c.id);
      const warm = analyzeClues(sc.clues, essentialIds);
      expect(warm.solvable, sc.meta.id).toBe(true);
      expect(warm.missingEssential, sc.meta.id).toEqual([]);
    }
  });

  it('missing essentials still carry their fallback where authored', () => {
    // day-one c2 is an essential clue with a fallback.
    const dayOne = getScenario('day-one');
    const r = analyzeClues(dayOne.clues, []);
    const c2 = r.missingEssential.find((c) => c.id === 'c2');
    expect(c2.fallback).toContain('radio crackles');
  });
});
