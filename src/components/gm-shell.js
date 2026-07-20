import { createStore } from '../core/store.js';
import { initialClock, start, elapsedMs } from '../core/clock.js';
import { nextUnreachedBeat } from '../core/timeline.js';
import './director-rail.js';
import './dice-tray.js';

export class GmShell extends HTMLElement {
  constructor() {
    super();
    this.now = () => Date.now();
    this.scenario = null;
    this.store = null;
    this.clockState = initialClock();
    this.stamps = {};
    this._tick = null;
  }

  connectedCallback() {
    this.innerHTML = `
      <director-rail></director-rail>
      <main class="stage"><dice-tray hidden></dice-tray></main>`;
    this.addEventListener('reached', () => this.onReached());
    this.addEventListener('open-tool', (e) => this.onOpenTool(e));
  }

  loadScenario(scenario) {
    this.scenario = scenario;
    this.store = createStore(scenario.meta.id);
    this.clockState = this.store.get('clock', initialClock());
    this.stamps = this.store.get('stamps', {});
    this.querySelector('dice-tray').systemId = scenario.meta.system;
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
    if (e.detail?.tool === 'dice') {
      const tray = this.querySelector('dice-tray');
      tray.hidden = !tray.hidden;
    }
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
