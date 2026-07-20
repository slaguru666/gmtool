import { createStore } from '../core/store.js';
import { initialClock, start, pause, resume, elapsedMs, isRunning, isPaused } from '../core/clock.js';
import { nextUnreachedBeat } from '../core/timeline.js';
import { createWakeLock } from '../core/wake-lock.js';
import './director-rail.js';
import './dice-tray.js';
import './npc-tray.js';
import './art-tray.js';
import './prop-viewer.js';
import './clue-net.js';
import './cast-tray.js';
import './break-timer.js';
import './parking-lot.js';
import './con-hub.js';
import { getScenario } from '../scenarios/index.js';

export class GmShell extends HTMLElement {
  constructor() {
    super();
    this.now = () => Date.now();
    this.scenario = null;
    this.con = null;
    this.store = null;
    this.clockState = initialClock();
    this.stamps = {};
    this.cast = [];
    this.revealedClues = [];
    this.breakEndsAt = null;
    this.parkingLot = [];
    this.wakeLock = createWakeLock();
    this._tick = null;
  }

  connectedCallback() {
    this.innerHTML = `
      <con-hub hidden></con-hub>
      <director-rail></director-rail>
      <main class="stage">
        <dice-tray hidden></dice-tray>
        <npc-tray hidden></npc-tray>
        <art-tray hidden></art-tray>
        <clue-net hidden></clue-net>
        <cast-tray hidden></cast-tray>
        <break-timer hidden></break-timer>
        <parking-lot hidden></parking-lot>
      </main>
      <prop-viewer></prop-viewer>`;
    this.addEventListener('reached', () => this.onReached());
    this.addEventListener('open-tool', (e) => this.onOpenTool(e));
    this.addEventListener('keep-npc', (e) => this.onKeepNpc(e));
    this.addEventListener('show-prop', (e) => this.onShowProp(e));
    this.addEventListener('toggle-clue', (e) => this.onToggleClue(e));
    this.addEventListener('start-break', (e) => this.onStartBreak(e));
    this.addEventListener('end-break', () => this.onEndBreak());
    this.addEventListener('add-note', (e) => this.onAddNote(e));
    this.addEventListener('remove-note', (e) => this.onRemoveNote(e));
    this.addEventListener('toggle-wake', () => this.onToggleWake());
    this.addEventListener('open-scenario', (e) => this.onOpenScenario(e));
    this.addEventListener('open-hub', () => this.showHub());
  }

  loadCon(con) {
    this.con = con;
    const hub = this.querySelector('con-hub');
    hub.now = this.now;
    hub.con = con;
    this.showHub();
  }

  showHub() {
    this.querySelector('con-hub').hidden = false;
    this.querySelector('director-rail').hidden = true;
    this.querySelector('.stage').hidden = true;
  }

  showSession() {
    this.querySelector('con-hub').hidden = true;
    this.querySelector('director-rail').hidden = false;
    this.querySelector('.stage').hidden = false;
  }

  onOpenScenario(e) {
    const scenario = getScenario(e.detail?.scenarioId);
    if (!scenario) return;
    this.loadScenario(scenario);
    this.showSession();
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
    this.querySelector('cast-tray').cast = this.scenario.cast || [];
    this.breakEndsAt = this.store.get('break', null);
    this.parkingLot = this.store.get('parkingLot', []);
    this.querySelector('parking-lot').notes = this.parkingLot;
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
    const trays = { dice: 'dice-tray', npc: 'npc-tray', art: 'art-tray', clues: 'clue-net', cast: 'cast-tray', break: 'break-timer', parking: 'parking-lot' };
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

  onStartBreak(e) {
    if (!isRunning(this.clockState)) return;   // a break only makes sense mid-session
    const now = this.now();
    this.clockState = pause(this.clockState, now);
    this.breakEndsAt = now + (e.detail?.minutes ?? 10) * 60000;
    this.store.set('clock', this.clockState);
    this.store.set('break', this.breakEndsAt);
    if (!this._tick) this._tick = setInterval(() => this.refresh(), 1000);
    this.refresh();
  }

  onEndBreak() {
    if (!isPaused(this.clockState)) return;
    this.clockState = resume(this.clockState, this.now());
    this.breakEndsAt = null;
    this.store.set('clock', this.clockState);
    this.store.set('break', null);
    this.refresh();
  }

  onAddNote(e) {
    const text = e.detail?.text?.trim();
    if (!text) return;
    this.parkingLot = [...this.parkingLot, { at: this.elapsedMs(), text }];
    this.store.set('parkingLot', this.parkingLot);
    this.querySelector('parking-lot').notes = this.parkingLot;
  }

  onRemoveNote(e) {
    const i = e.detail?.index;
    if (i == null || i < 0 || i >= this.parkingLot.length) return;
    this.parkingLot = this.parkingLot.filter((_, idx) => idx !== i);
    this.store.set('parkingLot', this.parkingLot);
    this.querySelector('parking-lot').notes = this.parkingLot;
  }

  async onToggleWake() {
    await this.wakeLock.toggle();
    this.refresh();
  }

  refresh() {
    const paused = isPaused(this.clockState);
    this.querySelector('director-rail').update({
      scenario: this.scenario,
      elapsedMs: this.elapsedMs(),
      stamps: this.stamps,
      paused,
      wakeActive: this.wakeLock.isActive(),
    });
    this.querySelector('break-timer').state = {
      onBreak: paused,
      remainingMs: paused && this.breakEndsAt != null ? this.breakEndsAt - this.now() : null,
    };
  }
}
customElements.define('gm-shell', GmShell);
