// ALIEN RPG (core rules pp. 58-61): all d6. A 6 on any die - base or stress -
// is a success; each 6 beyond the first is a stunt. Stress Dice equal the
// current Stress Level. A 1 on a stress die means the roll cannot be pushed
// and a Panic Roll must be made (p. 104). A 1 on a base die means nothing.
// deviceOnly: the web dice tray has no stress dice, so it does not offer it.
export const alien = {
  id: 'alien',
  label: 'ALIEN',
  deviceOnly: true,
  params: [{ key: 'stress', label: 'Stress', default: 0 }],
  interpret(results) {
    let successes = 0, panic = false;
    for (const r of results) {
      if (r.value === 6) successes += 1;
      if (r.stress && r.value === 1) panic = true;
    }
    const stunts = Math.max(0, successes - 1);
    return { successes, stunts, panic, success: successes > 0, canPush: !panic };
  },
  summary(v) {
    let s = v.successes === 0 ? 'No success' : `${v.successes} success${v.successes === 1 ? '' : 'es'}`;
    if (v.stunts) s += ` · ${v.stunts} stunt${v.stunts === 1 ? '' : 's'}`;
    if (v.panic) s += ' · PANIC ROLL';
    return s;
  },
};
