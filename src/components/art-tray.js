import { searchArt } from '../art/search.js';
import artManifest from '../art/manifest.js';
import { escapeHtml } from '../core/escape-html.js';

export class ArtTray extends HTMLElement {
  constructor() {
    super();
    this.manifest = artManifest;
    this._query = '';
  }
  connectedCallback() { this.render(); }

  renderThumb(a) {
    return `
      <button class="thumb" data-art-id="${escapeHtml(a.id)}" title="${escapeHtml(a.label)}">
        <img src="${escapeHtml(a.src)}" alt="${escapeHtml(a.label)}" loading="lazy" />
        <span class="thumb-cap">${escapeHtml(a.label)}</span>
      </button>`;
  }

  render() {
    const results = searchArt(this.manifest, this._query);
    const grid = results.map((a) => this.renderThumb(a)).join('');

    this.innerHTML = `
      <div class="art-tray">
        <input class="art-query" data-role="art-query" placeholder="search pencil art — e.g. rain, detective" value="${escapeHtml(this._query)}" />
        <div class="art-results" data-role="art-results">${grid || '<div class="art-empty">No matches</div>'}</div>
      </div>`;

    const input = this.querySelector('[data-role=art-query]');
    input.addEventListener('input', () => { this._query = input.value; this.renderResults(); });
    this.bindThumbs();
  }

  // Re-render only the results (keeps input focus/caret stable while typing).
  renderResults() {
    const results = searchArt(this.manifest, this._query);
    const container = this.querySelector('[data-role=art-results]');
    container.innerHTML = results.map((a) => this.renderThumb(a)).join('') || '<div class="art-empty">No matches</div>';
    this.bindThumbs();
  }

  bindThumbs() {
    this.querySelectorAll('[data-art-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const asset = this.manifest.find((a) => a.id === btn.dataset.artId);
        if (asset) this.dispatchEvent(new CustomEvent('show-prop', { detail: { src: asset.src, label: asset.label }, bubbles: true }));
      });
    });
  }
}
customElements.define('art-tray', ArtTray);
