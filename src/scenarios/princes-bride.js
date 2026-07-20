// THE PRINCES BRIDE · Continuum 2026 · Sun Slot 7 · The Dee Sanction.
// Timeline transcribed from gm-utility/princes-bride/modules/princes-bride.js
// (schedule array). The source marks no per-beat hard flags; the one authored
// hard cut is the Act Two bell at 2:45 (HARD 2:45 — the bell rings regardless).
export default {
  meta: { id: 'princes-bride', title: 'THE PRINCES BRIDE', system: 'dee-sanction', players: 6, playMinutes: 210, slot: 'Sun · Slot 7' },
  timeline: [
    { id: 'intro', label: 'Intro done — mission understood, McShay witnessed', targetMin: 15 },
    { id: 'act1',  label: 'Act One done — trial-at-dawn announced; BREAK', targetMin: 75 },
    { id: 'mary',  label: 'Mary Fletcher confession secured (or route known)', targetMin: 120 },
    { id: 'dusk',  label: 'Dusk at the stones — the Bright Lady’s overture', targetMin: 140 },
    { id: 'act2',  label: 'Act Two done — evidence loaded (HARD CUT at 2:45: the bell)', targetMin: 165, hardTrigger: true },
    { id: 'act3',  label: 'Act Three done — verdict + bargain answered', targetMin: 195 },
    { id: 'epi',   label: 'Epilogue + debrief done', targetMin: 210 },
  ],
  clues: [],
  cast: [],
  props: [],
};
