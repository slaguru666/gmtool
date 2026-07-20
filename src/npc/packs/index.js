import { noir } from './noir.js';

const packs = new Map([[noir.id, noir]]);

export function getGenrePack(id) { return packs.get(id) || null; }
export function registerGenrePack(pack) { packs.set(pack.id, pack); }
export function listGenrePacks() {
  return [...packs.values()].map((p) => ({ id: p.id, label: p.label }));
}
