// DAY ONE — "London Falls" · Continuum 2026 · Fri Slot 1.
// Timeline transcribed from gm-utility/day-one-console.html (SCHED array).
// System is BRP; mapped to the d100 roller pack (no dedicated BRP pack yet).
export default {
  meta: { id: 'day-one', title: 'DAY ONE — London Falls', system: 'coc-d100', players: 6, playMinutes: 210, slot: 'Fri · Slot 1' },
  timeline: [
    { id: 'intro',  label: 'Intro done — six placed, alert fired, players converging', targetMin: 15 },
    { id: 'market', label: 'MARKET BREAKS — vendor bitten in full view, stampede (force it now if not yet)', targetMin: 60, hardTrigger: true },
    { id: 'act1',   label: 'Act One done — first infected met, group formed', targetMin: 75 },
    { id: 'cordon', label: 'CORDON FRAGMENT — "hold the north bank line — do not cross" (force by now)', targetMin: 150, hardTrigger: true },
    { id: 'act2',   label: 'Act Two done — pub resolved, reanimation witnessed, route chosen', targetMin: 165 },
    { id: 'cost',   label: 'THE COST — someone does not make it. Force it. Do not soften it', targetMin: 185, hardTrigger: true },
    { id: 'reach',  label: 'Bridge or boat reached', targetMin: 190 },
    { id: 'act3',   label: 'Act Three done — cost paid', targetMin: 195 },
    { id: 'epi',    label: 'Epilogue + debrief done — tangent seeded', targetMin: 210 },
  ],
  clues: [],
  cast: [],
  props: [],
};
