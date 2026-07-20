// Online art generator. Calls a GM-configured image-gen endpoint (never a
// hardcoded/baked-in URL or key) and normalises the reply into a library asset.
// Degrades gracefully: unconfigured or offline → not ready, and generate()
// throws a clear message instead of half-working. Network is never load-bearing.
//
// Endpoint contract (POST JSON { prompt }): reply JSON with an image under any of
// `image` | `src` | `url` | `dataUrl` (a data: URL makes it offline-cacheable),
// plus optional `label` and `tags`.
export function createArtGenerator({ endpoint = null, fetchImpl, navigatorRef } = {}) {
  const nav = navigatorRef ?? (typeof navigator !== 'undefined' ? navigator : undefined);
  const doFetch = fetchImpl ?? (typeof fetch !== 'undefined' ? fetch : undefined);
  const configured = !!endpoint;

  function online() { return !nav || nav.onLine !== false; }

  return {
    configured,
    online,
    ready: () => configured && online() && !!doFetch,
    async generate(prompt) {
      const p = String(prompt ?? '').trim();
      if (!configured) throw new Error('no generate endpoint configured');
      if (!doFetch) throw new Error('fetch unavailable');
      if (!online()) throw new Error('offline — connect to generate');
      if (!p) throw new Error('enter a prompt to generate');

      let res;
      try {
        res = await doFetch(endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ prompt: p }),
        });
      } catch {
        throw new Error('could not reach the generate endpoint');
      }
      if (!res.ok) throw new Error(`generate failed (${res.status})`);
      const data = await res.json();
      const image = data.image || data.src || data.url || data.dataUrl;
      if (!image) throw new Error('the endpoint returned no image');
      const tags = Array.isArray(data.tags) && data.tags.length ? data.tags : promptTags(p);
      return { src: image, label: data.label || p, tags };
    },
  };
}

export function promptTags(prompt) {
  const words = String(prompt).toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  return [...new Set([...words, 'generated'])];
}
