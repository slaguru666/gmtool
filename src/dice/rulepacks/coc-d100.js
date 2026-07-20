// Call of Cthulhu 7e success ladder vs a skill %.
export const cocD100 = {
  id: 'coc-d100',
  label: 'd100 (Call of Cthulhu)',
  params: [{ key: 'target', label: 'Skill %', default: 50 }],
  interpret(results, params = {}) {
    const value = results[0]?.value ?? 0;
    const target = params.target ?? 50;
    let level;
    if (value === 1) level = 'critical';
    else if (value <= Math.floor(target / 5)) level = 'extreme';
    else if (value <= Math.floor(target / 2)) level = 'hard';
    else if (value <= target) level = 'success';
    else if ((target < 50 && value >= 96) || value === 100) level = 'fumble';
    else level = 'failure';
    const success = ['critical', 'extreme', 'hard', 'success'].includes(level);
    return { value, target, level, success };
  },
  summary(v) {
    return `${v.value} vs ${v.target}% → ${v.level.toUpperCase()}`;
  },
};
