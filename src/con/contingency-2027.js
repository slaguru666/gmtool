// Contingency 2027 — Wed 27 – Sun 31 January 2027, Searles Leisure Resort, Hunstanton.
// Twelve games on the house 15-slot grid (7, 10 and 15 are clear). Slate from the
// contingency2027 repo README. Times are that repo's PLACEHOLDERS (docs/schedule.md:
// morning 09:00, afternoon 14:00, evening 19:30) until Warhorn publishes — update
// `slot` and `startsAt` together when it does.
export default {
  meta: { id: 'contingency-2027', title: 'Contingency 2027' },
  slots: [
    { id: 'c27-s1',  scenarioId: 'perpetual-order',    title: 'THE PERPETUAL ORDER',                    slot: 'Wed 27 · 09:00–13:00', system: 'CoC Gaslight',  players: '4–6', playMinutes: 240, startsAt: '2027-01-27T09:00:00' },
    { id: 'c27-s2',  scenarioId: 'afterimage',         title: 'AFTERIMAGE',                             slot: 'Wed 27 · 14:00–18:00', system: 'Blade Runner',  players: 4,     playMinutes: 240, startsAt: '2027-01-27T14:00:00' },
    { id: 'c27-s3',  scenarioId: 'six-oclock-sitting', title: 'THE SIX O’CLOCK SITTING',                slot: 'Wed 27 · 19:30–23:30', system: 'CoC Gaslight',  players: '4–6', playMinutes: 240, startsAt: '2027-01-27T19:30:00' },
    { id: 'c27-s4',  scenarioId: 'black-summer',       title: 'BLACK SUMMER — Last Flight Out',         slot: 'Thu 28 · 09:00–13:00', system: 'TWDU',          players: '4–6', playMinutes: 240, startsAt: '2027-01-28T09:00:00' },
    { id: 'c27-s5',  scenarioId: 'continuous-service', title: 'CONTINUOUS SERVICE',                     slot: 'Thu 28 · 14:00–18:00', system: 'ALIEN',         players: '4–6', playMinutes: 240, startsAt: '2027-01-28T14:00:00' },
    { id: 'c27-s6',  scenarioId: 'london-particular',  title: 'THE LONDON PARTICULAR',                  slot: 'Thu 28 · 19:30–23:30', system: 'CoC Gaslight',  players: '4–6', playMinutes: 240, startsAt: '2027-01-28T19:30:00' },
    { id: 'c27-s8',  scenarioId: 'viva-voce',          title: 'VIVA VOCE',                              slot: 'Fri 29 · 14:00–18:00', system: 'CoC 1920s',     players: '4–6', playMinutes: 240, startsAt: '2027-01-29T14:00:00' },
    { id: 'c27-s9',  scenarioId: 'mr-parkers-diary',   title: 'THE CURIOUS CASE OF MR PARKER’S DIARY', slot: 'Fri 29 · 19:30–23:30', system: 'Vaesen',        players: '4–6', playMinutes: 240, startsAt: '2027-01-29T19:30:00' },
    { id: 'c27-s11', scenarioId: 'paper-children',     title: 'PAPER CHILDREN',                         slot: 'Sat 30 · 14:00–18:00', system: 'Blade Runner',  players: 4,     playMinutes: 240, startsAt: '2027-01-30T14:00:00' },
    { id: 'c27-s12', scenarioId: 'closing-weekend',    title: 'CLOSING WEEKEND',                        slot: 'Sat 30 · 19:30–23:30', system: 'CoC modern',    players: '4–6', playMinutes: 240, startsAt: '2027-01-30T19:30:00' },
    { id: 'c27-s13', scenarioId: 'the-favour',         title: 'THE FAVOUR',                             slot: 'Sun 31 · 09:00–13:00', system: 'Dee Sanction',  players: '4–6', playMinutes: 240, startsAt: '2027-01-31T09:00:00' },
    { id: 'c27-s14', scenarioId: 'provenance',         title: 'PROVENANCE',                             slot: 'Sun 31 · 14:00–18:00', system: 'Outgunned',     players: '4–6', playMinutes: 240, startsAt: '2027-01-31T14:00:00' },
  ],
};
