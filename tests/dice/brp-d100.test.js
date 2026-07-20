import { describe, it, expect } from 'vitest';
import { brpD100 } from '../../src/dice/rulepacks/brp-d100.js';
import { getRulePack } from '../../src/dice/rulepacks/index.js';

const roll = (v) => [{ sides: 100, value: v }];

describe('brp-d100 rule-pack', () => {
  it('grades the ladder against a 50% skill (crit ≤3, special ≤10, success ≤50)', () => {
    expect(brpD100.interpret(roll(3), { target: 50 }).level).toBe('critical');   // ceil(50/20)=3
    expect(brpD100.interpret(roll(4), { target: 50 }).level).toBe('special');
    expect(brpD100.interpret(roll(10), { target: 50 }).level).toBe('special');   // ceil(50/5)=10
    expect(brpD100.interpret(roll(11), { target: 50 }).level).toBe('success');
    expect(brpD100.interpret(roll(50), { target: 50 }).level).toBe('success');
    expect(brpD100.interpret(roll(51), { target: 50 }).level).toBe('failure');
  });

  it('fumbles only on 100 (a plain miss otherwise, even at 96–99)', () => {
    expect(brpD100.interpret(roll(100), { target: 50 }).level).toBe('fumble');
    expect(brpD100.interpret(roll(99), { target: 50 }).level).toBe('failure');
    expect(brpD100.interpret(roll(100), { target: 100 }).level).toBe('fumble'); // 100 fumbles even at skill 100
  });

  it('rounds the crit/special fractions up for low skills', () => {
    // skill 25: crit ≤ ceil(25/20)=2, special ≤ ceil(25/5)=5
    expect(brpD100.interpret(roll(2), { target: 25 }).level).toBe('critical');
    expect(brpD100.interpret(roll(5), { target: 25 }).level).toBe('special');
    expect(brpD100.interpret(roll(6), { target: 25 }).level).toBe('success');
  });

  it('marks crit/special/success as success, fumble/failure as not', () => {
    expect(brpD100.interpret(roll(3), { target: 50 }).success).toBe(true);
    expect(brpD100.interpret(roll(50), { target: 50 }).success).toBe(true);
    expect(brpD100.interpret(roll(51), { target: 50 }).success).toBe(false);
    expect(brpD100.interpret(roll(100), { target: 50 }).success).toBe(false);
  });

  it('defaults skill to 50 and summarises', () => {
    const v = brpD100.interpret(roll(4));
    expect(v.target).toBe(50);
    expect(brpD100.summary(v)).toBe('4 vs 50% → SPECIAL');
  });

  it('is registered', () => {
    expect(getRulePack('brp-d100')).toBe(brpD100);
  });
});
