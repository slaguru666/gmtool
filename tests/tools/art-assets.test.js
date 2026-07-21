import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import manifest from '../../src/art/manifest.js';

// Guards the bug we hit: the seed art manifest referenced /art/*.png files that
// did not exist, so the SPA fallback served index.html and thumbnails broke.
describe('seed art library assets', () => {
  it('every manifest image exists as a real PNG (not a broken reference)', () => {
    expect(manifest.length).toBeGreaterThan(0);
    for (const asset of manifest) {
      expect(asset.src.startsWith('/art/'), asset.id).toBe(true);
      const b = readFileSync('public' + asset.src);          // /art/x.png → public/art/x.png
      const isPng = b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
      expect(isPng, asset.src + ' is a PNG').toBe(true);
      expect(b.length, asset.src + ' non-empty').toBeGreaterThan(500);
    }
  });
});
