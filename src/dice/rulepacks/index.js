import { yearZero } from './year-zero.js';
import { cocD100 } from './coc-d100.js';
import { brpD100 } from './brp-d100.js';
import { vanityD6 } from './vanity-d6.js';
import { panicGlory } from './panic-glory.js';
import { deeSanction } from './dee-sanction.js';
import { alien } from './alien.js';

const packs = new Map([[yearZero.id, yearZero], [cocD100.id, cocD100], [brpD100.id, brpD100], [vanityD6.id, vanityD6], [panicGlory.id, panicGlory], [deeSanction.id, deeSanction], [alien.id, alien]]);

export function getRulePack(id) { return packs.get(id) || null; }
export function registerRulePack(pack) { packs.set(pack.id, pack); }
// `tray: true` leaves out device-only packs (the web dice tray cannot roll them).
export function listRulePacks({ tray = false } = {}) {
  return [...packs.values()].filter((p) => !(tray && p.deviceOnly)).map((p) => ({ id: p.id, label: p.label }));
}

// The pack the web dice tray uses for a system: device-only packs fall back to Year Zero.
export function trayPack(id) {
  const pack = getRulePack(id);
  return pack && pack.deviceOnly ? getRulePack('year-zero') : pack;
}
