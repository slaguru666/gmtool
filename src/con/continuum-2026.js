// Continuum 2026 — the real convention this build is first deployed for.
// Only AFTERIMAGE is ported into a scenario module today (scenarioId set); the
// other four slots are known slate metadata with scenarioId: null until they are
// ported (see the "scenario porting" backlog item). Slot start times are left
// null (TBC) rather than invented — add each slot's real `startsAt` (ISO local
// time) to light up the live / up-next timing on the hub.
export default {
  meta: { id: 'continuum-2026', title: 'Continuum 2026' },
  slots: [
    { id: 'c26-fri-1', scenarioId: null,         title: 'Day One',         slot: 'Fri · Slot 1', startsAt: null },
    { id: 'c26-fri-2', scenarioId: 'afterimage', title: 'AFTERIMAGE',      slot: 'Fri · Slot 2', system: 'year-zero', players: 4, playMinutes: 210, startsAt: null },
    { id: 'c26-sat-4', scenarioId: null,         title: 'Vain Crown',      slot: 'Sat · Slot 4', startsAt: null },
    { id: 'c26-sun-6', scenarioId: null,         title: 'Another Fine Mess', slot: 'Sun · Slot 6', system: 'coc-d100', startsAt: null },
    { id: 'c26-sun-7', scenarioId: null,         title: "Prince's Bride",  slot: 'Sun · Slot 7', system: 'dee-sanction', startsAt: null },
  ],
};
