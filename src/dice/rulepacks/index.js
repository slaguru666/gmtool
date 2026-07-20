import { yearZero } from './year-zero.js';
import { cocD100 } from './coc-d100.js';

const packs = new Map([[yearZero.id, yearZero], [cocD100.id, cocD100]]);

export function getRulePack(id) { return packs.get(id) || null; }
export function registerRulePack(pack) { packs.set(pack.id, pack); }
export function listRulePacks() {
  return [...packs.values()].map((p) => ({ id: p.id, label: p.label }));
}
