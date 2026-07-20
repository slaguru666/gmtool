import { createStore } from '../core/store.js';
import { initialClock, start, elapsedMs } from '../core/clock.js';
import { nextUnreachedBeat } from '../core/timeline.js';
import './director-rail.js';
import './dice-tray.js';
import './npc-tray.js';
import './art-tray.js';
import './prop-viewer.js';
import './clue-net.js';

export class GmShell extends HTMLElement {
  constructor() {
    super();
    this.now = () => Date.now();
    this.scenario = null;
    this.store = null;
    this.clockState = initialClock();
    this.stamps = {};
    this.cast = [];
    this.revealedClues = [];
    this._tick = null;
  }

  connectedCallback() {
    this.innerHTML = `
      <director-rail></director-rail>
      <main class="stage">
        <dice-tray hidden></dice-tray>
        <npc-tray hidden></npc-tray>
        <art-tray hidden></art-tray>
        <clue-net hidden></clue-net>
      </main>
      <prop-viewer></prop-viewer>`;
    this.addEventListener('reached', () => this.onReached());
    this.addEventListener('open-tool', (e) => this.onOpenTool(e));
    this.addEventListener('keep-npc', (e) => this.onKeepNpc(e));
    this.addEventListener('show-prop', (e) => this.onShowProp(e));
    this.addEventListener('toggle-clue', (e) => this.onToggleClue(e));
  }

  loadScenario(scenario) {
    this.scenario = scenario;
    this.store = createStore(scenario.meta.id);
    this.clockState = this.store.get('clock', initialClock());
    this.stamps = this.store.get('stamps', {});
    this.cast = this.store.get('cast', []);
    this.querySelector('dice-tray').systemId = scenario.meta.system;
    this.revealedClues = this.store.get('revealedClues', []);
    const net = this.querySelector('clue-net');
    net.clues = this.scenario.clues || [];
    net.revealed = this.revealedClues;
    this.refresh();
  }

  startSession() {
    this.clockState = start(this.clockState, this.now());
    this.store.set('clock', this.clockState);
    if (!this._tick) this._tick = setInterval(() => this.refresh(), 1000);
    this.refresh();
  }

  elapsedMs() { return elapsedMs(this.clockState, this.now()); }

  onReached() {
    const beat = nextUnreachedBeat(this.scenario.timeline, this.stamps);
    if (!beat) return;
    this.stamps = { ...this.stamps, [beat.id]: this.elapsedMs() / 60000 };
    this.store.set('stamps', this.stamps);
    this.refresh();
  }

  onOpenTool(e) {
    const tool = e.detail?.tool;
    const trays = { dice: 'dice-tray', npc: 'npc-tray', art: 'art-tray', clues: 'clue-net' };
    if (!(tool in trays)) return;
    const target = this.querySelector(trays[tool]);
    const willShow = target.hidden;
    for (const sel of Object.values(trays)) this.querySelector(sel).hidden = true;
    target.hidden = !willShow;
  }

  onKeepNpc(e) {
    this.cast = [...this.cast, e.detail];
    this.store.set('cast', this.cast);
  }

  onToggleClue(e) {
    const id = e.detail.id;
    this.revealedClues = this.revealedClues.includes(id)
      ? this.revealedClues.filter((x) => x !== id)
      : [...this.revealedClues, id];
    this.store.set('revealedClues', this.revealedClues);
    this.querySelector('clue-net').revealed = this.revealedClues;
  }

  onShowProp(e) {
    this.querySelector('prop-viewer').show(e.detail.src, e.detail.label);
  }

  refresh() {
    this.querySelector('director-rail').update({
      scenario: this.scenario,
      elapsedMs: this.elapsedMs(),
      stamps: this.stamps,
    });
  }
}
customElements.define('gm-shell', GmShell);
