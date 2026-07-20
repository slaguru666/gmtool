import { searchArt } from '../art/search.js';
import artManifest from '../art/manifest.js';
import { escapeHtml } from '../core/escape-html.js';
import { createStore } from '../core/store.js';
import { createArtGenerator } from '../art/generate.js';
import { addGenerated } from '../art/library.js';

export class ArtTray extends HTMLElement {
  constructor() {
    super();
    this.manifest = artManifest;        // static library (base) — settable in tests
    this._query = '';
    this._generated = [];
    this._endpoint = null;
    this._status = '';
    this._showConfig = false;
    this.store = null;
    this.generator = null;              // injectable in tests; else built from endpoint
    this.fetchImpl = undefined;
    this.navigatorRef = undefined;
  }

  connectedCallback() {
    if (typeof localStorage !== 'undefined' && localStorage) {
      try { this.store = createStore('art'); } catch { this.store = null; }
    }
    this._generated = this.store?.get('generated', []) || [];
    this._endpoint = this.store?.get('endpoint', null) || null;
    if (!this._endpoint) this._showConfig = true;
    this.render();
  }

  // base manifest + generated, searched together
  library() { return [...this.manifest, ...this._generated]; }

  gen() {
    return this.generator || createArtGenerator({
      endpoint: this._endpoint,
      fetchImpl: this.fetchImpl,
      navigatorRef: this.navigatorRef,
    });
  }

  renderThumb(a) {
    return `
      <button class="thumb${a.generated ? ' thumb--gen' : ''}" data-art-id="${escapeHtml(a.id)}" title="${escapeHtml(a.label)}">
        <img src="${escapeHtml(a.src)}" alt="${escapeHtml(a.label)}" loading="lazy" />
        <span class="thumb-cap">${escapeHtml(a.label)}</span>
      </button>`;
  }

  render() {
    const g = this.gen();
    const ready = g.ready();
    const statusText = this._status
      || (!g.configured ? 'Set an image-gen endpoint to enable Generate'
        : !g.online() ? 'Offline — library search only'
        : 'Generate ready');

    const config = this._showConfig ? `
      <div class="art-config" data-role="config">
        <input class="art-endpoint" data-role="endpoint" placeholder="image-gen endpoint URL" value="${escapeHtml(this._endpoint || '')}" />
        <button class="art-endpoint-save" data-role="save-endpoint">Save</button>
      </div>` : '';

    this.innerHTML = `
      <div class="art-tray">
        <input class="art-query" data-role="art-query" placeholder="search pencil art — e.g. rain, detective" value="${escapeHtml(this._query)}" />
        <div class="art-gen-row">
          <button class="generate" data-role="generate" ${ready ? '' : 'disabled'}>✦ Generate</button>
          <span class="art-gen-status" data-role="gen-status">${escapeHtml(statusText)}</span>
          <button class="art-gen-cog" data-role="gen-settings" aria-label="Endpoint settings">⚙</button>
        </div>
        ${config}
        <div class="art-results" data-role="art-results">${this.gridHtml()}</div>
      </div>`;

    const input = this.querySelector('[data-role=art-query]');
    input.addEventListener('input', () => { this._query = input.value; this.renderResults(); });
    this.querySelector('[data-role=generate]').addEventListener('click', () => this.onGenerate());
    this.querySelector('[data-role=gen-settings]').addEventListener('click', () => {
      this._showConfig = !this._showConfig; this._status = ''; this.render();
    });
    const save = this.querySelector('[data-role=save-endpoint]');
    if (save) save.addEventListener('click', () => this.onSaveEndpoint());
    this.bindThumbs();
  }

  gridHtml() {
    const results = searchArt(this.library(), this._query);
    return results.map((a) => this.renderThumb(a)).join('') || '<div class="art-empty">No matches</div>';
  }

  // Re-render only the results (keeps input focus/caret stable while typing).
  renderResults() {
    this.querySelector('[data-role=art-results]').innerHTML = this.gridHtml();
    this.bindThumbs();
  }

  onSaveEndpoint() {
    const url = this.querySelector('[data-role=endpoint]').value.trim();
    this._endpoint = url || null;
    this.store?.set('endpoint', this._endpoint);
    this._showConfig = !this._endpoint;
    this._status = '';
    this.render();
  }

  async onGenerate() {
    const prompt = this._query.trim();
    this._status = 'Generating…';
    this.updateStatus();
    try {
      const asset = await this.gen().generate(prompt);
      this._generated = addGenerated(this._generated, this.manifest, asset);
      this.store?.set('generated', this._generated);
      this._status = 'Added to library';
      this.render();
    } catch (e) {
      this._status = e.message || 'Generate failed';
      this.updateStatus();
    }
  }

  updateStatus() {
    const s = this.querySelector('[data-role=gen-status]');
    if (s) s.textContent = this._status;
  }

  bindThumbs() {
    const lib = this.library();
    this.querySelectorAll('[data-art-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const asset = lib.find((a) => a.id === btn.dataset.artId);
        if (asset) this.dispatchEvent(new CustomEvent('show-prop', { detail: { src: asset.src, label: asset.label }, bubbles: true }));
      });
    });
  }
}
customElements.define('art-tray', ArtTray);
