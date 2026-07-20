export const yearZero = {
  id: 'year-zero',
  label: 'Year-Zero',
  params: [],
  interpret(results, params = {}) {
    let successes = 0, ones = 0;
    for (const r of results) {
      if (r.value >= 10) successes += 2;
      else if (r.value >= 6) successes += 1;
      if (r.value === 1) ones += 1;
    }
    return { successes, ones, canPush: true, isCritical: successes >= 2 };
  },
  summary(v) {
    const base = `${v.successes} success${v.successes === 1 ? '' : 'es'}`;
    return v.ones ? `${base} · ${v.ones} stress` : base;
  },
};
