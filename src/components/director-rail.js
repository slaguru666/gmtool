import { analyze } from '../core/timeline.js';
import { fmtElapsed, fmtDrift } from '../core/format.js';

export class DirectorRail extends HTMLElement {
  constructor() {
    super();
    this._state = { scenario: null, elapsedMs: 0, stamps: {} };
  }
  connectedCallback() { this.render(); }
  update(patch) { Object.assign(this._state, patch); this.render(); }

  render() {
    const { scenario, elapsedMs, stamps } = this._state;
    if (!scenario) { this.innerHTML = `<div class="rail rail--empty">No scenario loaded</div>`; return; }
    const m = analyze(scenario.timeline, elapsedMs / 60000, stamps);
    const here = m.currentBeat ? m.currentBeat.label : (scenario.timeline[0]?.label ?? '—');
    const drift = fmtDrift(m.driftMin);
    const driftClass = m.driftMin > 0 ? 'behind' : 'ahead';
    const nh = m.nextHardTrigger;
    const nhText = nh ? `${nh.label} · ~${Math.max(0, Math.round(m.minutesToNextHard))}m` : '—';

    this.innerHTML = `
      <div class="rail">
        <div class="cell"><span class="k">Session</span><span class="v" data-role="clock">${fmtElapsed(elapsedMs)}</span></div>
        <div class="cell here"><span class="k">You are here</span>
          <span class="v"><span data-role="here">${here}</span>${drift ? ` <span class="drift ${driftClass}">${drift}</span>` : ''}</span></div>
        <div class="cell trig"><span class="k">Next hard trigger</span><span class="v" data-role="next">${nhText}</span></div>
        <button class="reached" data-role="reached">✓ Reached it</button>
        <button class="tray-btn" data-role="open-hub" aria-label="Hub">🏠</button>
        <button class="tray-btn" data-role="open-dice" aria-label="Dice">🎲</button>
        <button class="tray-btn" data-role="open-npc" aria-label="NPC">👤</button>
        <button class="tray-btn" data-role="open-art" aria-label="Art">✏️</button>
        <button class="tray-btn" data-role="open-clues" aria-label="Clues">🔍</button>
        <button class="tray-btn" data-role="open-cast" aria-label="Cast">👥</button>
      </div>`;

    this.querySelector('[data-role=reached]').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('reached', { bubbles: true }));
    });
    this.querySelector('[data-role=open-hub]').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('open-hub', { bubbles: true }));
    });
    this.querySelector('[data-role=open-dice]').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('open-tool', { detail: { tool: 'dice' }, bubbles: true }));
    });
    this.querySelector('[data-role=open-npc]').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('open-tool', { detail: { tool: 'npc' }, bubbles: true }));
    });
    this.querySelector('[data-role=open-art]').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('open-tool', { detail: { tool: 'art' }, bubbles: true }));
    });
    this.querySelector('[data-role=open-clues]').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('open-tool', { detail: { tool: 'clues' }, bubbles: true }));
    });
    this.querySelector('[data-role=open-cast]').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('open-tool', { detail: { tool: 'cast' }, bubbles: true }));
    });
  }
}
customElements.define('director-rail', DirectorRail);
