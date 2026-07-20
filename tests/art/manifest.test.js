import { describe, it, expect } from 'vitest';
import artManifest, { validateArtManifest } from '../../src/art/manifest.js';

describe('art manifest', () => {
  it('flags malformed entries', () => {
    expect(validateArtManifest([{ id: '', src: 'x', tags: [] }])).toContain('entry[0].id required');
    expect(validateArtManifest([{ id: 'a', src: '', tags: [] }])).toContain('entry[0].src required');
    expect(validateArtManifest([{ id: 'a', src: 'x' }])).toContain('entry[0].tags must be an array');
  });

  it('ships a valid, non-empty seed manifest with unique ids', () => {
    expect(validateArtManifest(artManifest)).toEqual([]);
    expect(artManifest.length).toBeGreaterThanOrEqual(3);
    const ids = artManifest.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(artManifest.every((a) => a.src.startsWith('/art/'))).toBe(true);
  });
});
