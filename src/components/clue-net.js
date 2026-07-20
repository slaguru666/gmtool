// src/components/clue-net.js
import { analyzeClues } from '../clues/safety-net.js';
import { escapeHtml } from '../core/escape-html.js';

export class ClueNet extends HTMLElement {
  constructor() {
    super();
    this._clues = [];
    this._revealed = [];
  }
  connectedCallback() { this.render(); }

  set clues(v) { this._clues = Array.isArray(v) ? v : []; this.render(); }
  get clues() { return this._clues; }
  set revealed(v) { this._revealed = Array.isArray(v) ? v : []; this.render(); }
  get revealed() { return this._revealed; }

  render() {
    if (this._clues.length === 0) {
      this.innerHTML = `<div class="clue-net"><div class="clue-empty" data-role="empty">No clues configured for this scenario.</div></div>`;
      return;
    }
    const a = analyzeClues(this._clues, this._revealed);
    const seen = new Set(this._revealed);
    const banner = a.solvable
      ? 'Solvable ✓'
      : `${a.missingEssential.length} essential clue${a.missingEssential.length === 1 ? '' : 's'} still needed`;

    const rows = this._clues.map((c) => {
      const revealed = seen.has(c.id);
      const showFallback = c.essential && !revealed && c.fallback;
      return `
        <div class="clue-row ${revealed ? 'revealed' : ''}" data-clue-id="${escapeHtml(c.id)}">
          <button class="clue-toggle" data-role="toggle">${revealed ? '●' : '○'}</button>
          <div class="clue-body">
            <div class="clue-label">${escapeHtml(c.label)}${c.essential ? ' <span class="clue-ess">essential</span>' : ''}${c.act ? ` <span class="clue-act">${escapeHtml(c.act)}</span>` : ''}</div>
            ${showFallback ? `<div class="clue-fallback">Fallback: ${escapeHtml(c.fallback)}</div>` : ''}
          </div>
        </div>`;
    }).join('');

    this.innerHTML = `
      <div class="clue-net">
        <div class="clue-banner ${a.solvable ? 'ok' : 'warn'}" data-role="solvable">${banner}</div>
        <div class="clue-list">${rows}</div>
      </div>`;

    this.querySelectorAll('[data-clue-id]').forEach((row) => {
      row.querySelector('[data-role=toggle]').addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('toggle-clue', { detail: { id: row.dataset.clueId }, bubbles: true }));
      });
    });
  }
}
customElements.define('clue-net', ClueNet);
