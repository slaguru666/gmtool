import { describe, it, expect } from 'vitest';
import { yearZero } from '../../src/dice/rulepacks/year-zero.js';
import { getRulePack, registerRulePack } from '../../src/dice/rulepacks/index.js';

describe('year-zero rule-pack', () => {
  it('counts 6-9 as one success and 10+ as two', () => {
    const v = yearZero.interpret([{ sides: 8, value: 8 }, { sides: 8, value: 4 }, { sides: 12, value: 11 }]);
    expect(v.successes).toBe(3); // 8 -> 1, 4 -> 0, 11 -> 2
    expect(v.isCritical).toBe(true);
  });

  it('reports ones for stress on a push', () => {
    const v = yearZero.interpret([{ sides: 6, value: 1 }, { sides: 6, value: 1 }, { sides: 6, value: 6 }]);
    expect(v.ones).toBe(2);
    expect(v.successes).toBe(1);
    expect(v.canPush).toBe(true);
  });

  it('is resolvable from the registry by id', () => {
    expect(getRulePack('year-zero')).toBe(yearZero);
    expect(getRulePack('nope')).toBe(null);
    const custom = { id: 'x', label: 'X', interpret: () => ({}) };
    registerRulePack(custom);
    expect(getRulePack('x')).toBe(custom);
  });
});

describe('year-zero contract v2', () => {
  it('exposes an empty params list and a summary string', () => {
    expect(yearZero.params).toEqual([]);
    expect(yearZero.summary({ successes: 2, ones: 1 })).toBe('2 successes · 1 stress');
    expect(yearZero.summary({ successes: 1, ones: 0 })).toBe('1 success');
  });
  it('interpret ignores a params argument', () => {
    const v = yearZero.interpret([{ sides: 8, value: 8 }], { anything: true });
    expect(v.successes).toBe(1);
  });
});
