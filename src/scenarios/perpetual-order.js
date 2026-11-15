// THE PERPETUAL ORDER · Contingency 2027 · Wed Slot 1 · Call of Cthulhu 7e (Gaslight).
// Source: games/slot01-gaslight-the-perpetual-order/scenarios/perpetual-order.md (v1.1);
// PC names from characters/perpetual-order-pregens.md. Movement beats from Act Two’s three movements;
// the scenario calls the lighterman NPC “Mr Pike” while the roster’s lighterman PC is Daniel Rew — kept both.
export default {
  meta: { id: 'perpetual-order', title: 'THE PERPETUAL ORDER', system: 'coc-d100', players: '4–6', playMinutes: 210, slot: 'Wed · Slot 1' },
  timeline: [
    { id: 'intro',    act: 0, label: 'Intro done — pregens dealt, safety line said, four reasons spoken aloud', targetMin: 15 },
    { id: 'a1',       act: 1, label: 'Act One done — order’s impossible age, 2+ buildings traced, padlock struck; BREAK on first crate opened', targetMin: 75, cutHint: 'Past 1:05: skip clues 6 and 7, Garrow narrates the building history, straight to the door' },
    { id: 'a2-m1',    act: 2, label: 'Movement One — “they’re all the same day”; two crates compared and disagree', targetMin: 95, notes: 'pass-2 fix pending: Movement One rebudgeted to ~25 min (Garrow’s far-stack fetch is the default path)' },
    { id: 'a2-m2',    act: 2, label: 'Movement Two — “it’s not a loop”; the wrong-facing coin on the table', targetMin: 125, notes: 'Dog in the corridor ~1:50, once, resolve in 30s. pass-2 fix pending: Movement One +5 min pushes this to ~2:10' },
    { id: 'a2',       act: 2, label: 'Act Two planned end — drift read as a direction, crate 101 read, Shadwell direction known', targetMin: 150, cutHint: 'Drop Revelations 14 and 16, then collapse Movement Three into Act Three’s letter', notes: 'Pike clears the far stack at 2:25 and carries crate 101 to them. pass-2 fix pending: Movement Three cut to ~20 min' },
    { id: 'a2-hard',  act: 2, label: 'HARD — go to Act Three regardless; cushion spent', targetMin: 165, hardTrigger: true, notes: 'Undelivered revelations fold into the letter — note them now' },
    { id: 'a3',       act: 3, label: 'Act Three done — decision made and owned; crate 102 seen (H3-B)', targetMin: 195, cutHint: 'Cut the letter, only if past 3:05', notes: '3:05 — four o’clock, the lighter casts off, loaded or not' },
    { id: 'epi',      act: 4, label: 'Epilogue done — per-PC vignettes; whose papers are in crate 102', targetMin: 210 },
  ],
  clues: [
    { id: 'c1',  label: 'Rent on 114 paid every quarter since 1836, by order, never in person — the order older still', essential: true, act: 'Act One — The Paperwork', fallback: 'Garrow reads the ledgers aloud; he is proud of his day-book.' },
    { id: 'c2',  label: 'The order predates the building: 1794, the wharf is 1829', essential: true, act: 'Act One — The Paperwork', fallback: 'Garrow reads them aloud.' },
    { id: 'c3',  label: 'A hundred renewal endorsements, all in one unchanging hand (H1-A)', essential: true, act: 'Act One — The Paperwork', fallback: 'The bank’s clerk is required by his instructions to verify the signature on renewal.' },
    { id: 'c4',  label: 'Direction for correspondence: a receiving-house in Shadwell (H1-A margin)', essential: true, act: 'Act One — The Paperwork', fallback: 'The agent’s first letter (1:10) quotes the Shadwell direction back at them.' },
    { id: 'c5',  label: 'Two prior buildings: chandler’s cellar (to 1828), Rotherhithe store (burned 1836) — the vault number carried deliberately', essential: true, act: 'Act One — The Paperwork', fallback: 'The fog beat: Garrow tells the chandler’s cellar story unprompted — his father worked it.' },
    { id: 'c6',  label: 'Rotherhithe fire destroyed the store but not the crates — moved out first, nobody saw who', essential: false, act: 'Act One — The Paperwork' },
    { id: 'c7',  label: 'Dormancy flag raised and withdrawn sixty times (bank’s day-book)', essential: false, act: 'Act One — The Paperwork' },
    { id: 'c8',  label: 'Nobody has ever opened 114, and no instruction says not to — it is a habit', essential: true, act: 'Act One — The Paperwork', fallback: 'Pike asks it flatly on arrival: “Nobody’s had that off, then?”' },
    { id: 'c9',  label: 'Every crate is dated Friday 13 June 1794', essential: true, act: 'Act Two — The Crates' },
    { id: 'c10', label: 'No dust, in a room sealed a century', essential: true, act: 'Act Two — The Crates' },
    { id: 'c11', label: 'The crates disagree with one another — not a repeat of one day', essential: true, act: 'Act Two — The Crates' },
    { id: 'c12', label: 'The disagreement runs one way, worsening with the number — drift, not loop', essential: true, act: 'Act Two — The Crates', fallback: 'Garrow sorts them himself — stacking in order is his profession, and it makes him uneasy.' },
    { id: 'c13', label: 'One hand on every label and every renewal (H1-A vs labels)', essential: true, act: 'Act Two — The Crates', fallback: 'The bank’s clerk has H1-A in hand and must verify signatures.' },
    { id: 'c14', label: 'Tide-tables correct in every crate — moored to the river', essential: false, act: 'Act Two — The Crates' },
    { id: 'c15', label: 'The wrong-facing coin (band 61–80) — put it in a player’s hand', essential: true, act: 'Act Two — The Crates', fallback: 'Pike bites it — “that’s a good penny, that” — and hands it back the wrong way up.' },
    { id: 'c16', label: 'A name in the 41–60 deaths column reappears, alive, in a later crate', essential: false, act: 'Act Two — The Crates' },
    { id: 'c17', label: 'Crate 101’s receipt: this wharf, 1794, impossible currency (H2-C)', essential: true, act: 'Act Two — The Crates', fallback: 'At 2:25 Pike clears the far stack and carries crate 101 into their hands.' },
  ],
  cast: [
    { id: 'peter-shearing', name: 'Peter Shearing', kind: 'npc', note: 'clerk, 34 for a hundred and one years — wants to keep his filing in order; polite, precise, exhausted, will not ask', secret: 'Read, never seen (H3-A). Drift, not loop. He will not ask to be let go.' },
    { id: 'mr-pike', name: 'Mr Pike', kind: 'npc', note: 'lighterman — wants to know which stack, and to catch his tide; utterly incurious', secret: 'Arrives 2:20; clears the far stack at 2:25. Will carry crates out if asked and notice nothing.' },
    { id: 'dock-company-agent', name: 'The dock company’s agent', kind: 'npc', note: 'a deadline with a signature; never appears — wants the vault cleared by Lady Day', secret: 'Two letters, 1:10 and 2:20 (Countdown says 2:15). Leadenhall Street, an hour each way in fog.' },
    { id: 'the-dog', name: 'The dog', kind: 'npc', note: 'Garrow’s dog — will not go past the door, and is right', secret: 'The one permitted jolt, ~1:50. Unplanted in Act One? Do not use it.' },
    { id: 'josiah-garrow', name: 'Mr Josiah Garrow', kind: 'pc', note: 'wharfinger, 44 — eleven years of walking past that door, and lately walking faster', secret: 'If unseated, present as an NPC: never opened it, never asked to, cannot say why not.' },
    { id: 'edwin-alder', name: 'Mr Edwin Alder', kind: 'pc', note: 'bank clerk, 31 — the quietest man in the room is holding the only pen that matters' },
    { id: 'honoria-pledge', name: 'Miss Honoria Pledge', kind: 'pc', note: 'searcher of records, 29 — has written every opinion her uncle’s firm has issued for two years; none bears her name' },
    { id: 'thomas-scarrow', name: 'Mr Thomas Scarrow', kind: 'pc', note: 'surveyor, 38 — trusts a measurement more than a witness, and has stopped trusting one measurement' },
    { id: 'lydia-vayle', name: 'Mrs Lydia Vayle', kind: 'pc', note: 'journalist, 35 — paid by the column, here for a column, and not only for a column' },
    { id: 'daniel-rew', name: 'Mr Daniel Rew', kind: 'pc', note: 'licensed lighterman, 52 — four generations on this tier; grew up on a joke about this' },
  ],
  props: [],
};
