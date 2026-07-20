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
  clues: [
    { id: 'c1', label: 'The door-cam face that cannot exist (hand the still around as an object)', essential: true },
    { id: 'c2', label: 'The ledger: A-1 · A-2 · A-3 — and A-3’s file just reads “retired”', essential: true },
    { id: 'c3', label: 'The identical childhood, recited twice across the split', essential: true, fallback: 'the monologue cards ×2' },
    { id: 'c4', label: 'The spike was intimate — face to face, not an execution (Avis)', essential: true },
    { id: 'c5', label: 'Pier + dawn deadline known before 2:45', essential: true, fallback: 'both Act Two tracks carry it' },
    { id: 'c6', label: 'Whisper-9 is stolen Wallace property — why Corvin has legal cover', essential: true },
  ],
  cast: [],
  props: [],
};
