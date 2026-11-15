// PAPER CHILDREN · Contingency 2027 · Sat Slot 11 · Blade Runner RPG.
// Source: games/slot11-blade-runner-paper-children/scenarios/paper-children.md (v1.1);
// PCs are AFTERIMAGE’s four, named per characters/paper-children-pregens.md (afterimage.js carries no PC cast).
// The four suspects’ V-K Empathy ratings are carried in their secrets.
export default {
  meta: { id: 'paper-children', title: 'PAPER CHILDREN', system: 'year-zero', players: 4, playMinutes: 210, slot: 'Sat · Slot 11' },
  timeline: [
    { id: 'intro',   act: 0, label: 'Intro done — pregens dealt, safety line, push asymmetry said once; the clinic scene', targetMin: 15 },
    { id: 'a1',      act: 1, label: 'Act One done — business understood, torn page known, two clients identified; BREAK on the first front door', targetMin: 75, cutHint: 'Drop clues 8 and 9' },
    { id: 'a2',      act: 2, label: 'Act Two planned end — all four met, Teale taken, the list physically in a player’s hands', targetMin: 150, cutHint: 'Interview three of the four — keep Vicario and Lindqvist; merge Adeyemi and Oyelaran if you must' },
    { id: 'a2-hard', act: 2, label: 'HARD — the phone rings: Captain Reyes calls, whatever the table is doing', targetMin: 165, hardTrigger: true },
    { id: 'a3-ask',  act: 3, label: 'If behind: Reyes calls at 3:05 — “Is the file complete?”', targetMin: 185, notes: 'The answer to that is the whole act' },
    { id: 'a3',      act: 3, label: 'Act Three done — the answer given to Reyes, out loud, by a named player', targetMin: 195 },
    { id: 'epi',     act: 4, label: 'Epilogue done — vignettes keyed to the answer; what each did with the page', targetMin: 210 },
  ],
  clues: [
    { id: 'c1',  label: 'Scene undisturbed, nothing stolen — not a robbery', essential: true, act: 'Act One — The Clinic' },
    { id: 'c2',  label: 'Her own paper-knife, close and repeated — rage, not profession', essential: true, act: 'Act One — The Clinic' },
    { id: 'c3',  label: 'The business: dead infants’ identities, sold', essential: true, act: 'Act One — The Clinic' },
    { id: 'c4',  label: 'The gap is real — deaths never reconcile to births; every document genuine', essential: true, act: 'Act One — The Clinic' },
    { id: 'c5',  label: 'Ledger’s last page torn out, not cut — and the book was left', essential: true, act: 'Act One — The Clinic' },
    { id: 'c6',  label: 'The remaining pages identify four local clients', essential: true, act: 'Act One — The Clinic', fallback: 'Sang’s own cross-reference index is in the top drawer.' },
    { id: 'c7',  label: 'Forty-one entries in fourteen years; thirty-one not marked deceased — say it aloud', essential: true, act: 'Act One — The Clinic', fallback: 'Running total in Sang’s hand on the inside cover.' },
    { id: 'c8',  label: 'A visitor five days ago, no appointment, argued, left — Teale, unnamed', essential: false, act: 'Act One — The Clinic', fallback: 'The neighbour volunteers it when canvassed.' },
    { id: 'c9',  label: 'Sang’s vetting notes — she turned clients away', essential: false, act: 'Act One — The Clinic' },
    { id: 'c10', label: 'All four alibis are almost good enough', essential: true, act: 'Act Two — The Four' },
    { id: 'c11', label: 'All four are replicants — the ledger proves it; a V-K or implant scar confirms one', essential: true, act: 'Act Two — The Four' },
    { id: 'c12', label: 'Track A: a man asked questions in the spring (Adeyemi, Vicario)', essential: true, act: 'Act Two — The Four' },
    { id: 'c13', label: 'Track B: transit stop, med-alert band, a freight company (Oyelaran, Lindqvist)', essential: true, act: 'Act Two — The Four' },
    { id: 'c14', label: 'Aaron Teale, freight dispatcher, Vernon — once the pairs compare', essential: true, act: 'Act Two — The Four' },
    { id: 'c15', label: 'Teale is human; his twin died at four months', essential: true, act: 'Act Two — The Four', fallback: 'Teale states it himself, calmly, in custody.' },
    { id: 'c16', label: 'Teale has the page and surrenders it — the list is in their hands', essential: true, act: 'Act Two — The Four' },
    { id: 'c17', label: 'The page carries thirty-one living names (H3-A)', essential: true, act: 'Act Two — The Four' },
  ],
  cast: [
    { id: 'aaron-teale', name: 'Aaron Teale', kind: 'npc', note: 'freight dispatcher, 40, human — wants someone else to know; cooperative, unrepentant', secret: 'The murderer. Does not resist. The page is in his jacket and he hands it over unasked.' },
    { id: 'noor-adeyemi', name: 'Noor Adeyemi', kind: 'npc', note: 'schoolteacher, Glendale — wants to get through the lesson', secret: 'Nexus-8. V-K EMP C (d8). Lying about her morning — a governors’ meeting that did not minute her.' },
    { id: 'esteban-vicario', name: 'Esteban Vicario', kind: 'npc', note: 'paramedic — wants to finish his shift; better than the people deciding his fate', secret: 'Nexus-8. V-K EMP A (d12) — the hardest to read. If tested, puts his arm out unasked.' },
    { id: 'tam-oyelaran', name: 'Tam Oyelaran', kind: 'npc', note: 'union organiser — wants a lawyer, correctly; the obvious suspect, and wrong', secret: 'Nexus-8. V-K EMP B (d10).' },
    { id: 'grace-lindqvist', name: 'Grace Lindqvist', kind: 'npc', note: 'East LA — wants to be there at four o’clock', secret: 'Nexus-8. V-K EMP C (d8). Pilar, 9, human, never on screen; safety tool raised → an adult dependent instead.' },
    { id: 'alma-reyes', name: 'Capt. Alma Reyes', kind: 'npc', note: 'wants the file; not cruel, not interested — a voice on a phone', secret: 'Asks twice, never threatens. File by eight.' },
    { id: 'mireille-sang', name: 'Dr Mireille Sang (dec.)', kind: 'npc', note: 'records officer, 63 — wanted to run a tidy office', secret: 'Her ledger is the most humane document in the scenario and is also the kill list.' },
    { id: 'rick-holden', name: 'Det. Rick Holden', kind: 'pc', note: 'human, Inspector, 11 years — the man who reads rooms; old-school, patient, quietly cracked down the middle' },
    { id: 'jax-miller', name: 'Off. Jax Miller', kind: 'pc', note: 'human, Fixer, 5 years — the market kid who put on a badge; everybody in Sector 9 owes him or feeds him' },
    { id: 'kael', name: 'FN9-7.21 “Kael”', kind: 'pc', note: 'Nexus-9, Enforcer, 11 months — built with the terrifying symmetry of a machine; learning, one shift at a time, what the symmetry is for' },
    { id: 'sloane', name: 'SN9-1.11 “Sloane”', kind: 'pc', note: 'Nexus-9, Analyst, 12 months — the lab coat with a badge; reads evidence like scripture, and is starting to proofread her own' },
  ],
  props: [],
};
