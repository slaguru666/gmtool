// Continuum house mechanic: 1d6 + (20 - current SAN), six bands.
const BANDS = [
  { max: 6,  key: 'glory-unleashed',  label: 'GLORY UNLEASHED',  effect: '2D10 temp HP · ignore SAN loss 3 rounds · auto-succeed one pulp feat · +1 Glory' },
  { max: 9,  key: 'heroic-surge',     label: 'HEROIC SURGE',     effect: '1D6 temp HP · +20% next 2 rolls · +1 Glory' },
  { max: 13, key: 'focused-fury',     label: 'FOCUSED FURY',     effect: 'reroll next fail, then −1D3 SAN' },
  { max: 16, key: 'wavering-resolve', label: 'WAVERING RESOLVE', effect: '−20% next action · POW×5 or panic' },
  { max: 19, key: 'desperate-flinch', label: 'DESPERATE FLINCH', effect: 'drop weapon / freeze · lose action' },
  { max: Infinity, key: 'full-panic', label: 'FULL PANIC',       effect: '−1D10 SAN · flee, freeze, or act irrationally' },
];

export const panicGlory = {
  id: 'panic-glory',
  label: 'Panic & Glory',
  params: [{ key: 'san', label: 'Current SAN', default: 20 }],
  interpret(results, params = {}) {
    const roll = results[0]?.value ?? 0;
    const san = params.san ?? 20;
    const total = roll + (20 - san);
    const band = BANDS.find((b) => total <= b.max);
    return { d6: roll, san, total, band, gloryPoint: total <= 9 };
  },
  summary(v) {
    return `${v.total} → ${v.band.label}`;
  },
};
