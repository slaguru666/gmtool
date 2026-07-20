export function analyzeClues(clues = [], revealed = []) {
  const seen = new Set(revealed);
  const essential = clues.filter((c) => c.essential);
  const missingEssential = essential.filter((c) => !seen.has(c.id));
  return {
    total: clues.length,
    revealedCount: clues.filter((c) => seen.has(c.id)).length,
    essentialTotal: essential.length,
    essentialRevealed: essential.length - missingEssential.length,
    missingEssential,
    solvable: missingEssential.length === 0,
  };
}
