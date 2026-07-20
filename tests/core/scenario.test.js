import { describe, it, expect } from 'vitest';
import { validateScenario } from '../../src/core/scenario.js';
import afterimage from '../../src/scenarios/afterimage.js';
import { getRulePack } from '../../src/dice/rulepacks/index.js';

describe('scenario validation', () => {
  it('flags missing required fields', () => {
    expect(validateScenario(null)).toContain('scenario must be an object');
    const errs = validateScenario({ meta: {}, timeline: [] });
    expect(errs).toContain('meta.id required');
    expect(errs).toContain('meta.system required');
    expect(errs).toContain('timeline must be a non-empty array');
  });

  it('flags a beat missing targetMin', () => {
    const errs = validateScenario({ meta: { id: 'x', system: 'year-zero' }, timeline: [{ id: 'a' }] });
    expect(errs).toContain('timeline[0].targetMin must be a number');
  });

  it('accepts the AFTERIMAGE pilot and its system resolves', () => {
    expect(validateScenario(afterimage)).toEqual([]);
    expect(afterimage.meta.system).toBe('year-zero');
    expect(getRulePack(afterimage.meta.system)).not.toBe(null);
    expect(afterimage.timeline.length).toBeGreaterThan(3);
  });
});
