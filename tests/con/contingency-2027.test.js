import { describe, it, expect } from 'vitest';
import contingency from '../../src/con/contingency-2027.js';
import { getScenario } from '../../src/scenarios/index.js';
import { validateScenario } from '../../src/core/scenario.js';
import { getRulePack } from '../../src/dice/rulepacks/index.js';
import { analyzeSchedule } from '../../src/con/schedule.js';

// PROVENANCE runs Outgunned Adventure, which has no dice pack yet: the
// Director falls back to plain dice (no verdict) for it.
const NO_PACK_YET = new Set(['outgunned']);

describe('Contingency 2027 con', () => {
  it('lists the twelve games, each linked to a scenario', () => {
    expect(contingency.slots).toHaveLength(12);
    expect(contingency.slots.every((s) => s.scenarioId)).toBe(true);
    expect(new Set(contingency.slots.map((s) => s.id)).size).toBe(12);
  });

  it('every slot deep-links to a valid scenario with a known dice pack (bar Outgunned)', () => {
    for (const slot of contingency.slots) {
      const scenario = getScenario(slot.scenarioId);
      expect(scenario, slot.scenarioId).not.toBe(null);
      expect(validateScenario(scenario), slot.scenarioId).toEqual([]);
      if (!NO_PACK_YET.has(scenario.meta.system)) {
        expect(getRulePack(scenario.meta.system), scenario.meta.system).not.toBe(null);
      }
    }
  });

  it('beats run in time order within the play budget', () => {
    for (const slot of contingency.slots) {
      const s = getScenario(slot.scenarioId);
      const mins = s.timeline.map((b) => b.targetMin);
      expect([...mins].sort((a, b) => a - b), s.meta.id).toEqual(mins);
      expect(Math.max(...mins), s.meta.id).toBeLessThanOrEqual(s.meta.playMinutes);
    }
  });

  it('marks the right slot live / next during the convention', () => {
    // Thu 28 Jan 2027, 15:00 local — CONTINUOUS SERVICE (14:00–18:00) is running.
    const r = analyzeSchedule(contingency.slots, Date.parse('2027-01-28T15:00:00'));
    expect(r.liveNow?.scenarioId).toBe('continuous-service');
    expect(r.upNext?.scenarioId).toBe('london-particular');
    const byId = Object.fromEntries(r.slots.map((s) => [s.scenarioId, s.status]));
    expect(byId['perpetual-order']).toBe('done');
    expect(byId.provenance).toBe('upcoming');
  });
});
