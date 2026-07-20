import { escapeHtml } from '../core/escape-html.js';

// The cast roster tray. Renders scenario.cast (NPCs): name + one-line note,
// with each secret hidden behind a tap-to-reveal so spoilers stay off-screen
// at the table. Reveal state is ephemeral component state (not persisted).
export class CastTray extends HTMLElement {
  constructor() {
    super();
    this._cast = [];
    this._revealed = new Set();
  }
  connectedCallback() { this.render(); }

  set cast(v) { this._cast = Array.isArray(v) ? v : []; this._revealed = new Set(); this.render(); }
  get cast() { return this._cast; }

  render() {
    if (this._cast.length === 0) {
      this.innerHTML = `<div class="cast-tray"><div class="cast-empty" data-role="empty">No cast configured for this scenario.</div></div>`;
      return;
    }
    const rows = this._cast.map((c) => {
      const revealed = this._revealed.has(c.id);
      const hasSecret = !!c.secret;
      return `
        <div class="cast-row" data-cast-id="${escapeHtml(c.id)}">
          <div class="cast-body">
            <div class="cast-name">${escapeHtml(c.name)}${c.kind && c.kind !== 'npc' ? ` <span class="cast-kind">${escapeHtml(c.kind)}</span>` : ''}</div>
            ${c.note ? `<div class="cast-note">${escapeHtml(c.note)}</div>` : ''}
            ${hasSecret && revealed ? `<div class="cast-secret" data-role="secret">${escapeHtml(c.secret)}</div>` : ''}
          </div>
          ${hasSecret ? `<button class="cast-reveal" data-role="reveal">${revealed ? 'Hide' : 'Secret'}</button>` : ''}
        </div>`;
    }).join('');

    this.innerHTML = `<div class="cast-tray"><div class="cast-list">${rows}</div></div>`;

    this.querySelectorAll('[data-cast-id]').forEach((row) => {
      const btn = row.querySelector('[data-role=reveal]');
      if (!btn) return;
      btn.addEventListener('click', () => {
        const id = row.dataset.castId;
        if (this._revealed.has(id)) this._revealed.delete(id);
        else this._revealed.add(id);
        this.render();
      });
    });
  }
}
customElements.define('cast-tray', CastTray);
