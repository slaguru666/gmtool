import { yearZero } from './year-zero.js';
import { cocD100 } from './coc-d100.js';
import { vanityD6 } from './vanity-d6.js';
import { panicGlory } from './panic-glory.js';
import { deeSanction } from './dee-sanction.js';

const packs = new Map([[yearZero.id, yearZero], [cocD100.id, cocD100], [vanityD6.id, vanityD6], [panicGlory.id, panicGlory], [deeSanction.id, deeSanction]]);

export function getRulePack(id) { return packs.get(id) || null; }
export function registerRulePack(pack) { packs.set(pack.id, pack); }
export function listRulePacks() {
  return [...packs.values()].map((p) => ({ id: p.id, label: p.label }));
}
