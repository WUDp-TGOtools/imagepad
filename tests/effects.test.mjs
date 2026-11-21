import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boxBlur, pixelate, solidFill, cropBuf, renderRegion, hexToRgb, paddingFor } from '../src/editor/src/effects.js';
import { cropFromNormalized, watermarkLayout, tileGrid } from '../src/editor/src/pipeline.js';

// Builds an RGBA buffer where each pixel's channels come from fn(x, y).
function makeBuf(w, h, fn) {
  const b = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = (y * w + x) * 4;
      const v = fn(x, y);
      b[p] = v; b[p + 1] = v; b[p + 2] = v; b[p + 3] = 255;
    }
  }
  return b;
}

test('boxBlur keeps a uniform image unchanged', () => {
  const src = makeBuf(10, 10, () => 120);
  const out = boxBlur(src, 10, 10, 3);
  assert.ok(out.every((v, i) => v === src[i]));
});

test('boxBlur reduces contrast of a sharp edge', () => {
  const w = 16;
  const src = makeBuf(w, 1, (x) => (x % 2 ? 255 : 0));
  const out = boxBlur(src, w, 1, 2);
  const reds = [];
  for (let x = 0; x < w; x++) reds.push(out[x * 4]);
  assert.ok(Math.max(...reds) - Math.min(...reds) < 255);
});

// Reference: the straightforward box blur. The optimized pass must produce the same pixels.
function naiveBlur(src, w, h, r) {
  let a = Uint8ClampedArray.from(src);
  let b = new Uint8ClampedArray(src.length);
  const d = 2 * r + 1;
  for (let pass = 0; pass < 3; pass++) {
    for (const horizontal of [true, false]) {
      const len = horizontal ? w : h;
      const lines = horizontal ? h : w;
      for (let line = 0; line < lines; line++) {
        for (let i = 0; i < len; i++) {
          const s = [0, 0, 0, 0];
          for (let k = -r; k <= r; k++) {
            const j = Math.min(len - 1, Math.max(0, i + k));
            const p = horizontal ? (line * w + j) * 4 : (j * w + line) * 4;
            for (let c = 0; c < 4; c++) s[c] += a[p + c];
          }
          const o = horizontal ? (line * w + i) * 4 : (i * w + line) * 4;
          for (let c = 0; c < 4; c++) b[o + c] = s[c] / d;
        }
      }
      [a, b] = [b, a];
    }
  }
  return a;
}

test('the optimized box blur matches the naive reference exactly', () => {
  const w = 13;
  const h = 9;
  const src = new Uint8ClampedArray(w * h * 4);
  let seed = 7;
  for (let i = 0; i < src.length; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    src[i] = seed & 255;
  }
  for (const r of [1, 2, 4]) {
    assert.deepEqual(Array.from(boxBlur(src, w, h, r)), Array.from(naiveBlur(src, w, h, r)), `radius ${r}`);
  }
});

test('pixelate averages each block', () => {
  const src = makeBuf(4, 4, (x) => (x < 2 ? 0 : 200));
  const out = pixelate(src, 4, 4, 2);
  assert.equal(out[0], 0);
  assert.equal(out[(0 * 4 + 3) * 4], 200);
});

test('solidFill paints the color with full alpha', () => {
  const out = solidFill(4, [10, 20, 30]);
  assert.deepEqual([...out.slice(0, 4)], [10, 20, 30, 255]);
  assert.equal(out.length, 16);
});

test('cropBuf extracts the right sub-rectangle', () => {
  const src = makeBuf(4, 4, (x, y) => y * 4 + x);
  const out = cropBuf(src, 4, 4, 1, 1, 2, 2);
  assert.equal(out.length, 2 * 2 * 4);
  assert.equal(out[0], 5);
  assert.equal(out[4], 6);
});

test('renderRegion solid returns the solid color at the rect size', () => {
  const buf = makeBuf(6, 6, () => 50);
  const out = renderRegion({ buf, bw: 6, bh: 6, rect: { x: 1, y: 1, w: 2, h: 2 }, mode: 'solid', color: [255, 0, 0], shape: 'rect' });
  assert.equal(out.length, 2 * 2 * 4);
  assert.deepEqual([...out.slice(0, 4)], [255, 0, 0, 255]);
});

test('renderRegion ellipse keeps corner pixels of the original', () => {
  const buf = makeBuf(8, 8, (x) => (x < 4 ? 10 : 240));
  const out = renderRegion({ buf, bw: 8, bh: 8, rect: { x: 0, y: 0, w: 8, h: 8 }, mode: 'solid', color: [0, 0, 0], shape: 'ellipse' });
  assert.equal(out[0], 10);
  assert.equal(out[(4 * 8 + 4) * 4], 0);
});

test('paddingFor is zero except for blur', () => {
  assert.equal(paddingFor({ mode: 'pixelate', strength: 10 }), 0);
  assert.equal(paddingFor({ mode: 'solid', strength: 10 }), 0);
  assert.ok(paddingFor({ mode: 'blur', strength: 10 }) >= 20);
});

test('hexToRgb parses colors and rejects garbage', () => {
  assert.deepEqual(hexToRgb('#ff8000'), [255, 128, 0]);
  assert.deepEqual(hexToRgb('nope'), [0, 0, 0]);
});

test('cropFromNormalized converts to pixels and stays inside the image', () => {
  assert.deepEqual(cropFromNormalized(1000, 500, { x: 0.5, y: 0, w: 0.5, h: 1 }), { x: 500, y: 0, w: 500, h: 500 });
  const c = cropFromNormalized(100, 100, { x: 0.9, y: 0.9, w: 0.5, h: 0.5 });
  assert.ok(c.x + c.w <= 100 && c.y + c.h <= 100);
});

test('watermarkLayout places text in the chosen corner', () => {
  assert.equal(watermarkLayout({ w: 1000, h: 800 }, 'tl').align, 'left');
  assert.equal(watermarkLayout({ w: 1000, h: 800 }, 'br').align, 'right');
});

test('tileGrid covers the canvas diagonal with points', () => {
  const pts = tileGrid({ w: 1000, h: 800 }, 35);
  assert.ok(pts.length > 20);
  assert.ok(pts.some((p) => p.x <= -640) && pts.some((p) => p.x >= 640));
});
