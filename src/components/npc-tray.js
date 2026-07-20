import { generateNpc } from '../npc/generator.js';
import { getGenrePack, listGenrePacks } from '../npc/packs/index.js';

export class NpcTray extends HTMLElement {
  constructor() {
    super();
    this.rng = Math.random;
    this.genreId = 'noir';
    this.last = null;
    this._seedValue = '';
  }
  connectedCallback() { this.render(); }

  generate() {
    const input = this.querySelector('[data-role=seed]');
    this._seedValue = input ? input.value : '';
    const pack = getGenrePack(this.genreId);
    this.last = generateNpc(pack, this._seedValue, this.rng);
    this.render();
  }

  render() {
    const pills = listGenrePacks().map((p) =>
      `<button class="pill ${p.id === this.genreId ? 'on' : ''}" data-genre="${p.id}">${p.label}</button>`).join('');
    const n = this.last;
    const card = n ? `
      <div class="npc-card" data-role="card">
        <div class="npc-name" data-role="npc-name">${n.name}</div>
        <div class="npc-seed">${n.seed}</div>
        <dl>
          <dt>Look</dt><dd>${n.look}</dd>
          <dt>Manner</dt><dd>${n.manner}</dd>
          <dt>Wants</dt><dd>${n.wants}</dd>
          <dt>Secret</dt><dd class="secret">${n.secret}</dd>
          <dt>Voice</dt><dd>${n.voice}</dd>
        </dl>
        <div class="npc-actions">
          <button class="npc-btn" data-role="reroll">↻ Reroll</button>
          <button class="npc-btn keep" data-role="keep">＋ Keep in cast</button>
        </div>
      </div>` : '';

    this.innerHTML = `
      <div class="npc-tray">
        <div class="pills">${pills}</div>
        <input class="seed" data-role="seed" placeholder="a little info — e.g. nervous dock foreman" value="${this._seedValue}" />
        <button class="generate" data-role="generate">✦ Generate NPC</button>
        ${card}
      </div>`;

    this.querySelectorAll('[data-genre]').forEach((b) =>
      b.addEventListener('click', () => { this.genreId = b.dataset.genre; this.render(); }));
    this.querySelector('[data-role=generate]').addEventListener('click', () => this.generate());
    this.querySelector('[data-role=reroll]')?.addEventListener('click', () => this.generate());
    this.querySelector('[data-role=keep]')?.addEventListener('click', () => {
      if (this.last) this.dispatchEvent(new CustomEvent('keep-npc', { detail: this.last, bubbles: true }));
    });
  }
}
customElements.define('npc-tray', NpcTray);
