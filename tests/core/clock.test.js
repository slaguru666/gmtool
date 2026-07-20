import { describe, it, expect } from 'vitest';
import { initialClock, start, pause, resume, elapsedMs, isRunning, isPaused } from '../../src/core/clock.js';

describe('session clock', () => {
  it('reads zero before start', () => {
    const c = initialClock();
    expect(elapsedMs(c, 1000)).toBe(0);
    expect(isRunning(c)).toBe(false);
  });

  it('measures elapsed from start', () => {
    const c = start(initialClock(), 1000);
    expect(isRunning(c)).toBe(true);
    expect(elapsedMs(c, 61000)).toBe(60000); // 1 minute
  });

  it('freezes while paused and excludes paused time after resume', () => {
    let c = start(initialClock(), 0);
    c = pause(c, 60000);            // paused at 1:00
    expect(isPaused(c)).toBe(true);
    expect(elapsedMs(c, 120000)).toBe(60000); // frozen at 1:00 while paused
    c = resume(c, 180000);         // resumed after 2 min paused
    expect(elapsedMs(c, 240000)).toBe(120000); // 4 min wall − 2 min paused = 2 min
  });

  it('ignores double start', () => {
    const c = start(start(initialClock(), 100), 5000);
    expect(elapsedMs(c, 1100)).toBe(1000);
  });
});
