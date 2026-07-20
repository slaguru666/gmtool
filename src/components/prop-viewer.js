export class PropViewer extends HTMLElement {
  constructor() { super(); this._src = ''; this._label = ''; }
  connectedCallback() { if (!this.hasAttribute('hidden')) this.setAttribute('hidden', ''); this.render(); }

  isOpen() { return !this.hasAttribute('hidden'); }

  show(src, label = '') {
    this._src = src; this._label = label;
    this.removeAttribute('hidden');
    this.render();
  }
  dismiss() { this.setAttribute('hidden', ''); }

  render() {
    this.innerHTML = `
      <div class="prop-overlay" data-role="overlay">
        <img class="prop-img" data-role="prop-img" src="${this._src}" alt="${this._label}" />
      </div>`;
    this.querySelector('[data-role=overlay]').addEventListener('click', () => this.dismiss());
  }
}
customElements.define('prop-viewer', PropViewer);
