import { describe, it, expect } from 'vitest';
import { sortedTimeline, nextUnreachedBeat, analyze } from '../../src/core/timeline.js';

const T = [
  { id: 'a', act: 1, label: 'Open', targetMin: 0, hardTrigger: true },
  { id: 'b', act: 1, label: 'Parlor', targetMin: 35, cutHint: 'skip the tea' },
  { id: 'c', act: 2, label: 'Door-cam', targetMin: 120, hardTrigger: true },
];

describe('timeline analysis', () => {
  it('sorts by targetMin without mutating input', () => {
    const shuffled = [T[2], T[0], T[1]];
    expect(sortedTimeline(shuffled).map((b) => b.id)).toEqual(['a', 'b', 'c']);
    expect(shuffled[0].id).toBe('c');
  });

  it('finds the next unreached beat', () => {
    expect(nextUnreachedBeat(T, {}).id).toBe('a');
    expect(nextUnreachedBeat(T, { a: 0 }).id).toBe('b');
  });

  it('before any stamp: no current, next hard is the first hard beat', () => {
    const m = analyze(T, 5, {});
    expect(m.currentBeat).toBe(null);
    expect(m.nextBeat.id).toBe('a');
    expect(m.driftMin).toBe(null);
    expect(m.nextHardTrigger.id).toBe('a');
  });

  it('after stamping "a" late: drift is behind, next hard is "c"', () => {
    const m = analyze(T, 40, { a: 6 }); // reached Open at 6 min (target 0) => 6 behind
    expect(m.currentBeat.id).toBe('a');
    expect(m.driftMin).toBe(6);
    expect(m.nextBeat.id).toBe('b');
    expect(m.cutHint).toBe('skip the tea');
    expect(m.nextHardTrigger.id).toBe('c');
    expect(m.minutesToNextHard).toBe(80); // 120 - 40
  });
});
