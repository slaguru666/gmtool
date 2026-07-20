export function expandDice(diceSpecs) {
  const out = [];
  for (const d of diceSpecs) {
    const count = d.count ?? 1;
    for (let i = 0; i < count; i++) out.push({ sides: d.sides });
  }
  return out;
}

export function rollDie(sides, rng) {
  return Math.floor(rng() * sides) + 1;
}

export function rollPool(diceSpecs, rng) {
  const results = expandDice(diceSpecs).map((d) => ({ sides: d.sides, value: rollDie(d.sides, rng) }));
  const total = results.reduce((s, r) => s + r.value, 0);
  return { results, total };
}
