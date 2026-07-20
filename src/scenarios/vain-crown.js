// THE VAIN CROWN · Continuum 2026 · Sat Slot 4 · VANITY (house d6-pool system).
// Timeline transcribed from gm-utility/vain-crown-console.html (SCHED array).
export default {
  meta: { id: 'vain-crown', title: 'THE VAIN CROWN', system: 'vanity-d6', players: 5, playMinutes: 210, slot: 'Sat · Slot 4' },
  timeline: [
    { id: 'intro',  label: 'Intro done — pregens dealt, dice primer run, pitch read', targetMin: 15 },
    { id: 'act1',   label: 'THE WHISTLE — Pale Stranger bolts whatever is happening; Act Two begins', targetMin: 60, hardTrigger: true },
    { id: 'act2',   label: 'Act Two done — green won, prisoner or road named', targetMin: 100 },
    { id: 'act3',   label: 'BARROW MOUTH reached — whatever is uncaught stays behind', targetMin: 135, hardTrigger: true },
    { id: 'door',   label: 'The Sealed Door opened — both keys turned', targetMin: 150 },
    { id: 'crypt',  label: 'Crypt crossed — Turn Undead staged big, Bram held the choke', targetMin: 170 },
    { id: 'throne', label: 'THRONE FIGHT starts by 2:50 — Vesper parleys when it turns', targetMin: 170, hardTrigger: true },
    { id: 'crown',  label: 'THE CROWN CHOICE by 3:15 — card face-down, stop narrating', targetMin: 195, hardTrigger: true },
    { id: 'epi',    label: 'Epilogue done — Glory aloud, best vanity toasted', targetMin: 210 },
  ],
  clues: [],
  cast: [],
  props: [],
};
