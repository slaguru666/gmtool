import { describe, it, expect } from 'vitest';
import { noir } from '../../src/npc/packs/noir.js';
import { getGenrePack, listGenrePacks } from '../../src/npc/packs/index.js';

const FIELDS = ['firstNames', 'surnames', 'looks', 'manners', 'wants', 'secrets', 'voices'];

describe('noir genre pack', () => {
  it('has an id, label, and all non-empty tables', () => {
    expect(noir.id).toBe('noir');
    expect(noir.label).toMatch(/noir/i);
    for (const f of FIELDS) {
      expect(Array.isArray(noir.tables[f]), `${f} is array`).toBe(true);
      expect(noir.tables[f].length, `${f} non-empty`).toBeGreaterThanOrEqual(6);
      expect(noir.tables[f].every((x) => typeof x === 'string' && x.length > 0)).toBe(true);
    }
  });

  it('is resolvable from the registry', () => {
    expect(getGenrePack('noir')).toBe(noir);
    expect(getGenrePack('missing')).toBe(null);
    expect(listGenrePacks()).toEqual([{ id: 'noir', label: noir.label }]);
  });
});
