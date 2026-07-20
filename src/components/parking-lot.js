import { fmtElapsed } from '../core/format.js';
import { escapeHtml } from '../core/escape-html.js';

// Parking-lot tray: one-tap capture of a thread to return to, stamped with the
// session time it was parked. Notes are fed in from the shell (persisted there);
// the component emits add-note / remove-note.
export class ParkingLot extends HTMLElement {
  constructor() {
    super();
    this._notes = [];
  }
  connectedCallback() { this.render(); }

  set notes(v) { this._notes = Array.isArray(v) ? v : []; this.render(); }
  get notes() { return this._notes; }

  render() {
    const list = this._notes.length
      ? this._notes.map((n, i) => `
          <div class="pl-note" data-index="${i}">
            <span class="pl-at">${fmtElapsed(n.at || 0)}</span>
            <span class="pl-text">${escapeHtml(n.text)}</span>
            <button class="pl-del" data-role="del" data-index="${i}" aria-label="Resolve">✕</button>
          </div>`).join('')
      : `<div class="pl-empty" data-role="empty">No parked threads yet.</div>`;

    this.innerHTML = `
      <div class="parking-lot">
        <div class="pl-add">
          <input class="pl-input" data-role="input" placeholder="park a thread to return to…" />
          <button class="pl-save" data-role="add">Park</button>
        </div>
        <div class="pl-list">${list}</div>
      </div>`;

    const input = this.querySelector('[data-role=input]');
    const add = () => {
      const text = input.value.trim();
      if (!text) return;
      this.dispatchEvent(new CustomEvent('add-note', { detail: { text }, bubbles: true }));
    };
    this.querySelector('[data-role=add]').addEventListener('click', add);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') add(); });
    this.querySelectorAll('[data-role=del]').forEach((b) =>
      b.addEventListener('click', () =>
        this.dispatchEvent(new CustomEvent('remove-note', { detail: { index: Number(b.dataset.index) }, bubbles: true }))));
  }
}
customElements.define('parking-lot', ParkingLot);
