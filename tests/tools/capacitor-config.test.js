import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const cfg = JSON.parse(readFileSync('capacitor.config.json', 'utf8'));
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

describe('Capacitor iOS wrapper', () => {
  it('has a reverse-DNS appId and an app name', () => {
    expect(cfg.appId).toMatch(/^[a-z]+(\.[a-z0-9]+)+$/);
    expect(cfg.appName).toBeTruthy();
  });

  it('points webDir at the vite build output (dist)', () => {
    expect(cfg.webDir).toBe('dist');
  });

  it('exposes the iOS build scripts', () => {
    for (const s of ['ios:add', 'ios:sync', 'ios:open']) {
      expect(pkg.scripts[s], s).toBeTruthy();
    }
    expect(pkg.scripts['ios:sync']).toContain('build'); // always sync fresh web assets
  });

  it('declares the Capacitor toolchain as dev-only (web app keeps zero runtime deps)', () => {
    expect(pkg.dependencies ?? {}).toEqual({});
    for (const d of ['@capacitor/core', '@capacitor/cli', '@capacitor/ios']) {
      expect(pkg.devDependencies[d], d).toBeTruthy();
    }
  });

  it('skips the service worker inside the native wrapper', () => {
    const main = readFileSync('src/main.js', 'utf8');
    expect(main).toContain('isNativePlatform');
    expect(main).toContain("register('/sw.js')"); // still registers for the browser PWA
  });
});
