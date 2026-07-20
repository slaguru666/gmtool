// VANITY (Draft 13) core roll: 5-6 = Success; Stumble = 0 successes with 2+ ones.
export const vanityD6 = {
  id: 'vanity-d6',
  label: 'd6 Pool (VANITY)',
  params: [{ key: 'difficulty', label: 'Successes needed', default: 1 }],
  interpret(results, params = {}) {
    let successes = 0, ones = 0;
    for (const r of results) {
      if (r.value >= 5) successes += 1;
      if (r.value === 1) ones += 1;
    }
    const difficulty = params.difficulty ?? 1;
    const isSuccess = successes >= difficulty;
    return {
      successes,
      ones,
      difficulty,
      isSuccess,
      stumble: successes === 0 && ones >= 2,
      twist: ones >= 1,
      style: successes > difficulty,
      canPush: true,
    };
  },
  summary(v) {
    const base = `${v.successes} success${v.successes === 1 ? '' : 'es'}`;
    const verdict = v.isSuccess ? '' : ' — fail';
    const stumble = v.stumble ? ' · STUMBLE (+1 Bane)' : (v.twist ? ' · a 1 (GM twist)' : '');
    return `${base}${verdict}${stumble}`;
  },
};
