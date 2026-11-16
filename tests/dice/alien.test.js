import { describe, it, expect } from 'vitest';
import { alien } from '../../src/dice/rulepacks/alien.js';
import { getRulePack, listRulePacks } from '../../src/dice/rulepacks/index.js';

const r = (v, stress = false) => ({ sides: 6, value: v, stress });
const sum = (rs, p) => alien.summary(alien.interpret(rs, p));

describe('alien pack (ALIEN core rules pp. 58-61)', () => {
  it('reads sixes on any die, stunts beyond the first', () => {
    expect(sum([r(1), r(2)])).toBe('No success');
    expect(sum([r(6), r(1)])).toBe('1 success'); // a 1 on a base die means nothing
    expect(sum([r(6), r(6), r(3)])).toBe('2 successes · 1 stunt');
    expect(sum([r(6), r(6), r(6, true)])).toBe('3 successes · 2 stunts');
  });

  it('a 1 on a stress die is a Panic Roll and blocks the push', () => {
    const p = alien.interpret([r(6), r(1, true)]);
    expect(alien.summary(p)).toBe('1 success · PANIC ROLL');
    expect(p.canPush).toBe(false);
    expect(p.success).toBe(true);
    expect(alien.interpret([r(2), r(3, true)]).canPush).toBe(true);
    expect(alien.interpret([r(2), r(3, true)]).success).toBe(false);
  });

  it('is registered, device-only, with a Stress param', () => {
    expect(getRulePack('alien')).toBe(alien);
    expect(alien.deviceOnly).toBe(true);
    expect(alien.params).toEqual([{ key: 'stress', label: 'Stress', default: 0 }]);
    expect(listRulePacks().map((p) => p.id)).toContain('alien');
    expect(listRulePacks({ tray: true }).map((p) => p.id)).not.toContain('alien');
  });
});
