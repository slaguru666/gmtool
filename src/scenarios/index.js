// Scenario registry — maps a scenario id to its module so the con hub can
// deep-link a slot into the shell. Register each new scenario module here.
import afterimage from './afterimage.js';
import exampleWithClues from './example-with-clues.js';

export const SCENARIOS = {
  [afterimage.meta.id]: afterimage,
  [exampleWithClues.meta.id]: exampleWithClues,
};

export function getScenario(id) {
  return SCENARIOS[id] || null;
}
