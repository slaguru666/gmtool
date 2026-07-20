import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('PWA wiring', () => {
  it('links the manifest in index.html', () => {
    const html = readFileSync('index.html', 'utf8');
    expect(html).toContain('rel="manifest"');
    expect(html).toContain('manifest.webmanifest');
  });
  it('manifest declares an installable app', () => {
    const m = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'));
    expect(m.name).toBeTruthy();
    expect(m.display).toBe('standalone');
    expect(Array.isArray(m.icons)).toBe(true);
  });
  it('main.js registers the service worker', () => {
    const js = readFileSync('src/main.js', 'utf8');
    expect(js).toContain('serviceWorker');
    expect(js).toContain("register('/sw.js')");
  });
  it('service worker precaches the shell', () => {
    const sw = readFileSync('public/sw.js', 'utf8');
    expect(sw).toContain('addEventListener');
    expect(sw).toContain('caches');
  });
});
