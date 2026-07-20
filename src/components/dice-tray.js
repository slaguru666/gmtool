import { rollPool } from '../dice/roller.js';
import { getRulePack } from '../dice/rulepacks/index.js';

const DICE = [4, 6, 8, 10, 12, 20, 100];

export class DiceTray extends HTMLElement {
  constructor() {
    super();
    this._sides = 8;
    this._count = 3;
    this._systemId = 'year-zero';
    this.rng = Math.random;
    this.last = null;
  }
  get sides() { return this._sides; }
  set sides(v) { this._sides = Number(v); this.render(); }
  get count() { return this._count; }
  set count(v) { this._count = Number(v); }
  set systemId(v) { this._systemId = v; }
  get systemId() { return this._systemId; }

  connectedCallback() { this.render(); }

  roll() {
    const { results, total } = rollPool([{ sides: this._sides, count: this._count }], this.rng);
    const pack = getRulePack(this._systemId);
    const verdict = pack ? pack.interpret(results) : null;
    this.last = { results, total, verdict };
    this.render();
    this.dispatchEvent(new CustomEvent('rolled', { detail: this.last, bubbles: true }));
  }

  render() {
    const picker = DICE.map((n) =>
      `<button class="die ${n === this._sides ? 'sel' : ''}" data-sides="${n}">d${n}</button>`).join('');
    const felt = this.last
      ? this.last.results.map((r) => `<span class="rolled" data-value="${r.value}">${r.value}</span>`).join('')
      : '<span class="hint">Tap Roll</span>';
    const verdict = this.last?.verdict
      ? `${this.last.verdict.successes} success${this.last.verdict.successes === 1 ? '' : 'es'}` +
        (this.last.verdict.ones ? ` · ${this.last.verdict.ones} stress` : '')
      : '';

    this.innerHTML = `
      <div class="dice-tray">
        <div class="picker">${picker}</div>
        <div class="felt">${felt}</div>
        <div class="verdict" data-role="verdict">${verdict}</div>
        <button class="roll" data-role="roll">Roll</button>
      </div>`;

    this.querySelectorAll('[data-sides]').forEach((b) =>
      b.addEventListener('click', () => { this.sides = Number(b.dataset.sides); }));
    this.querySelector('[data-role=roll]').addEventListener('click', () => this.roll());
  }
}
customElements.define('dice-tray', DiceTray);
