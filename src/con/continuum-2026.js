// Continuum 2026 — Fri 24 – Sun 26 July 2026, High Leigh, Hoddesdon.
// Six slots, all ported. Schedule (days, times, systems, player counts) is
// transcribed from gm-utility/con-desk.html (the SLOTS array this hub succeeds).
// `slot` is the display label; `startsAt` (local ISO) + `playMinutes` (the slot
// window length) drive the live / up-next timing; `scenarioId` deep-links via
// the scenario registry.
export default {
  meta: { id: 'continuum-2026', title: 'Continuum 2026' },
  slots: [
    { id: 'c26-s1', scenarioId: 'day-one',       title: 'DAY ONE — London Falls',              slot: 'Fri 24 · 14:00–18:00', system: 'BRP',           players: '5–6', playMinutes: 240, startsAt: '2026-07-24T14:00:00' },
    { id: 'c26-s2', scenarioId: 'afterimage',    title: 'AFTERIMAGE',                          slot: 'Fri 24 · 20:00–24:00', system: 'Blade Runner',  players: 4,     playMinutes: 240, startsAt: '2026-07-24T20:00:00' },
    { id: 'c26-s4', scenarioId: 'vain-crown',    title: 'THE VAIN CROWN',                      slot: 'Sat 25 · 14:00–18:00', system: 'VANITY',        players: 5,     playMinutes: 240, startsAt: '2026-07-25T14:00:00' },
    { id: 'c26-s5', scenarioId: 'silvery-moon',  title: 'BY THE LIGHT OF THE SILVERY MOON',    slot: 'Sat 25 · 20:00–24:00', system: 'CoC Gaslight',  players: 6,     playMinutes: 240, startsAt: '2026-07-25T20:00:00' },
    { id: 'c26-s6', scenarioId: 'chopper',       title: 'GET TO THE CHOPPER — Another Fine Mess', slot: 'Sun 26 · 10:00–13:00', system: 'Pulp Cthulhu', players: 6,  playMinutes: 180, startsAt: '2026-07-26T10:00:00' },
    { id: 'c26-s7', scenarioId: 'princes-bride', title: 'THE PRINCES BRIDE',                   slot: 'Sun 26 · 14:00–18:00', system: 'Dee Sanction',  players: '4–6', playMinutes: 240, startsAt: '2026-07-26T14:00:00' },
  ],
};
