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
  clues: [
    { id: 'c1', label: 'The two-key door foretold (“a scholar’s and a thief’s”)', essential: true, fallback: 'Yrsa reads it on the door itself' },
    { id: 'c2', label: 'Vesper rode at dawn by the forest road', essential: true, fallback: 'Marrow saw it from her window' },
    { id: 'c3', label: 'The open-water road is watched', essential: true, fallback: 'the wolves are simply there if taken — the warning was mercy, not a gate' },
    { id: 'c4', label: 'The pilgrim is a watcher', essential: true, fallback: 'he bolts at 1:00 regardless' },
    { id: 'c5', label: 'The crown’s bargain: +1 Charm forever · Vice: Pride · a standing Bane no humility clears', essential: true },
    { id: 'c6', label: 'Cassian’s plea lands: “vain, not evil — it matters” (shapes the reburial ending)', essential: true },
  ],
  cast: [
    { id: 'reeve', name: 'REEVE PENNYWHISTLE', kind: 'npc', note: 'Velvet cap he can’t afford; wants it done quietly', secret: 'He hopes they bring the crown TO HIM. If anyone wears it before him — he kneels. First. Play it horrible.' },
    { id: 'marrow', name: 'GOODWIFE MARROW', kind: 'npc', note: 'The Drowned Duck; knows every rumour in three parishes', secret: 'She is the fallback for every missed Act One fact — she saw the dawn ride from her window.' },
    { id: 'cassian', name: 'BROTHER CASSIAN', kind: 'npc', note: 'Old, kind, quietly terrified — the conscience' },
    { id: 'stranger', name: 'THE PALE STRANGER', kind: 'npc', note: 'Vesper’s watcher in pilgrim’s clothes — too clean, too calm', secret: 'HARD TRIGGER: at 1:00 he bolts and blows the whistle whatever is happening. The act break never depends on the players.' },
    { id: 'robbers', name: 'GRAVE-ROBBERS ×4 (+wolf-handler)', kind: 'npc', note: 'Hired blades, owed money, scared of the pale one' },
    { id: 'wolves', name: 'DIRE WOLVES', kind: 'npc', note: 'Vesper’s sentry-beasts — one on the green, three in the wood' },
    { id: 'crypt', name: 'THE CRYPT — 6 SKELETONS + 2 GHOULS (+1 wanderer)', kind: 'npc', note: 'The king’s servants, still serving' },
    { id: 'vesper', name: 'VESPER KOUND', kind: 'npc', note: 'Scholar-turned-grave-robber; wants to be rich, then admired for it', secret: 'If he lives, he sends a polite, infuriating letter of thanks (Props tab). Read it in the epilogue.' },
    { id: 'aldric', name: 'KING ALDRIC — THE VAIN CORPSE', kind: 'npc', note: 'Nemesis. Wants only to be witnessed', secret: 'PHASE 2 AT GRIT 7 (telegraph a round ahead — "the crown begins to blaze"): Aura −1 die to all who ever failed it; he stops defending and attacks twice.' },
  ],
  props: [],
};
