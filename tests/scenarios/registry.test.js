import { describe, it, expect } from 'vitest';
import { SCENARIOS, getScenario } from '../../src/scenarios/index.js';
import afterimage from '../../src/scenarios/afterimage.js';

describe('scenario registry', () => {
  it('resolves a registered scenario by id', () => {
    expect(getScenario('afterimage')).toBe(afterimage);
    expect(SCENARIOS.afterimage).toBe(afterimage);
  });

  it('returns null for an unknown id', () => {
    expect(getScenario('nope')).toBe(null);
  });
});
