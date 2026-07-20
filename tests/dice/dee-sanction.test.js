import { describe, it, expect } from 'vitest';
import { deeSanction } from '../../src/dice/rulepacks/dee-sanction.js';
import { getRulePack } from '../../src/dice/rulepacks/index.js';

const die = (sides, value) => [{ sides, value }];

describe('dee-sanction rule-pack', () => {
  it('treats 3+ as success on any ability die', () => {
    expect(deeSanction.interpret(die(8, 3)).success).toBe(true);
    expect(deeSanction.interpret(die(12, 12)).success).toBe(true);
  });
  it('treats 1-2 as a Falter', () => {
    expect(deeSanction.interpret(die(8, 2)).falter).toBe(true);
    expect(deeSanction.interpret(die(4, 1)).falter).toBe(true);
    expect(deeSanction.interpret(die(8, 2)).success).toBe(false);
  });
  it('summarises and is registered', () => {
    expect(deeSanction.summary(deeSanction.interpret(die(6, 5)))).toBe('5 → success');
    expect(deeSanction.summary(deeSanction.interpret(die(6, 2)))).toBe('2 → FALTER');
    expect(getRulePack('dee-sanction')).toBe(deeSanction);
  });
});
