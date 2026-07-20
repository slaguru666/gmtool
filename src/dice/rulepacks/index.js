import { yearZero } from './year-zero.js';

const packs = new Map([[yearZero.id, yearZero]]);

export function getRulePack(id) { return packs.get(id) || null; }
export function registerRulePack(pack) { packs.set(pack.id, pack); }
