import { analyzeSchedule } from '../con/schedule.js';
import { escapeHtml } from '../core/escape-html.js';

const STATUS_LABEL = { live: 'Live now', next: 'Up next', done: 'Done', upcoming: 'Upcoming' };

export class ConHub extends HTMLElement {
  constructor() {
    super();
    this._con = null;
    this.now = () => Date.now();
  }
  connectedCallback() { this.render(); }

  set con(v) { this._con = v || null; this.render(); }
  get con() { return this._con; }

  render() {
    if (!this._con) {
      this.innerHTML = `<div class="hub hub--empty" data-role="empty">No convention loaded</div>`;
      return;
    }
    const con = this._con;
    const a = analyzeSchedule(con.slots || [], this.now());

    const summary = a.liveNow
      ? `<span class="hub-live">● Live now — ${escapeHtml(a.liveNow.title)}</span>`
      : (a.upNext
          ? `<span class="hub-next">Up next — ${escapeHtml(a.upNext.title)}</span>`
          : `<span class="hub-idle">No sessions scheduled</span>`);

    const cards = a.slots.map((s) => {
      const canOpen = !!s.scenarioId;
      const meta = [s.slot, s.system, s.players ? `${s.players}p` : null]
        .filter(Boolean).map(escapeHtml).join(' · ');
      const action = canOpen
        ? `<button class="hub-open" data-role="open" data-scenario-id="${escapeHtml(s.scenarioId)}">Open</button>`
        : `<span class="hub-soon" data-role="not-ready">Not yet ported</span>`;
      return `
        <div class="hub-card status-${s.status}" data-slot-id="${escapeHtml(s.id)}" data-status="${s.status}">
          <div class="hub-card-main">
            <div class="hub-card-title">${escapeHtml(s.title)} <span class="hub-badge badge-${s.status}">${STATUS_LABEL[s.status]}</span></div>
            <div class="hub-card-meta">${meta}</div>
          </div>
          ${action}
        </div>`;
    }).join('');

    this.innerHTML = `
      <div class="hub">
        <header class="hub-head">
          <h1 class="hub-title">${escapeHtml(con.meta?.title || 'Convention')}</h1>
          <div class="hub-summary" data-role="summary">${summary}</div>
        </header>
        <div class="hub-list">${cards}</div>
      </div>`;

    this.querySelectorAll('[data-role=open]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('open-scenario', {
          detail: { scenarioId: btn.dataset.scenarioId }, bubbles: true,
        }));
      });
    });
  }
}
customElements.define('con-hub', ConHub);
