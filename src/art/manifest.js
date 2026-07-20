export function validateArtManifest(m) {
  if (!Array.isArray(m)) return ['manifest must be an array'];
  const errors = [];
  m.forEach((a, i) => {
    if (!a || typeof a !== 'object') { errors.push(`entry[${i}] must be an object`); return; }
    if (!a.id) errors.push(`entry[${i}].id required`);
    if (!a.src) errors.push(`entry[${i}].src required`);
    if (!Array.isArray(a.tags)) errors.push(`entry[${i}].tags must be an array`);
  });
  return errors;
}

// Seed set of placeholder pencil assets. Real convention art is added here as data.
export default [
  { id: 'detective-alley', src: '/art/detective-alley.png', label: 'Detective in alley', tags: ['detective', 'alley', 'rain', 'coat', 'tired'] },
  { id: 'neon-street', src: '/art/neon-street.png', label: 'Neon street', tags: ['street', 'neon', 'rain', 'city', 'night'] },
  { id: 'worn-portrait', src: '/art/worn-portrait.png', label: 'Worn portrait', tags: ['portrait', 'face', 'worn', 'close-up'] },
  { id: 'doorway-figure', src: '/art/doorway-figure.png', label: 'Figure in a doorway', tags: ['doorway', 'figure', 'shadow', 'coat'] },
  { id: 'rain-pier', src: '/art/rain-pier.png', label: 'Pier in the rain', tags: ['pier', 'rain', 'water', 'night', 'wide'] },
];
