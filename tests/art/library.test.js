import { describe, it, expect } from 'vitest';
import { addGenerated, makeAssetId, slugifyLabel } from '../../src/art/library.js';

const BASE = [{ id: 'rain-pier', src: '/a.png', label: 'Pier in the rain', tags: ['rain'] }];

describe('art library helpers', () => {
  it('slugifies labels', () => {
    expect(slugifyLabel('Tired Detective — in the Rain')).toBe('tired-detective-in-the-rain');
  });

  it('makes ids unique against taken ids', () => {
    expect(makeAssetId('Rainy Pier', [])).toBe('rainy-pier');
    expect(makeAssetId('Rainy Pier', ['rainy-pier'])).toBe('rainy-pier-2');
  });

  it('prepends a generated asset with a unique id and generated flag', () => {
    const out = addGenerated([], BASE, { src: 'data:x', label: 'Rainy Pier', tags: ['rain', 'pier'] });
    expect(out).toHaveLength(1);
    expect(out[0]).toEqual({ id: 'rainy-pier', src: 'data:x', label: 'Rainy Pier', tags: ['rain', 'pier'], generated: true });
  });

  it('avoids colliding with a base manifest id', () => {
    const out = addGenerated([], BASE, { src: 'data:y', label: 'Pier in the rain' });
    expect(out[0].id).toBe('pier-in-the-rain'); // differs from base 'rain-pier', so no suffix needed
    const out2 = addGenerated(out, BASE, { src: 'data:z', label: 'Pier in the rain' });
    expect(out2[0].id).toBe('pier-in-the-rain-2');
  });

  it('caps the generated list to bound storage (newest kept)', () => {
    let gen = [];
    for (let i = 0; i < 30; i++) gen = addGenerated(gen, BASE, { src: 'd' + i, label: 'img ' + i }, 24);
    expect(gen).toHaveLength(24);
    expect(gen[0].label).toBe('img 29'); // newest first
  });
});
