export default {
  meta: { id: 'afterimage', title: 'AFTERIMAGE', system: 'year-zero', players: 4, playMinutes: 210, slot: 'Fri · Slot 2' },
  timeline: [
    { id: 'a1-open',    act: 1, label: 'The pier — the case lands', targetMin: 0,   hardTrigger: true },
    { id: 'a1-parlor',  act: 1, label: 'Parlor 88 interview',       targetMin: 35,  cutHint: 'Summarise the ledger; skip the tea ritual' },
    { id: 'a2-market',  act: 2, label: 'The Market',                targetMin: 90 },
    { id: 'a2-doorcam', act: 2, label: 'Door-cam reveal',           targetMin: 120, hardTrigger: true, notes: 'The pivot — do not let this slip past 2:15' },
    { id: 'a3-pier',    act: 3, label: 'Pier confrontation',        targetMin: 175, hardTrigger: true },
    { id: 'epilogue',   act: 4, label: 'Baseline / ambiguous end',  targetMin: 200 },
  ],
  clues: [],
  cast: [],
  props: [],
};
