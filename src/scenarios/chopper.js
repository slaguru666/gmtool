// GET TO THE CHOPPER — Another Fine Mess · Continuum 2026 · Sun Slot 6.
// Pulp Cthulhu (~2h50 play). Timeline transcribed from
// gm-utility/chopper-console.html (SCHED array). Core rolls are d100; the
// house Panic & Glory pack is available in the dice tray for the gear-change.
export default {
  meta: { id: 'chopper', title: 'GET TO THE CHOPPER — Another Fine Mess', system: 'coc-d100', players: 6, playMinutes: 170, slot: 'Sun · Slot 6' },
  timeline: [
    { id: 'brief', label: 'Briefing done — mission clear, first one-liner attempted', targetMin: 10 },
    { id: 'act1',  label: 'Act One done — ashore; agents at the Palacio, machine on the volcano, test at one', targetMin: 50 },
    { id: 'act2',  label: 'Act Two done — Willis freed, Segal handled, vault empty: plans already up the mountain', targetMin: 110 },
    { id: 'hard',  label: 'HARD CUT 2:15 — the SIREN begins its power-up regardless; go to the countdown', targetMin: 135, hardTrigger: true },
    { id: 'act3',  label: 'Act Three resolved — Volkova turned / array re-tuned / C4 — the volcano has had enough', targetMin: 145 },
    { id: 'esc',   label: 'ESCAPE SEQUENCE — four phases, everyone rolls, blades', targetMin: 160, hardTrigger: true },
    { id: 'epi',   label: 'Epilogue — beers, the satellite photo, "finish your beers"', targetMin: 170 },
  ],
  clues: [
    { id: 'c1', label: 'The tannoy countdown — “test at thirteen hundred”', essential: true, fallback: 'the patrol radio, Act One' },
    { id: 'c2', label: 'The shrines face INLAND — apologising to the sea', essential: true },
    { id: 'c3', label: 'Concha’s warning: they are fishing, with a very big hook', essential: true, fallback: 'Willis’s cell wall: “they keep singing about a wedding”' },
    { id: 'c4', label: 'The empty plans tube — AL VOLCÁN, this morning', essential: true, fallback: 'Volkova’s office if Beat 3 is cut' },
    { id: 'c5', label: 'Segal’s mandala = the array layout (the reward for fixing him properly)', essential: true },
    { id: 'c6', label: 'THE BIRDS STOP — the gear change, marked plainly (SAN 0/1D2)', essential: true },
    { id: 'c7', label: 'While 3+ singers hold the note, the console alone cannot stop it', essential: true },
  ],
  cast: [],
  props: [],
};
