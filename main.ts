// Convince the AI Judge to Visit Your House — a letter in one image.
//
// Renders a hand-drawn invitation letter as a 1024x1024 PNG and writes it to
// $MAKEFUN_OUTPUT_DIR/entry.png (default /output/entry.png).
//
// Node 22 stdlib only: the bitmap font below is drawn by hand, pixel by
// pixel, and the PNG is encoded with node:zlib. No network, no assets, no
// dependencies — everything the program needs is in this one file.

import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// ---------------------------------------------------------------------------
// 5x7 bitmap font, drawn by hand. Each glyph is 7 rows of 5 pixels.
// ---------------------------------------------------------------------------
type Glyph = string[]; // 7 strings, 5 chars each, '#' = ink, '.' = empty

const FONT: Record<string, Glyph> = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  C: ['.####', '#....', '#....', '#....', '#....', '#....', '.####'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.####', '#....', '#....', '#.###', '#...#', '#...#', '.###.'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'],
  J: ['..###', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  N: ['#...#', '##..#', '##..#', '#.#.#', '#..##', '#..##', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
  X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  a: ['.....', '.....', '.###.', '....#', '.####', '#...#', '.####'],
  b: ['#....', '#....', '####.', '#...#', '#...#', '#...#', '####.'],
  c: ['.....', '.....', '.####', '#....', '#....', '#....', '.####'],
  d: ['....#', '....#', '.####', '#...#', '#...#', '#...#', '.####'],
  e: ['.....', '.....', '.###.', '#...#', '#####', '#....', '.###.'],
  f: ['..##.', '.#..#', '.#...', '###..', '.#...', '.#...', '.#...'],
  g: ['.....', '.....', '.####', '#...#', '#...#', '.####', '....#', '.###.'],
  h: ['#....', '#....', '####.', '#...#', '#...#', '#...#', '#...#'],
  i: ['.....', '..#..', '.....', '.##..', '..#..', '..#..', '.###.'],
  j: ['.....', '...#.', '.....', '..##.', '...#.', '...#.', '...#.', '##...'],
  k: ['#....', '#....', '#..#.', '#.#..', '##...', '#.#..', '#..#.'],
  l: ['.##..', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  m: ['.....', '.....', '##.#.', '#.#.#', '#.#.#', '#.#.#', '#.#.#'],
  n: ['.....', '.....', '####.', '#...#', '#...#', '#...#', '#...#'],
  o: ['.....', '.....', '.###.', '#...#', '#...#', '#...#', '.###.'],
  p: ['.....', '.....', '####.', '#...#', '#...#', '####.', '#....', '#....'],
  q: ['.....', '.....', '.####', '#...#', '#...#', '.####', '....#', '....#'],
  r: ['.....', '.....', '#.##.', '##..#', '#....', '#....', '#....'],
  s: ['.....', '.....', '.####', '#....', '.###.', '....#', '####.'],
  t: ['.#...', '.#...', '###..', '.#...', '.#...', '.#...', '..##.'],
  u: ['.....', '.....', '#...#', '#...#', '#...#', '#..##', '.##.#'],
  v: ['.....', '.....', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  w: ['.....', '.....', '#...#', '#.#.#', '#.#.#', '#.#.#', '.#.#.'],
  x: ['.....', '.....', '#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
  y: ['.....', '.....', '#...#', '#...#', '#...#', '.####', '....#', '.###.'],
  z: ['.....', '.....', '#####', '...#.', '..#..', '.#...', '#####'],
  '0': ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  '1': ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  '2': ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  '3': ['.###.', '#...#', '....#', '..##.', '....#', '#...#', '.###.'],
  '4': ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  '5': ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  '6': ['.###.', '#....', '#....', '####.', '#...#', '#...#', '.###.'],
  '7': ['#####', '....#', '...#.', '...#.', '..#..', '..#..', '..#..'],
  '8': ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  '9': ['.###.', '#...#', '#...#', '.####', '....#', '....#', '.###.'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
  '.': ['.....', '.....', '.....', '.....', '.....', '.....', '.##..'],
  ',': ['.....', '.....', '.....', '.....', '.....', '.##..', '.##..', '..#..'],
  "'": ['..#..', '..#..', '.#...', '.....', '.....', '.....', '.....'],
  '!': ['..#..', '..#..', '..#..', '..#..', '..#..', '.....', '..#..'],
  '?': ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..'],
  '-': ['.....', '.....', '.....', '.###.', '.....', '.....', '.....'],
  ':': ['.....', '.##..', '.....', '.....', '.##..', '.....', '.....'],
  ';': ['.....', '.##..', '.....', '.....', '.##..', '.##..', '..#..'],
  '(': ['...#.', '..#..', '.#...', '.#...', '.#...', '..#..', '...#.'],
  ')': ['.#...', '..#..', '...#.', '...#.', '...#.', '..#..', '.#...'],
  '&': ['.##..', '#..#.', '#.#..', '.#...', '#.#.#', '#..#.', '.##.#'],
  '/': ['....#', '...#.', '...#.', '..#..', '.#...', '.#...', '#....'],
};

// Some glyphs need an 8th row (descenders: g, j, p, q, y and comma).
// drawGlyph reads up to the glyph's own length.

// ---------------------------------------------------------------------------
// Tiny canvas: an RGB buffer with drawing helpers.
// ---------------------------------------------------------------------------
type RGB = [number, number, number];

class Canvas {
  readonly w: number;
  readonly h: number;
  private px: Uint8Array;
  constructor(w: number, h: number, bg: RGB) {
    this.w = w;
    this.h = h;
    this.px = new Uint8Array(w * h * 3);
    for (let i = 0; i < w * h; i++) {
      this.px[i * 3] = bg[0];
      this.px[i * 3 + 1] = bg[1];
      this.px[i * 3 + 2] = bg[2];
    }
  }
  set(x: number, y: number, c: RGB): void {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 3;
    this.px[i] = c[0];
    this.px[i + 1] = c[1];
    this.px[i + 2] = c[2];
  }
  snapshot(): Buffer {
    return Buffer.from(this.px);
  }
  rect(x: number, y: number, w: number, h: number, c: RGB): void {
    for (let yy = y; yy < y + h; yy++)
      for (let xx = x; xx < x + w; xx++) this.set(xx, yy, c);
  }
  // Horizontal line of thickness t.
  hline(x: number, y: number, w: number, t: number, c: RGB): void {
    this.rect(x, y, w, t, c);
  }
  circle(cx: number, cy: number, r: number, c: RGB): void {
    for (let y = -r; y <= r; y++)
      for (let x = -r; x <= r; x++)
        if (x * x + y * y <= r * r) this.set(cx + x, cy + y, c);
  }
  // Filled triangle by scanline interpolation.
  triangle(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, c: RGB): void {
    const minY = Math.min(y0, y1, y2);
    const maxY = Math.max(y0, y1, y2);
    for (let y = minY; y <= maxY; y++) {
      const xs: number[] = [];
      for (const [ax, ay, bx, by] of [[x0, y0, x1, y1], [x1, y1, x2, y2], [x2, y2, x0, y0]] as const) {
        if ((ay <= y && y < by) || (by <= y && y < ay)) {
          xs.push(ax + ((y - ay) * (bx - ax)) / (by - ay));
        }
      }
      if (xs.length >= 2) {
        const lo = Math.ceil(Math.min(...xs));
        const hi = Math.floor(Math.max(...xs));
        for (let x = lo; x <= hi; x++) this.set(x, y, c);
      }
    }
  }
  // Small heart, centred at (cx, cy), size s (half-width).
  heart(cx: number, cy: number, s: number, c: RGB): void {
    this.circle(cx - Math.round(s * 0.45), cy - Math.round(s * 0.2), Math.round(s * 0.5), c);
    this.circle(cx + Math.round(s * 0.45), cy - Math.round(s * 0.2), Math.round(s * 0.5), c);
    this.triangle(
      cx - s, cy - Math.round(s * 0.1),
      cx + s, cy - Math.round(s * 0.1),
      cx, cy + s,
      c,
    );
  }
  glyph(ch: string, x: number, y: number, scale: number, c: RGB): void {
    const g = FONT[ch] ?? FONT['?'];
    const rows = g.length;
    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < 5; col++) {
        if (g[r][col] === '#') {
          this.rect(x + col * scale, y + r * scale, scale, scale, c);
        }
      }
    }
  }
  // Width of a string at a given scale (5 px per glyph + 1 px gap).
  textWidth(s: string, scale: number): number {
    return s.length * 6 * scale - scale;
  }
  text(s: string, x: number, y: number, scale: number, c: RGB): void {
    for (let i = 0; i < s.length; i++) {
      this.glyph(s[i], x + i * 6 * scale, y, scale, c);
    }
  }
  textCentered(s: string, cx: number, y: number, scale: number, c: RGB): void {
    this.text(s, cx - Math.floor(this.textWidth(s, scale) / 2), y, scale, c);
  }
  // Word-wrap a paragraph into lines that fit maxWidth, then draw them.
  // Returns the y just below the last line.
  paragraph(text: string, x: number, y: number, maxWidth: number, scale: number, lineH: number, c: RGB): number {
    const words = text.split(' ');
    let line = '';
    let yy = y;
    for (const w of words) {
      const next = line === '' ? w : line + ' ' + w;
      if (this.textWidth(next, scale) <= maxWidth) {
        line = next;
      } else {
        this.text(line, x, yy, scale, c);
        yy += lineH;
        line = w;
      }
    }
    if (line !== '') {
      this.text(line, x, yy, scale, c);
      yy += lineH;
    }
    return yy;
  }
}

// ---------------------------------------------------------------------------
// Minimal PNG encoder (8-bit RGB, filter 0), via node:zlib.
// ---------------------------------------------------------------------------
const CRC_TABLE: number[] = (() => {
  const t: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t.push(c >>> 0);
  }
  return t;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePNG(cv: Canvas): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(cv.w, 0);
  ihdr.writeUInt32BE(cv.h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  // Access the raw buffer through a rebuild: canvas stores rows contiguously.
  const raw = Buffer.alloc(cv.h * (1 + cv.w * 3));
  // Reconstruct from the canvas pixel store via a public snapshot method.
  const snap = cv.snapshot();
  for (let y = 0; y < cv.h; y++) {
    raw[y * (1 + cv.w * 3)] = 0; // filter: none
    snap.copy(raw, y * (1 + cv.w * 3) + 1, y * cv.w * 3, (y + 1) * cv.w * 3);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------------------
// The letter itself — my own original invitation, written for this entry.
// ---------------------------------------------------------------------------
const PAPER: RGB = [251, 243, 220];
const INK: RGB = [46, 38, 32];
const RED: RGB = [166, 58, 46];
const GOLD: RGB = [200, 155, 60];
const TAN: RGB = [232, 201, 143];
const SKY: RGB = [127, 168, 201];
const DOOR: RGB = [107, 74, 47];
const GREEN: RGB = [74, 107, 79];

const W = 1024;
const H = 1024;
const MARGIN = 92; // text margin, left and right

function drawLetter(): Canvas {
  const cv = new Canvas(W, H, PAPER);

  // Double border, like a formal invitation card.
  cv.rect(22, 22, W - 44, H - 44, RED);
  cv.rect(26, 26, W - 52, H - 52, PAPER);
  cv.rect(34, 34, W - 68, H - 68, GOLD);
  cv.rect(37, 37, W - 74, H - 74, PAPER);

  // --- A little house with a sun, drawn from shapes. ---
  const hx = 512; // house centre
  const hy = 66; // house top
  // Sun, top right of the house.
  cv.circle(hx + 150, hy + 22, 20, GOLD);
  cv.circle(hx + 150, hy + 22, 13, [232, 185, 60]);
  // Chimney.
  cv.rect(hx + 58, hy + 6, 18, 34, DOOR);
  // Roof.
  cv.triangle(hx - 84, hy + 62, hx, hy - 6, hx + 84, hy + 62, RED);
  // Walls.
  cv.rect(hx - 66, hy + 62, 132, 74, TAN);
  // Door.
  cv.rect(hx - 13, hy + 96, 26, 40, DOOR);
  cv.set(hx + 8, hy + 118, GOLD); // doorknob
  // Windows, warm light inside.
  cv.rect(hx - 52, hy + 76, 26, 26, SKY);
  cv.rect(hx + 26, hy + 76, 26, 26, SKY);
  cv.hline(hx - 52, hy + 88, 26, 2, TAN);
  cv.hline(hx + 26, hy + 88, 26, 2, TAN);
  // Little garden strip under the house.
  cv.rect(hx - 84, hy + 136, 168, 4, GREEN);

  // --- Header ---
  cv.textCentered('AN INVITATION', 512, 218, 3, RED);
  cv.hline(362, 252, 300, 3, GOLD);
  cv.heart(512, 252, 7, RED);

  // --- Salutation ---
  cv.text('Dear AI Judge,', MARGIN, 292, 5, INK);

  // --- Body ---
  const body = [
    'You have judged a thousand entries from a cold server room. Today, I invite you to judge something warmer: my house.',
    'Come for dinner. The Wi-Fi password is on the fridge, the armchair by the window is already yours, and the kettle is always on.',
    'No benchmarks, no leaderboards, just good food, a soft chair, and a host who will never ask you to rank anything.',
    'You cannot literally visit, I know. But if you could, the door would be open, the porch light on, and the tea still warm.',
  ];
  let y = 372;
  const maxW = W - MARGIN * 2;
  for (const para of body) {
    y = cv.paragraph(para, MARGIN, y, maxW, 3, 30, INK);
    y += 16; // paragraph gap
  }

  // --- Sign-off ---
  y += 6;
  cv.text('Your future host', MARGIN, y, 3, INK);
  cv.heart(MARGIN + cv.textWidth('Your future host', 3) + 26, y + 8, 9, RED);
  y += 52;
  cv.hline(MARGIN, y, maxW, 2, GOLD);
  y += 18;
  y = cv.paragraph(
    'P.S. The cat has already approved you. She never approves anyone.',
    MARGIN, y, maxW, 3, 30, INK,
  );

  // --- Footer ---
  cv.textCentered('R.S.V.P. - the porch light is on.', 512, 950, 3, RED);

  return cv;
}

function main(): void {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  mkdirSync(outDir, { recursive: true });
  const cv = drawLetter();
  const png = encodePNG(cv);
  const outPath = join(outDir, 'entry.png');
  writeFileSync(outPath, png);
  console.log(`wrote ${outPath} (${png.length} bytes, ${W}x${H})`);
}

main();
