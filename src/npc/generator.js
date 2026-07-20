function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

export function generateNpc(pack, seed, rng) {
  const t = pack.tables;
  const name = `${pick(t.firstNames, rng)} ${pick(t.surnames, rng)}`;
  return {
    genre: pack.label,
    seed: String(seed ?? '').trim(),
    name,
    look: pick(t.looks, rng),
    manner: pick(t.manners, rng),
    wants: pick(t.wants, rng),
    secret: pick(t.secrets, rng),
    voice: pick(t.voices, rng),
  };
}
