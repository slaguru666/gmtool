export function searchArt(manifest, query) {
  const terms = String(query ?? '').toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [...manifest];

  const scored = manifest.map((asset, index) => {
    const hay = [asset.label, ...(asset.tags || [])].join(' ').toLowerCase();
    const score = terms.reduce((s, term) => s + (hay.includes(term) ? 1 : 0), 0);
    return { asset, index, score };
  });

  return scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((r) => r.asset);
}
