// Reproducible placeholder app-icon generator for The Director. Pure Node — no
// image deps: draws a clock-with-target motif (the pacing / "you are here vs
// target" idea) in the app palette and writes PNGs with a hand-rolled encoder.
//   node tools/gen-icons.mjs
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';

// ---- tiny PNG encoder (RGBA, non-interlaced) ------------------------------
const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
function encodePNG(size, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit, RGBA
  const stride = size * 4;
  const raw = Buffer.alloc(size * (stride + 1));
  for (let y = 0; y < size; y++) rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

// ---- drawing --------------------------------------------------------------
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (e0, e1, x) => { let t = (x - e0) / (e1 - e0); t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
const over = (dst, src, a) => [lerp(dst[0], src[0], a), lerp(dst[1], src[1], a), lerp(dst[2], src[2], a)];
function distSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
  let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

const AMBER = [255, 212, 121], GREEN = [111, 224, 160], INK = [11, 14, 19];

function draw(size, motifR) {
  const rgba = Buffer.alloc(size * size * 4);
  const cx = size / 2, cy = size / 2, aa = size * 0.0035;
  const outerR = size * motifR, innerR = outerR - size * 0.05, midR = (outerR + innerR) / 2;
  const md = [Math.sin(0.349), -Math.cos(0.349)];   // minute hand ~1 o'clock (20°)
  const hd = [Math.sin(1.920), -Math.cos(1.920)];   // hour hand ~3-4 o'clock (110°)
  const mLen = outerR * 0.66, hLen = outerR * 0.46, mHalf = size * 0.018, hHalf = size * 0.024;
  const hubR = size * 0.032, targetR = size * 0.05, tx = cx, ty = cy - midR;

  for (let y = 0; y < size; y++) {
    const t = y / (size - 1);
    const bg = [lerp(18, 13, t), lerp(23, 17, t), lerp(31, 23, t)];
    for (let x = 0; x < size; x++) {
      let c = [bg[0], bg[1], bg[2]];
      const px = x + 0.5, py = y + 0.5, dist = Math.hypot(px - cx, py - cy);
      c = over(c, AMBER, (1 - ss(outerR - aa, outerR + aa, dist)) * ss(innerR - aa, innerR + aa, dist)); // ring
      c = over(c, AMBER, 1 - ss(mHalf - aa, mHalf + aa, distSeg(px, py, cx, cy, cx + md[0] * mLen, cy + md[1] * mLen)));
      c = over(c, AMBER, 1 - ss(hHalf - aa, hHalf + aa, distSeg(px, py, cx, cy, cx + hd[0] * hLen, cy + hd[1] * hLen)));
      c = over(c, AMBER, 1 - ss(hubR - aa, hubR + aa, dist)); // hub
      const dt = Math.hypot(px - tx, py - ty);
      c = over(c, INK, 1 - ss(targetR + size * 0.014 - aa, targetR + size * 0.014 + aa, dt)); // dark halo for contrast
      c = over(c, GREEN, 1 - ss(targetR - aa, targetR + aa, dt)); // target dot
      const i = (y * size + x) * 4;
      rgba[i] = Math.round(c[0]); rgba[i + 1] = Math.round(c[1]); rgba[i + 2] = Math.round(c[2]); rgba[i + 3] = 255;
    }
  }
  return rgba;
}

mkdirSync('public/icons', { recursive: true });
mkdirSync('resources', { recursive: true });

const icon = (size) => encodePNG(size, draw(size, 0.36));
writeFileSync('public/icons/icon-192.png', icon(192));
writeFileSync('public/icons/icon-512.png', icon(512));
writeFileSync('public/icons/icon-180.png', icon(180));       // apple-touch-icon
writeFileSync('resources/icon.png', icon(1024));             // Capacitor asset source
writeFileSync('resources/splash.png', encodePNG(2732, draw(2732, 0.12))); // Capacitor splash source
console.log('Wrote icons: 192, 512, 180, resources/icon.png (1024), resources/splash.png (2732)');
