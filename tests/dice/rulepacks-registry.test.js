import { describe, it, expect } from 'vitest';
import { getRulePack, listRulePacks } from '../../src/dice/rulepacks/index.js';

describe('rule-pack registry', () => {
  it('lists registered packs as {id,label}', () => {
    const packs = listRulePacks();
    expect(packs.some((p) => p.id === 'year-zero' && typeof p.label === 'string')).toBe(true);
  });
});
