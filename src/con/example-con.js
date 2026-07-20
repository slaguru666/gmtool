// TEMPLATE / EXAMPLE — not a real convention. Demonstrates the con-schedule
// model with fully-timed slots so live / up-next / done statuses are visible.
// A slot's `scenarioId` deep-links into a registered scenario module
// (src/scenarios/index.js); `slot` is the display label, `startsAt` (ISO) drives
// the live/next timing. Copy this shape into a real con file.
export default {
  meta: { id: 'example-con', title: 'Example Convention' },
  slots: [
    { id: 'ex-fri-1', scenarioId: 'afterimage',    title: 'AFTERIMAGE',        slot: 'Fri · Slot 1 · 10:00', system: 'year-zero', players: 4, playMinutes: 210, startsAt: '2026-08-14T10:00:00' },
    { id: 'ex-fri-2', scenarioId: 'example-clues', title: 'Example — Clue Net', slot: 'Fri · Slot 2 · 14:30', system: 'year-zero', players: 4, playMinutes: 210, startsAt: '2026-08-14T14:30:00' },
    { id: 'ex-sat-1', scenarioId: null,            title: 'Unported Demo Slot', slot: 'Sat · Slot 1 · 10:00', playMinutes: 210, startsAt: '2026-08-15T10:00:00' },
  ],
};
