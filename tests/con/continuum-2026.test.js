import { describe, it, expect } from 'vitest';
import continuum from '../../src/con/continuum-2026.js';
import { getScenario } from '../../src/scenarios/index.js';
import { validateScenario } from '../../src/core/scenario.js';
import { getRulePack } from '../../src/dice/rulepacks/index.js';
import { analyzeSchedule } from '../../src/con/schedule.js';

describe('Continuum 2026 con', () => {
  it('lists the six ported slots', () => {
    expect(continuum.slots).toHaveLength(6);
    expect(continuum.slots.every((s) => s.scenarioId)).toBe(true);
  });

  it('every slot deep-links to a valid scenario with a known dice pack', () => {
    for (const slot of continuum.slots) {
      const scenario = getScenario(slot.scenarioId);
      expect(scenario, slot.scenarioId).not.toBe(null);
      expect(validateScenario(scenario), slot.scenarioId).toEqual([]);
      expect(getRulePack(scenario.meta.system), scenario.meta.system).not.toBe(null);
    }
  });

  it('marks the right slot live / next during the convention', () => {
    // Sat 25 July, 15:00 local — the Vain Crown slot (14:00–18:00) is running.
    // Parsing now with the same local (no-Z) format as the slots keeps this
    // assertion timezone-independent.
    const r = analyzeSchedule(continuum.slots, Date.parse('2026-07-25T15:00:00'));
    expect(r.liveNow?.scenarioId).toBe('vain-crown');
    expect(r.upNext?.scenarioId).toBe('silvery-moon');
    const byId = Object.fromEntries(r.slots.map((s) => [s.scenarioId, s.status]));
    expect(byId['day-one']).toBe('done');
    expect(byId.afterimage).toBe('done');
    expect(byId.chopper).toBe('upcoming');
  });
});
