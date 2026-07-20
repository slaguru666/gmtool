import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/art-tray.js';

const M = [{ id: 'a', src: '/art/a.png', label: 'Detective in alley', tags: ['detective'] }];

function mockGenerator() {
  return {
    configured: true,
    online: () => true,
    ready: () => true,
    generate: async (prompt) => ({ src: 'data:image/png;base64,ZZ', label: prompt, tags: ['rain', 'pier'] }),
  };
}

describe('<art-tray> generate', () => {
  beforeEach(() => { localStorage.clear(); document.body.innerHTML = ''; });

  function mount({ generator } = {}) {
    const el = document.createElement('art-tray');
    el.manifest = M;
    if (generator) el.generator = generator;
    document.body.appendChild(el);
    return el;
  }

  it('degrades gracefully with no endpoint: Generate disabled, config shown', () => {
    const el = mount();
    expect(el.querySelector('[data-role=generate]').disabled).toBe(true);
    expect(el.querySelector('[data-role=config]')).not.toBe(null);
    expect(el.querySelector('[data-role=gen-status]').textContent).toMatch(/endpoint/i);
    // search still works fully offline
    expect(el.querySelectorAll('[data-art-id]').length).toBe(1);
  });

  it('saving an endpoint persists it and hides the config row', () => {
    const el = mount();
    el.querySelector('[data-role=endpoint]').value = 'https://my-gen.example/art';
    el.querySelector('[data-role=save-endpoint]').click();
    expect(JSON.parse(localStorage.getItem('gmd.art.endpoint'))).toBe('https://my-gen.example/art');
    expect(el.querySelector('[data-role=config]')).toBe(null);
  });

  it('generate adds the image to the library, searchable, and persists it', async () => {
    const el = mount({ generator: mockGenerator() });
    expect(el.querySelector('[data-role=generate]').disabled).toBe(false);

    el._query = 'rainy pier';
    await el.onGenerate();

    // new thumb present and flagged as generated
    const ids = [...el.querySelectorAll('[data-art-id]')].map((n) => n.dataset.artId);
    expect(ids).toContain('rainy-pier');
    expect(el.querySelector('[data-art-id="rainy-pier"]').classList.contains('thumb--gen')).toBe(true);
    expect(el.querySelector('[data-role=gen-status]').textContent).toMatch(/added/i);

    // searchable by its derived tags
    el._query = 'pier';
    el.renderResults();
    expect([...el.querySelectorAll('[data-art-id]')].map((n) => n.dataset.artId)).toContain('rainy-pier');

    // persisted
    expect(JSON.parse(localStorage.getItem('gmd.art.generated'))[0].id).toBe('rainy-pier');
  });

  it('a generated image survives a reload (offline library)', async () => {
    const el = mount({ generator: mockGenerator() });
    el._query = 'rainy pier';
    await el.onGenerate();

    document.body.innerHTML = '';
    const el2 = document.createElement('art-tray');
    el2.manifest = M;
    document.body.appendChild(el2);
    expect([...el2.querySelectorAll('[data-art-id]')].map((n) => n.dataset.artId)).toContain('rainy-pier');
  });

  it('shows the generate error in the status line on failure', async () => {
    const failing = { configured: true, online: () => true, ready: () => true, generate: async () => { throw new Error('could not reach the generate endpoint'); } };
    const el = mount({ generator: failing });
    el._query = 'x';
    await el.onGenerate();
    expect(el.querySelector('[data-role=gen-status]').textContent).toMatch(/could not reach/);
    // nothing added
    expect(el.querySelectorAll('[data-art-id]').length).toBe(1);
  });

  it('clicking a generated thumb shows it fullscreen', async () => {
    const el = mount({ generator: mockGenerator() });
    el._query = 'rainy pier';
    await el.onGenerate();
    let detail = null;
    el.addEventListener('show-prop', (e) => { detail = e.detail; });
    el.querySelector('[data-art-id="rainy-pier"]').click();
    expect(detail).toEqual({ src: 'data:image/png;base64,ZZ', label: 'rainy pier' });
  });
});
