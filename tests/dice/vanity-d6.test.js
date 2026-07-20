import { describe, it, expect } from 'vitest';
import { vanityD6 } from '../../src/dice/rulepacks/vanity-d6.js';
import { getRulePack } from '../../src/dice/rulepacks/index.js';

const pool = (...vals) => vals.map((v) => ({ sides: 6, value: v }));

describe('vanity-d6 rule-pack', () => {
  it('counts 5s and 6s as successes', () => {
    const v = vanityD6.interpret(pool(6, 5, 2), { difficulty: 1 });
    expect(v.successes).toBe(2);
    expect(v.isSuccess).toBe(true);
    expect(v.style).toBe(true); // more successes than needed
  });
  it('stumbles on zero successes with two or more 1s', () => {
    const v = vanityD6.interpret(pool(1, 1, 3), { difficulty: 1 });
    expect(v.successes).toBe(0);
    expect(v.ones).toBe(2);
    expect(v.stumble).toBe(true);
    expect(v.isSuccess).toBe(false);
  });
  it('a lone 1 is a GM twist, not a stumble', () => {
    const v = vanityD6.interpret(pool(1, 4, 4), { difficulty: 1 });
    expect(v.twist).toBe(true);
    expect(v.stumble).toBe(false);
  });
  it('respects the difficulty (successes needed)', () => {
    const v = vanityD6.interpret(pool(6, 2, 2), { difficulty: 2 });
    expect(v.successes).toBe(1);
    expect(v.isSuccess).toBe(false);
  });
  it('defaults difficulty to 1, summarises, and is registered', () => {
    const v = vanityD6.interpret(pool(5, 3));
    expect(v.difficulty).toBe(1);
    expect(vanityD6.summary(v)).toContain('1 success');
    expect(getRulePack('vanity-d6')).toBe(vanityD6);
  });
});
