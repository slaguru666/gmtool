import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/prop-viewer.js';

describe('<prop-viewer>', () => {
  let el;
  beforeEach(() => {
    document.body.innerHTML = '';
    el = document.createElement('prop-viewer');
    document.body.appendChild(el);
  });

  it('starts hidden', () => {
    expect(el.isOpen()).toBe(false);
    expect(el.hasAttribute('hidden')).toBe(true);
  });

  it('shows an image when show() is called', () => {
    el.show('/art/rain-pier.png', 'Pier in the rain');
    expect(el.isOpen()).toBe(true);
    const img = el.querySelector('[data-role=prop-img]');
    expect(img.getAttribute('src')).toBe('/art/rain-pier.png');
  });

  it('dismisses when the overlay is clicked', () => {
    el.show('/art/x.png', 'x');
    el.querySelector('[data-role=overlay]').click();
    expect(el.isOpen()).toBe(false);
  });
});
