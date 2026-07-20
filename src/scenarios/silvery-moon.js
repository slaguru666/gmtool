// BY THE LIGHT OF THE SILVERY MOON · Continuum 2026 · Sat Slot 5.
// Call of Cthulhu — Gaslight 1892. Timeline transcribed from
// gm-utility/silvery-moon-console.html (SCHED array).
export default {
  meta: { id: 'silvery-moon', title: 'BY THE LIGHT OF THE SILVERY MOON', system: 'coc-d100', players: 6, playMinutes: 210, slot: 'Sat · Slot 5' },
  timeline: [
    { id: 'intro', label: 'Intro done — telegrams dealt, party at Fletcher’s', targetMin: 15 },
    { id: 'act1',  label: 'LEAVE STILLWATER by 1:05 — unfought Shambler becomes the station scene', targetMin: 65, hardTrigger: true },
    { id: 'act2a', label: 'Chicago: Dunworthy named, Lily date heard', targetMin: 95 },
    { id: 'act2',  label: 'LEAVE CHICAGO by 2:00 — the lake rite is the exit, not a dungeon', targetMin: 120, hardTrigger: true },
    { id: 'inter', label: 'Interlude done — the almanac landed; the False Moon first seen', targetMin: 130 },
    { id: 'mine',  label: 'INTO THE CHAMBER by 2:50 — the eclipse will not wait', targetMin: 170, hardTrigger: true },
    { id: 'rite',  label: 'The rite answered — Crowe’s fate decided', targetMin: 190 },
    { id: 'epi',   label: 'Epilogue — totals, photographs, the last Listen roll', targetMin: 210 },
  ],
  clues: [],
  cast: [],
  props: [],
};
