// src/scenarios/example-with-clues.js
// TEMPLATE / EXAMPLE — not a convention scenario. Demonstrates the clue model
// for the safety-net. Copy this shape into a real scenario's `clues: []`.
export default {
  meta: { id: 'example-clues', title: 'Example — Clue Net', system: 'year-zero', players: 4, playMinutes: 210, slot: 'Example' },
  timeline: [
    { id: 'a1', act: 1, label: 'Opening', targetMin: 0, hardTrigger: true },
    { id: 'a2', act: 2, label: 'The reveal', targetMin: 90, hardTrigger: true },
    { id: 'a3', act: 3, label: 'Resolution', targetMin: 175, hardTrigger: true },
  ],
  clues: [
    { id: 'motive', label: 'The motive', essential: true, act: 'Act 1', fallback: 'The letter spells it out if missed' },
    { id: 'means', label: 'The means', essential: true, act: 'Act 2', fallback: 'The coroner volunteers it at the morgue' },
    { id: 'opportunity', label: 'The opportunity', essential: true, act: 'Act 2', fallback: 'The timetable is pinned to the wall' },
    { id: 'flavour', label: 'A colour detail', essential: false, act: 'Act 1' },
  ],
  cast: [],
  props: [],
};
