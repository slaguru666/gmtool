// Scenario registry — maps a scenario id to its module so the con hub can
// deep-link a slot into the shell. Register each new scenario module here.
import afterimage from './afterimage.js';
import dayOne from './day-one.js';
import vainCrown from './vain-crown.js';
import silveryMoon from './silvery-moon.js';
import chopper from './chopper.js';
import princesBride from './princes-bride.js';
import exampleWithClues from './example-with-clues.js';

const modules = [afterimage, dayOne, vainCrown, silveryMoon, chopper, princesBride, exampleWithClues];

export const SCENARIOS = Object.fromEntries(modules.map((m) => [m.meta.id, m]));

export function getScenario(id) {
  return SCENARIOS[id] || null;
}
