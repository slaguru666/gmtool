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
  clues: [
    { id: 'c1', label: 'Trial is at dawn, Market Hall (Vane’s announcement — automatic).', essential: true, act: 'Act One — The Gathering Storm' },
    { id: 'c2', label: 'Ashford drowned in debts long before any “curse” (Dallam / letters / Garratt’s notes).', essential: true, act: 'Act One — The Gathering Storm' },
    { id: 'c3', label: 'Garratt’s verdict column is blank — he is waiting to see what pays.', essential: true, act: 'Act One — The Gathering Storm' },
    { id: 'c4', label: 'McShay’s evidence stack: poppet, livestock, “seen at the stones”.', essential: true, act: 'Act One — The Gathering Storm' },
    { id: 'c5', label: 'Eleanor refused McShay’s proposal five years ago (Eleanor / William / letters).', essential: true, act: 'Act One — The Gathering Storm' },
    { id: 'c6', label: 'Meadowsweet on the cell sill — fresh, in October.', essential: false, act: 'Act One — The Gathering Storm' },
    { id: 'c7', label: '“Master Drago” knows Polish court etiquette rather well for a wool man.', essential: false, act: 'Act One — The Gathering Storm' },
    { id: 'c8', label: 'Poppet stitching = Mary Fletcher’s needlework.', essential: true, act: 'Act Two — The Deeper Dark' },
    { id: 'c9', label: 'Mary’s confession — mercy is the mechanic; protection before testimony.', essential: true, act: 'Act Two — The Deeper Dark' },
    { id: 'c10', label: 'Ashford debt letters + unsent apology note (kills the curse on paper).', essential: true, act: 'Act Two — The Deeper Dark' },
    { id: 'c11', label: 'McShay’s unsent letter to Eleanor — the lever: mercy silences, cruelty breaks.', essential: true, act: 'Act Two — The Deeper Dark' },
    { id: 'c12', label: 'Thorne’s journal — the courtesies, the Bright Lady, Margaret named years ago.', essential: false, act: 'Act Two — The Deeper Dark' },
    { id: 'c13', label: 'The Bright Lady’s claim & terms-space (the stones at dusk; else she attends the trial).', essential: true, act: 'Act Two — The Deeper Dark' },
    { id: 'c14', label: 'Garratt’s price: “Give me evidence I can cite, and I’ll happily be the man who saved an innocent.”', essential: false, act: 'Act Two — The Deeper Dark' },
  ],
  cast: [
    { id: 'margaret-patterson', name: 'Margaret Patterson', kind: 'npc', note: 'the accused — innocent of the charge; woven with the uncanny', secret: 'Meadowsweet follows her. The Bright Lady calls her “little candle”.' },
    { id: 'father-murphy-mcshay', name: 'Father Murphy McShay', kind: 'npc', note: 'a wound preaching' },
    { id: 'witch-finder-garratt', name: 'Witch Finder Garratt', kind: 'npc', note: 'a professional waiting to see what pays' },
    { id: 'mary-fletcher', name: 'Mary Fletcher', kind: 'npc', note: 'grief stitched into spite, waiting to be caught', secret: 'Fallback: she breaks down publicly at dusk prayers.' },
    { id: 'count-drago-karnkowski', name: 'Count Drago Karnkowski', kind: 'npc', note: 'brave, loyal, out of his depth' },
    { id: 'thomas-patterson', name: 'Thomas Patterson', kind: 'npc', note: 'a father bargaining with fate' },
    { id: 'eleanor-patterson', name: 'Eleanor Patterson', kind: 'npc', note: 'a mother afraid of her own daughter' },
    { id: 'alderman-vane', name: 'Alderman Vane', kind: 'npc', note: 'order first, mercy where affordable' },
    { id: 'william-mcshay', name: 'William McShay', kind: 'npc', note: 'a boy drowning in his uncle’s certainty' },
    { id: 'roger-dallam', name: 'Roger Dallam', kind: 'npc', note: 'knows everything, risks nothing' },
    { id: 'the-bright-lady', name: 'The Bright Lady', kind: 'npc', note: 'not evil — alien, proprietary, patient', secret: 'First sight: Unravelling roll, every witness. No roll wins the parley. If no bargain: she curtseys, withdraws, and the claim stays OPEN.' },
    { id: 'agatha-thorne-d-2-yrs', name: 'Agatha Thorne (d. 2 yrs)', kind: 'npc', note: 'the last keeper of the courtesies' },
  ],
  props: [],
};
