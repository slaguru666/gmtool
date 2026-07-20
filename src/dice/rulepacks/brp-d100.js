// Basic Roleplaying (BRP) roll-under d100 ladder vs a skill %.
// Bands match the Continuum "Day One" console: fumble on 100, critical ≤ skill/20,
// special ≤ skill/5, success ≤ skill (the fractions rounded up).
export const brpD100 = {
  id: 'brp-d100',
  label: 'd100 (Basic Roleplaying)',
  params: [{ key: 'target', label: 'Skill %', default: 50 }],
  interpret(results, params = {}) {
    const value = results[0]?.value ?? 0;
    const target = params.target ?? 50;
    let level;
    if (value === 100) level = 'fumble';
    else if (value <= Math.ceil(target / 20)) level = 'critical';
    else if (value <= Math.ceil(target / 5)) level = 'special';
    else if (value <= target) level = 'success';
    else level = 'failure';
    const success = ['critical', 'special', 'success'].includes(level);
    return { value, target, level, success };
  },
  summary(v) {
    return `${v.value} vs ${v.target}% → ${v.level.toUpperCase()}`;
  },
};
