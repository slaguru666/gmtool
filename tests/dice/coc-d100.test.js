import { describe, it, expect } from 'vitest';
import { cocD100 } from '../../src/dice/rulepacks/coc-d100.js';
import { getRulePack } from '../../src/dice/rulepacks/index.js';

const roll = (v) => [{ sides: 100, value: v }];

describe('coc-d100 rule-pack', () => {
  it('grades a roll against a 50% skill', () => {
    expect(cocD100.interpret(roll(1), { target: 50 }).level).toBe('critical');
    expect(cocD100.interpret(roll(10), { target: 50 }).level).toBe('extreme');  // <= 10
    expect(cocD100.interpret(roll(25), { target: 50 }).level).toBe('hard');     // <= 25
    expect(cocD100.interpret(roll(50), { target: 50 }).level).toBe('success');
    expect(cocD100.interpret(roll(51), { target: 50 }).level).toBe('failure');
    expect(cocD100.interpret(roll(100), { target: 50 }).level).toBe('fumble');
  });
  it('fumbles on 96+ when the skill is under 50', () => {
    expect(cocD100.interpret(roll(96), { target: 40 }).level).toBe('fumble');
    expect(cocD100.interpret(roll(41), { target: 40 }).level).toBe('failure');
  });
  it('marks the four passing bands as success', () => {
    expect(cocD100.interpret(roll(10), { target: 50 }).success).toBe(true);
    expect(cocD100.interpret(roll(51), { target: 50 }).success).toBe(false);
  });
  it('defaults target to 50 and summarises', () => {
    const v = cocD100.interpret(roll(5));
    expect(v.target).toBe(50);
    expect(cocD100.summary(v)).toBe('5 vs 50% → EXTREME');
  });
  it('is registered', () => {
    expect(getRulePack('coc-d100')).toBe(cocD100);
  });
});
