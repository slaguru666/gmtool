import { describe, it, expect } from 'vitest';
import { createArtGenerator, promptTags } from '../../src/art/generate.js';

const okFetch = (payload) => async (url, opts) => ({
  ok: true, status: 200,
  json: async () => payload,
  _url: url, _body: opts.body,
});

describe('createArtGenerator', () => {
  it('is not ready without an endpoint and throws on generate', async () => {
    const g = createArtGenerator({ endpoint: null, fetchImpl: okFetch({}) });
    expect(g.configured).toBe(false);
    expect(g.ready()).toBe(false);
    await expect(g.generate('rain')).rejects.toThrow(/no generate endpoint/);
  });

  it('is not ready and refuses when offline', async () => {
    const g = createArtGenerator({ endpoint: 'https://gen', fetchImpl: okFetch({}), navigatorRef: { onLine: false } });
    expect(g.ready()).toBe(false);
    await expect(g.generate('rain')).rejects.toThrow(/offline/);
  });

  it('posts the prompt and normalises the reply into an asset', async () => {
    const fetchImpl = okFetch({ image: 'data:image/png;base64,AAAA', label: 'Rainy pier', tags: ['rain', 'pier'] });
    const g = createArtGenerator({ endpoint: 'https://gen', fetchImpl, navigatorRef: { onLine: true } });
    expect(g.ready()).toBe(true);
    const asset = await g.generate('rain over the pier');
    expect(asset).toEqual({ src: 'data:image/png;base64,AAAA', label: 'Rainy pier', tags: ['rain', 'pier'] });
  });

  it('derives a label and tags from the prompt when the reply omits them', async () => {
    const g = createArtGenerator({ endpoint: 'https://gen', fetchImpl: okFetch({ url: 'https://img/x.png' }), navigatorRef: { onLine: true } });
    const asset = await g.generate('tired detective in the rain');
    expect(asset.src).toBe('https://img/x.png');
    expect(asset.label).toBe('tired detective in the rain');
    expect(asset.tags).toContain('generated');
    expect(asset.tags).toContain('detective');
  });

  it('surfaces a clear error on a non-ok response', async () => {
    const g = createArtGenerator({ endpoint: 'https://gen', fetchImpl: async () => ({ ok: false, status: 503 }), navigatorRef: { onLine: true } });
    await expect(g.generate('x')).rejects.toThrow(/generate failed \(503\)/);
  });

  it('errors when the reply has no image', async () => {
    const g = createArtGenerator({ endpoint: 'https://gen', fetchImpl: okFetch({ label: 'nope' }), navigatorRef: { onLine: true } });
    await expect(g.generate('x')).rejects.toThrow(/no image/);
  });

  it('requires a non-empty prompt', async () => {
    const g = createArtGenerator({ endpoint: 'https://gen', fetchImpl: okFetch({ image: 'd' }), navigatorRef: { onLine: true } });
    await expect(g.generate('   ')).rejects.toThrow(/prompt/);
  });

  it('promptTags dedupes and drops short words', () => {
    expect(promptTags('a rain rain PIER of')).toEqual(['rain', 'pier', 'generated']);
  });
});
