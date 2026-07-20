// Pure helpers for the generated-art library layer. Generated assets are cached
// alongside the static manifest and become searchable/offline. Capped to bound
// localStorage (generated images can be large).
export function slugifyLabel(s) {
  return String(s).normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function makeAssetId(label, takenIds) {
  const taken = new Set(takenIds);
  const base = slugifyLabel(label) || 'generated';
  let id = base, n = 2;
  while (taken.has(id)) id = `${base}-${n++}`;
  return id;
}

// Returns a new `generated` array with the asset prepended (newest first),
// a unique id assigned, and the list capped.
export function addGenerated(generated, base, asset, cap = 24) {
  const takenIds = [...base, ...generated].map((a) => a.id);
  const entry = {
    id: makeAssetId(asset.label || 'generated', takenIds),
    src: asset.src,
    label: asset.label || 'Generated',
    tags: Array.isArray(asset.tags) ? asset.tags : [],
    generated: true,
  };
  return [entry, ...generated].slice(0, cap);
}
