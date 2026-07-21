// Reproducible B&W placeholder art for the seed library (the 5 entries in
// src/art/manifest.js). Pure Node — hand-rolled PNG encoder + analytic AA.
// Bold charcoal motifs with large tonal regions so they read at thumbnail size.
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

const AA = 1.2;
const LIGHT = [222, 230, 238], DIM = [178, 188, 202], BRIGHT = [242, 246, 252], AMBER = [242, 208, 150], DARK = [9, 11, 15];

function canvas() {
  const buf = Buffer.alloc(W * H * 4);
  return {
    buf,
    bg(top, bot) { for (let y = 0; y < H; y++) { const t = y / (H - 1); const c = [lerp(top[0], bot[0], t), lerp(top[1], bot[1], t), lerp(top[2], bot[2], t)]; for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; buf[i + 3] = 255; } } },
    each(fn) { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const r = fn(x + 0.5, y + 0.5); if (!r) continue; const [col, a] = r; if (!(a > 0)) continue; const i = (y * W + x) * 4; buf[i] = lerp(buf[i], col[0], a); buf[i + 1] = lerp(buf[i + 1], col[1], a); buf[i + 2] = lerp(buf[i + 2], col[2], a); } },
  };
}
const seg = (px, py, a, hw, col, alpha) => [col, (1 - ss(hw - AA, hw + AA, distSeg(px, py, a[0], a[1], a[2], a[3]))) * alpha];
const disc = (px, py, cx, cy, r) => 1 - ss(r - AA, r + AA, Math.hypot(px - cx, py - cy));

const scenes = {
  'detective-alley'(c) {
    c.bg([44, 49, 58], [15, 19, 25]);
    c.each((x, y) => { const g = Math.max(0, 1 - Math.hypot((x - 240) / 155, (y - 505) / 150)); return [[132, 140, 152], Math.pow(g, 1.4) * 0.75]; }); // backlight pool
    c.each((x, y) => seg(x, y, [28, H, 236, 168], 3.5, LIGHT, 0.9));
    c.each((x, y) => seg(x, y, [452, H, 244, 168], 3.5, LIGHT, 0.9));
    c.each((x, y) => seg(x, y, [78, 566, 402, 566], 3, LIGHT, 0.75));
    c.each((x, y) => { const head = disc(x, y, 240, 446, 21); const hw = lerp(27, 42, ss(466, 566, y)); const body = (1 - ss(hw - AA, hw + AA, Math.abs(x - 240))) * ss(462, 466, y) * (1 - ss(560, 564, y)); return [DARK, Math.max(head, body) * 0.96]; });
  },
  'neon-street'(c) {
    c.bg([34, 37, 48], [11, 13, 20]);
    c.each((x, y) => [[64, 72, 100], (1 - ss(70, 200, Math.abs(y - 400))) * 0.55]); // street glow band
    for (const [bx, y0, y1, col, w] of [[70, 58, 300, LIGHT, 8], [150, 100, 340, AMBER, 7], [240, 48, 288, BRIGHT, 11], [330, 118, 350, LIGHT, 7], [412, 78, 310, AMBER, 8]]) {
      c.each((x, y) => seg(x, y, [bx, y0, bx, y1], w, col, 0.96));
      c.each((x, y) => seg(x, y, [bx, 382, bx, 500], w * 0.9, col, 0.22));
    }
    c.each((x, y) => seg(x, y, [0, 362, W, 362], 2, LIGHT, 0.5));
  },
  'worn-portrait'(c) {
    c.bg([44, 42, 47], [13, 12, 16]);
    c.each((x, y) => [[0, 0, 0], ss(0.72, 1.2, Math.hypot((x - 240) / 300, (y - 320) / 380)) * 0.55]); // vignette
    c.each((x, y) => { const d = Math.hypot((x - 240) / 114, (y - 300) / 148); return [[156, 156, 164], (1 - ss(0.96, 1.03, d)) * 0.55]; }); // face fill
    c.each((x, y) => { const d = Math.hypot((x - 240) / 114, (y - 300) / 148); return [LIGHT, (1 - ss(0.99, 1.03, d)) * ss(0.92, 0.97, d) * 0.9]; }); // rim
    c.each((x, y) => [DARK, Math.max(disc(x, y, 206, 296, 11), disc(x, y, 274, 296, 11)) * 0.75]); // eyes
    c.each((x, y) => seg(x, y, [240, 302, 240, 356], 3, DARK, 0.5)); // nose
    c.each((x, y) => seg(x, y, [104, 600, 206, 452], 4, DIM, 0.75));
    c.each((x, y) => seg(x, y, [376, 600, 274, 452], 4, DIM, 0.75));
  },
  'doorway-figure'(c) {
    c.bg([24, 27, 34], [9, 11, 17]);
    c.each((x, y) => { const rx = 1 - ss(70, 73, Math.abs(x - 240)); const ry = ss(115, 119, y) * (1 - ss(597, 601, y)); return [[158, 166, 180], rx * ry * 0.92]; }); // lit doorway
    c.each((x, y) => seg(x, y, [167, 117, 167, 600], 3, BRIGHT, 0.75));
    c.each((x, y) => seg(x, y, [313, 117, 313, 600], 3, BRIGHT, 0.75));
    c.each((x, y) => seg(x, y, [167, 117, 313, 117], 3, BRIGHT, 0.75));
    c.each((x, y) => { const body = (1 - ss(26, 28, Math.abs(x - 240))) * ss(296, 300, y) * (1 - ss(560, 564, y)); return [DARK, Math.max(body, disc(x, y, 240, 294, 26))]; });
  },
  'rain-pier'(c) {
    c.bg([36, 42, 51], [19, 25, 33]);
    c.each((x, y) => [[54, 63, 76], ss(298, 302, y) * 0.55]); // water region
    c.each((x, y) => seg(x, y, [0, 300, W, 300], 2.5, LIGHT, 0.6)); // horizon
    for (const py of [344, 378, 414, 452]) c.each((x, y) => seg(x, y, [135, py, 345, py], 3, LIGHT, 0.72));
    c.each((x, y) => seg(x, y, [152, 300, 118, 470], 3, LIGHT, 0.62));
    c.each((x, y) => seg(x, y, [328, 300, 362, 470], 3, LIGHT, 0.62));
    const r = rng(7);
    for (let i = 0; i < 55; i++) { const x0 = r() * W, y0 = r() * H, len = 26 + r() * 30; c.each((x, y) => seg(x, y, [x0, y0, x0 - len * 0.3, y0 + len], 1.1, LIGHT, 0.28)); }
  },
};

mkdirSync('public/art', { recursive: true });
for (const [id, draw] of Object.entries(scenes)) {
  const c = canvas();
  draw(c);
  writeFileSync(`public/art/${id}.png`, encodePNG(W, H, c.buf));
  console.log(`wrote public/art/${id}.png`);
}
