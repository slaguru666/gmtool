import { describe, it, expect } from 'vitest';
import { fmtElapsed, fmtDrift } from '../../src/core/format.js';

describe('formatting', () => {
  it('formats elapsed time', () => {
    expect(fmtElapsed(0)).toBe('0:00');
    expect(fmtElapsed(65 * 1000)).toBe('0:01');
    expect(fmtElapsed(112 * 60 * 1000)).toBe('1:52');
  });
  it('formats drift with direction', () => {
    expect(fmtDrift(null)).toBe('');
    expect(fmtDrift(0)).toBe('on time');
    expect(fmtDrift(6)).toBe('+6 behind');
    expect(fmtDrift(-3)).toBe('3 ahead');
  });
});
