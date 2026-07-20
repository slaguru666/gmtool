import { rollPool } from '../dice/roller.js';
import { getRulePack, listRulePacks } from '../dice/rulepacks/index.js';

const DICE = [4, 6, 8, 10, 12, 20, 100];

export class DiceTray extends HTMLElement {
  constructor() {
    super();
    this._sides = 8;
    this._count = 3;
    this._systemId = 'year-zero';
    this.rng = Math.random;
    this.last = null;
    this.params = {};
  }
  get sides() { return this._sides; }
  set sides(v) { this._sides = Number(v); this.render(); }
  get count() { return this._count; }
  set count(v) { this._count = Number(v); }
  set systemId(v) { this._systemId = v; this.render(); this.syncParams(); }
  get systemId() { return this._systemId; }

  connectedCallback() { this.render(); this.syncParams(); }

  syncParams() {
    const pack = getRulePack(this._systemId);
    const next = {};
    if (pack && pack.params) {
      for (const p of pack.params) {
        const input = this.querySelector(`[data-param="${p.key}"]`);
        const raw = input ? input.value : '';
        next[p.key] = raw === '' ? p.default : Number(raw);
      }
    }
    this.params = next;
  }

  roll() {
    const { results, total } = rollPool([{ sides: this._sides, count: this._count }], this.rng);
    const pack = getRulePack(this._systemId);
    const verdict = pack ? pack.interpret(results, this.params) : null;
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
    const pack = getRulePack(this._systemId);
    const verdict = this.last?.verdict
      ? (pack && pack.summary ? pack.summary(this.last.verdict) : '')
      : '';

    const packs = listRulePacks();
    const packBar = [{ id: '', label: 'Any die' }, ...packs].map((p) =>
      `<button class="pack ${p.id === this._systemId ? 'on' : ''}" data-pack-id="${p.id}">${p.label}</button>`).join('');
    const active = getRulePack(this._systemId);
    const paramInputs = (active && active.params ? active.params : []).map((p) =>
      `<label class="param">${p.label}<input type="number" data-param="${p.key}" value="${this.params[p.key] ?? p.default}" /></label>`).join('');

    this.innerHTML = `
      <div class="dice-tray">
        <div class="pack-bar">${packBar}</div>
        <div class="picker">${picker}</div>
        <div class="params">${paramInputs}</div>
        <div class="felt">${felt}</div>
        <div class="verdict" data-role="verdict">${verdict}</div>
        <button class="roll" data-role="roll">Roll</button>
      </div>`;

    this.querySelectorAll('[data-sides]').forEach((b) =>
      b.addEventListener('click', () => { this.sides = Number(b.dataset.sides); }));
    this.querySelectorAll('[data-pack-id]').forEach((b) =>
      b.addEventListener('click', () => { this._systemId = b.dataset.packId; this.render(); this.syncParams(); }));
    this.querySelectorAll('[data-param]').forEach((inp) =>
      inp.addEventListener('input', () => this.syncParams()));
    this.querySelector('[data-role=roll]').addEventListener('click', () => this.roll());
  }
}
customElements.define('dice-tray', DiceTray);
