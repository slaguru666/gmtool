// Scenario registry — maps a scenario id to its module so the con hub can
// deep-link a slot into the shell. Register each new scenario module here.
import afterimage from './afterimage.js';
import dayOne from './day-one.js';
import vainCrown from './vain-crown.js';
import silveryMoon from './silvery-moon.js';
import chopper from './chopper.js';
import princesBride from './princes-bride.js';
import exampleWithClues from './example-with-clues.js';
// Contingency 2027
import perpetualOrder from './perpetual-order.js';
import sixOclockSitting from './six-oclock-sitting.js';
import blackSummer from './black-summer.js';
import continuousService from './continuous-service.js';
import londonParticular from './london-particular.js';
import vivaVoce from './viva-voce.js';
import mrParkersDiary from './mr-parkers-diary.js';
import paperChildren from './paper-children.js';
import closingWeekend from './closing-weekend.js';
import theFavour from './the-favour.js';
import provenance from './provenance.js';

// Current con first: the Tab5 picker lists scenarios in this order.
const modules = [
  perpetualOrder, afterimage, sixOclockSitting, blackSummer, continuousService, londonParticular,
  vivaVoce, mrParkersDiary, paperChildren, closingWeekend, theFavour, provenance,
  dayOne, vainCrown, silveryMoon, chopper, princesBride, exampleWithClues,
];

export const SCENARIOS = Object.fromEntries(modules.map((m) => [m.meta.id, m]));

export function getScenario(id) {
  return SCENARIOS[id] || null;
}
