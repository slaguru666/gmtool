import { describe, it, expect } from 'vitest';
import { analyzeClues } from '../../src/clues/safety-net.js';

const CLUES = [
  { id: 'c1', label: 'The door-cam still', essential: true, fallback: 'The radio names the time' },
  { id: 'c2', label: "Priya's phone", essential: true, fallback: 'The neighbour saw her leave' },
  { id: 'c3', label: 'A nice-to-have colour detail', essential: false },
];

describe('analyzeClues', () => {
  it('reports counts and solvability from the revealed set', () => {
    const r = analyzeClues(CLUES, ['c1']);
    expect(r.total).toBe(3);
    expect(r.revealedCount).toBe(1);
    expect(r.essentialTotal).toBe(2);
    expect(r.essentialRevealed).toBe(1);
    expect(r.solvable).toBe(false);
    expect(r.missingEssential.map((c) => c.id)).toEqual(['c2']);
    expect(r.missingEssential[0].fallback).toBe('The neighbour saw her leave');
  });

  it('is solvable once every essential clue is revealed', () => {
    const r = analyzeClues(CLUES, ['c1', 'c2']);
    expect(r.solvable).toBe(true);
    expect(r.missingEssential).toEqual([]);
  });

  it('treats an empty clue list as vacuously solvable', () => {
    const r = analyzeClues([], []);
    expect(r.solvable).toBe(true);
    expect(r.essentialTotal).toBe(0);
    expect(r.total).toBe(0);
  });

  it('defaults revealed to empty', () => {
    expect(analyzeClues(CLUES).essentialRevealed).toBe(0);
  });
});
