import { describe, it, expect } from 'vitest';
import { searchArt } from '../../src/art/search.js';

const M = [
  { id: 'a', src: 'a.png', label: 'Detective in alley', tags: ['detective', 'alley', 'rain'] },
  { id: 'b', src: 'b.png', label: 'Neon street', tags: ['street', 'neon', 'rain'] },
  { id: 'c', src: 'c.png', label: 'Worn portrait', tags: ['portrait', 'face'] },
];

describe('searchArt', () => {
  it('returns the whole manifest for a blank query, in order', () => {
    expect(searchArt(M, '').map((x) => x.id)).toEqual(['a', 'b', 'c']);
    expect(searchArt(M, '   ').map((x) => x.id)).toEqual(['a', 'b', 'c']);
  });

  it('ranks by number of matched terms', () => {
    // "rain alley" -> a matches both (2), b matches rain (1), c matches none
    expect(searchArt(M, 'rain alley').map((x) => x.id)).toEqual(['a', 'b']);
  });

  it('matches substrings in tags or label, case-insensitive', () => {
    expect(searchArt(M, 'DETECT').map((x) => x.id)).toEqual(['a']);
    expect(searchArt(M, 'portrait').map((x) => x.id)).toEqual(['c']);
  });

  it('breaks rank ties by original manifest order', () => {
    // "rain" -> a and b both match once; a comes first in manifest
    expect(searchArt(M, 'rain').map((x) => x.id)).toEqual(['a', 'b']);
  });
});
