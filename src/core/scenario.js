export function validateScenario(s) {
  if (!s || typeof s !== 'object') return ['scenario must be an object'];
  const errors = [];
  if (!s.meta?.id) errors.push('meta.id required');
  if (!s.meta?.system) errors.push('meta.system required');
  if (!Array.isArray(s.timeline) || s.timeline.length === 0) {
    errors.push('timeline must be a non-empty array');
  } else {
    s.timeline.forEach((b, i) => {
      if (!b.id) errors.push(`timeline[${i}].id required`);
      if (typeof b.targetMin !== 'number') errors.push(`timeline[${i}].targetMin must be a number`);
    });
  }
  return errors;
}
