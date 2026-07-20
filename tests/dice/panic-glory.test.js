import { describe, it, expect } from 'vitest';
import { panicGlory } from '../../src/dice/rulepacks/panic-glory.js';
import { getRulePack } from '../../src/dice/rulepacks/index.js';

const d6 = (v) => [{ sides: 6, value: v }];

describe('panic-glory rule-pack', () => {
  it('adds (20 - SAN) to the d6', () => {
    const v = panicGlory.interpret(d6(3), { san: 20 });
    expect(v.total).toBe(3);
    expect(v.band.key).toBe('glory-unleashed');
    expect(v.gloryPoint).toBe(true);
  });
  it('bands a mid result correctly', () => {
    const v = panicGlory.interpret(d6(4), { san: 10 }); // 4 + 10 = 14
    expect(v.total).toBe(14);
    expect(v.band.key).toBe('wavering-resolve');
    expect(v.gloryPoint).toBe(false);
  });
  it('caps into full panic at 20+', () => {
    const v = panicGlory.interpret(d6(5), { san: 5 }); // 5 + 15 = 20
    expect(v.band.key).toBe('full-panic');
  });
  it('defaults SAN to 20, summarises, and is registered', () => {
    const v = panicGlory.interpret(d6(6));
    expect(v.total).toBe(6);
    expect(panicGlory.summary(v)).toBe('6 → GLORY UNLEASHED');
    expect(getRulePack('panic-glory')).toBe(panicGlory);
  });
});
