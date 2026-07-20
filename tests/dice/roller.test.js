import { describe, it, expect } from 'vitest';
import { expandDice, rollDie, rollPool } from '../../src/dice/roller.js';

// deterministic rng that replays a fixed sequence
function seq(values) { let i = 0; return () => values[i++ % values.length]; }

describe('dice core', () => {
  it('expands count into individual dice', () => {
    expect(expandDice([{ sides: 8, count: 3 }])).toEqual([{ sides: 8 }, { sides: 8 }, { sides: 8 }]);
    expect(expandDice([{ sides: 6 }])).toEqual([{ sides: 6 }]);
  });

  it('maps rng to inclusive 1..sides', () => {
    expect(rollDie(8, () => 0)).toBe(1);
    expect(rollDie(8, () => 0.999)).toBe(8);
    expect(rollDie(6, () => 0.5)).toBe(4);
  });

  it('rolls a pool and totals it', () => {
    const rng = seq([0.9, 0.0, 0.7]); // d8 -> 8, 1, 6
    const { results, total } = rollPool([{ sides: 8, count: 3 }], rng);
    expect(results.map((r) => r.value)).toEqual([8, 1, 6]);
    expect(total).toBe(15);
    expect(results[0]).toEqual({ sides: 8, value: 8 });
  });
});
