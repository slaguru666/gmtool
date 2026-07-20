// The Dee Sanction: roll one Ability die (d4-d12). 3+ = success, 1-2 = Falter.
export const deeSanction = {
  id: 'dee-sanction',
  label: 'Dee Sanction (Challenge/Verdict)',
  params: [],
  interpret(results, params = {}) {
    const value = results[0]?.value ?? 0;
    const sides = results[0]?.sides ?? 0;
    return { value, sides, success: value >= 3, falter: value <= 2 };
  },
  summary(v) {
    return v.success ? `${v.value} → success` : `${v.value} → FALTER`;
  },
};
