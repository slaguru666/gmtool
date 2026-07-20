// tests/smoke.test.js
import { describe, it, expect } from 'vitest';
import { APP } from '../src/main.js';

describe('scaffold', () => {
  it('boots and exposes the app id', () => {
    expect(APP).toBe('the-director');
  });
  it('has a working DOM environment', () => {
    document.body.innerHTML = '<div id="x">hi</div>';
    expect(document.getElementById('x').textContent).toBe('hi');
  });
});
