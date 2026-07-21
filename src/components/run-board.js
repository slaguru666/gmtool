import { analyze } from '../core/timeline.js';
import { fmtElapsed, fmtDrift } from '../core/format.js';
import { escapeHtml } from '../core/escape-html.js';

// The always-there stage view behind the trays: the whole run at a glance —
// every beat with its target time, done beats stamped and dimmed, the current
// beat highlighted, hard triggers marked. Fed by the shell each refresh.
export class RunBoard extends HTMLElement {
  constructor() {
    super();
    this._state = { scenario: null, elapsedMs: 0, stamps: {} };
  }
  connectedCallback() { this.render(); }
  update(patch) { Object.assign(this._state, patch); this.render(); }

  render() {
    const { scenario, elapsedMs, stamps } = this._state;
    if (!scenario) { this.innerHTML = ''; return; }
    const m = analyze(scenario.timeline, elapsedMs / 60000, stamps);
    const drift = fmtDrift(m.driftMin);
    const driftClass = m.driftMin > 0 ? 'behind' : 'ahead';
    // Highlight the next beat still to reach — the "you are here → next" cue.
    const nextId = scenario.timeline.find((b) => stamps[b.id] == null)?.id;

    const rows = scenario.timeline.map((b) => {
      const done = stamps[b.id] != null;
      const current = b.id === nextId;
      const cls = done ? 'done' : current ? 'current' : 'upcoming';
      const mark = done ? `✓ ${fmtElapsed((stamps[b.id] || 0) * 60000)}` : current ? '▶ next' : '';
      return `
        <div class="rb-beat ${cls}${b.hardTrigger ? ' hard' : ''}" data-beat-id="${escapeHtml(b.id)}">
          <div class="rb-time">${fmtElapsed((b.targetMin || 0) * 60000)}</div>
          <div class="rb-body">
            <div class="rb-label">${escapeHtml(b.label)}${b.hardTrigger ? ' <span class="rb-hard">hard</span>' : ''}</div>
            ${b.cutHint ? `<div class="rb-cut">cut: ${escapeHtml(b.cutHint)}</div>` : ''}
          </div>
          <div class="rb-mark">${mark}</div>
        </div>`;
    }).join('');

    const meta = [scenario.meta.slot, scenario.meta.playMinutes ? `${scenario.meta.playMinutes}m` : null]
      .filter(Boolean).map(escapeHtml).join(' · ');

    this.innerHTML = `
      <div class="run-board">
        <div class="rb-head">
          <span class="rb-title">${escapeHtml(scenario.meta.title || '')}</span>
          <span class="rb-meta">${meta}${drift ? ` · <span class="rb-drift ${driftClass}">${escapeHtml(drift)}</span>` : ''}</span>
        </div>
        <div class="rb-list">${rows}</div>
      </div>`;
  }
}
customElements.define('run-board', RunBoard);
