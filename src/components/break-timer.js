import { fmtCountdown } from '../core/format.js';

// Break timer tray. Pauses the session clock for a meal/comfort break so the
// break time never poisons drift. The shell owns the clock; this component just
// picks a duration and emits start-break / end-break, and renders the countdown
// fed back to it via `state` ({ onBreak, remainingMs }).
const DURATIONS = [5, 10, 15, 20];

export class BreakTimer extends HTMLElement {
  constructor() {
    super();
    this._state = { onBreak: false, remainingMs: null };
    this._minutes = 10;
  }
  connectedCallback() { this.render(); }

  set state(v) { this._state = v || { onBreak: false, remainingMs: null }; this.render(); }
  get state() { return this._state; }

  render() {
    const { onBreak, remainingMs } = this._state;

    if (onBreak) {
      const over = remainingMs != null && remainingMs < 0;
      const clock = remainingMs != null ? fmtCountdown(Math.abs(remainingMs)) : '';
      const line = remainingMs == null
        ? 'On break — clock paused'
        : over ? `Over by ${clock} — resume when ready` : `Back in ${clock}`;
      this.innerHTML = `
        <div class="break-timer">
          <div class="break-status ${over ? 'over' : ''}" data-role="status">${line}</div>
          <button class="break-end" data-role="end">▶ End break — resume clock</button>
        </div>`;
      this.querySelector('[data-role=end]').addEventListener('click', () =>
        this.dispatchEvent(new CustomEvent('end-break', { bubbles: true })));
      return;
    }

    const pills = DURATIONS.map((m) =>
      `<button class="break-dur ${m === this._minutes ? 'on' : ''}" data-min="${m}">${m}m</button>`).join('');
    this.innerHTML = `
      <div class="break-timer">
        <div class="break-durs" data-role="durs">${pills}</div>
        <button class="break-start" data-role="start">⏸ Start break — pause clock</button>
      </div>`;
    this.querySelectorAll('[data-min]').forEach((b) =>
      b.addEventListener('click', () => { this._minutes = Number(b.dataset.min); this.render(); }));
    this.querySelector('[data-role=start]').addEventListener('click', () =>
      this.dispatchEvent(new CustomEvent('start-break', { detail: { minutes: this._minutes }, bubbles: true })));
  }
}
customElements.define('break-timer', BreakTimer);
