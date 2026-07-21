// Reproducible B&W placeholder art for the seed library (the 5 entries in
// src/art/manifest.js). Pure Node — hand-rolled PNG encoder + analytic AA,
// atmospheric charcoal motifs. Swap for real pencil art anytime.
//   node tools/gen-art-placeholders.mjs
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';

const W = 480, H = 640;

// ---- PNG encoder ----
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (b) => { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function chunk(type, data) { const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0); const t = Buffer.from(type, 'ascii'); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0); return Buffer.concat([len, t, data, crc]); }
function encodePNG(w, h, rgba) {
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  const stride = w * 4, raw = Buffer.alloc(h * (stride + 1));
  for (let y = 0; y < h; y++) rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

// ---- drawing ----
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const ss = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function distSeg(px, py, ax, ay, bx, by) { const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy; let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0; t = clamp(t, 0, 1); return Math.hypot(px - (ax + t * dx), py - (ay + t * dy)); }

const AA = 1.1;
const LIGHT = [206, 214, 222], DIM = [150, 160, 172], BRIGHT = [232, 238, 244], AMBER = [232, 200, 150];

function canvas() {
  const buf = Buffer.alloc(W * H * 4);
  const api = {
    buf,
    bg(topRGB, botRGB) { for (let y = 0; y < H; y++) { const t = y / (H - 1); const c = [lerp(topRGB[0], botRGB[0], t), lerp(topRGB[1], botRGB[1], t), lerp(topRGB[2], botRGB[2], t)]; for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; buf[i + 3] = 255; } } },
    each(fn) { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; const a = fn(x + 0.5, y + 0.5); if (!a) continue; const [col, alpha] = a; if (alpha <= 0) continue; buf[i] = lerp(buf[i], col[0], alpha); buf[i + 1] = lerp(buf[i + 1], col[1], alpha); buf[i + 2] = lerp(buf[i + 2], col[2], alpha); } },
  };
  return api;
}
const segCov = (px, py, a, hw) => (col, alpha) => [col, (1 - ss(hw - AA, hw + AA, distSeg(px, py, a[0], a[1], a[2], a[3]))) * alpha];
const discCov = (px, py, cx, cy, r) => 1 - ss(r - AA, r + AA, Math.hypot(px - cx, py - cy));

const scenes = {
  // Detective in alley — converging walls, backlit figure.
  'detective-alley'(c) {
    c.bg([24, 27, 32], [12, 15, 20]);
    c.each((x, y) => {
      let a = 0, col = LIGHT;
      const halo = Math.max(0, 1 - Math.hypot(x - 240, y - 500) / 150) * 0.4; // backlight
      a = halo; col = [90, 96, 104];
      return [col, a];
    });
    c.each((x, y) => segCov(x, y, [40, H, 232, 175], 2)(DIM, 0.6));   // left perspective edge
    c.each((x, y) => segCov(x, y, [440, H, 248, 175], 2)(DIM, 0.6));  // right perspective edge
    c.each((x, y) => segCov(x, y, [90, 560, 390, 560], 2)(DIM, 0.5)); // ground
    c.each((x, y) => { // figure silhouette: head + tapered body
      const head = discCov(x, y, 240, 452, 16);
      const halfW = lerp(20, 30, ss(470, 560, y));          // shoulders widen downward
      const body = (1 - ss(halfW - AA, halfW + AA, Math.abs(x - 240))) * ss(468, 472, y) * (1 - ss(556, 560, y));
      return [[8, 9, 12], Math.max(head, body)];
    });
  },
  // Neon street — vertical light bars + reflections.
  'neon-street'(c) {
    c.bg([20, 22, 30], [10, 12, 18]);
    const bars = [[80, 70, 300, LIGHT], [150, 110, 330, AMBER], [300, 60, 280, BRIGHT], [372, 130, 340, LIGHT], [420, 90, 300, AMBER]];
    for (const [bx, y0, y1, col] of bars) {
      c.each((x, y) => segCov(x, y, [bx, y0, bx, y1], 4)(col, 0.9));
      c.each((x, y) => segCov(x, y, [bx, 380, bx, 470], 5)(col, 0.18)); // reflection
    }
    c.each((x, y) => segCov(x, y, [0, 360, W, 360], 1.5)(DIM, 0.5)); // horizon
  },
  // Worn portrait — head outline + shoulders + eyes.
  'worn-portrait'(c) {
    c.bg([26, 24, 26], [12, 11, 14]);
    c.each((x, y) => { const d = Math.hypot((x - 240) / 118, (y - 300) / 150); return [LIGHT, (1 - ss(0.97, 1.0, d)) * ss(0.9, 0.95, d) * 0.9]; }); // head ring (oval)
    c.each((x, y) => segCov(x, y, [110, 600, 205, 455], 3)(DIM, 0.7));
    c.each((x, y) => segCov(x, y, [370, 600, 275, 455], 3)(DIM, 0.7));
    c.each((x, y) => [DIM, Math.max(discCov(x, y, 205, 300, 9), discCov(x, y, 275, 300, 9)) * 0.8]); // eyes
    c.each((x, y) => segCov(x, y, [240, 300, 240, 350], 2)(DIM, 0.5)); // nose
  },
  // Figure in a doorway — lit rectangle, dark silhouette.
  'doorway-figure'(c) {
    c.bg([16, 18, 24], [9, 11, 16]);
    c.each((x, y) => { const rx = 1 - ss(69, 71, Math.abs(x - 240)); const ry = ss(118, 120, y) * (1 - ss(598, 600, y)); return [[64, 70, 80], rx * ry * 0.85]; }); // lit doorway fill
    c.each((x, y) => segCov(x, y, [170, 120, 170, 600], 2.5)(LIGHT, 0.6));
    c.each((x, y) => segCov(x, y, [310, 120, 310, 600], 2.5)(LIGHT, 0.6));
    c.each((x, y) => segCov(x, y, [170, 120, 310, 120], 2.5)(LIGHT, 0.6));
    c.each((x, y) => { const body = (1 - ss(24, 26, Math.abs(x - 240))) * (1 - ss(560, 562, y)) * ss(300, 302, y); return [[10, 12, 16], Math.max(body, discCov(x, y, 240, 300, 24))]; }); // silhouette
  },
  // Pier in the rain — planks, rails, rain streaks.
  'rain-pier'(c) {
    c.bg([22, 26, 32], [14, 18, 24]);
    c.each((x, y) => segCov(x, y, [0, 300, W, 300], 1.5)(DIM, 0.4)); // horizon
    for (const py of [345, 378, 414, 452]) c.each((x, y) => segCov(x, y, [140, py, 340, py], 2)(DIM, 0.55)); // planks
    c.each((x, y) => segCov(x, y, [150, 300, 120, 470], 2)(DIM, 0.5)); // rails converging
    c.each((x, y) => segCov(x, y, [330, 300, 360, 470], 2)(DIM, 0.5));
    const r = rng(7);
    for (let i = 0; i < 60; i++) { const x0 = r() * W, y0 = r() * H, len = 22 + r() * 26; c.each((x, y) => segCov(x, y, [x0, y0, x0 - len * 0.32, y0 + len], 0.8)(LIGHT, 0.22)); }
  },
};

mkdirSync('public/art', { recursive: true });
for (const [id, draw] of Object.entries(scenes)) {
  const c = canvas();
  draw(c);
  writeFileSync(`public/art/${id}.png`, encodePNG(W, H, c.buf));
  console.log(`wrote public/art/${id}.png`);
}
