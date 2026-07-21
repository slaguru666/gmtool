import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

// PNG: 8-byte signature, then IHDR with width/height at bytes 16..24.
function pngInfo(path) {
  const b = readFileSync(path);
  const isPng = b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
  return { isPng, width: b.readUInt32BE(16), height: b.readUInt32BE(20), bytes: b.length };
}

const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'));

describe('app icons', () => {
  it('every manifest icon exists as a valid PNG of the declared size', () => {
    expect(manifest.icons.length).toBeGreaterThan(0);
    for (const icon of manifest.icons) {
      const path = 'public' + icon.src;          // e.g. /icons/icon-192.png → public/icons/...
      const info = pngInfo(path);
      const [w] = icon.sizes.split('x').map(Number);
      expect(info.isPng, path).toBe(true);
      expect(info.width, path + ' width').toBe(w);
      expect(info.height, path + ' height').toBe(w);
      expect(info.bytes, path + ' non-empty').toBeGreaterThan(100);
    }
  });

  it('ships the apple-touch icon referenced by index.html', () => {
    expect(readFileSync('index.html', 'utf8')).toContain('/icons/icon-180.png');
    expect(pngInfo('public/icons/icon-180.png').width).toBe(180);
  });
});
