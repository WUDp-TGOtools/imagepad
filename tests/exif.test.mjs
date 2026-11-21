import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractExif, sanitizeExif, injectExif } from '../src/editor/src/exif.js';

// Little-endian TIFF: IFD0 with orientation 6 and an Exif pointer; Exif IFD with the pixel size.
function buildTiff() {
  const b = new Uint8Array(96);
  const dv = (o, v, n) => { b[o] = v & 255; b[o + 1] = (v >> 8) & 255; if (n === 4) { b[o + 2] = (v >>> 16) & 255; b[o + 3] = (v >>> 24) & 255; } };
  b.set([0x49, 0x49, 0x2a, 0, 8, 0, 0, 0], 0);
  dv(8, 2, 2);
  const entry = (o, tag, type, value) => { dv(o, tag, 2); dv(o + 2, type, 2); dv(o + 4, 1, 4); dv(o + 8, value, 4); };
  entry(10, 0x0112, 3, 6);
  entry(22, 0x8769, 4, 40);
  dv(34, 0, 4);
  dv(40, 2, 2);
  entry(42, 0xa002, 4, 0);
  entry(54, 0xa003, 4, 0);
  dv(66, 0, 4);
  return b;
}

test('sanitizeExif sets orientation to 1 and writes the pixel size', () => {
  const out = sanitizeExif(buildTiff(), { width: 800, height: 600 });
  assert.equal(out[18] | (out[19] << 8), 1);
  assert.equal(out[50] | (out[51] << 8) | (out[52] << 16) | (out[53] << 24), 800);
  assert.equal(out[62] | (out[63] << 8) | (out[64] << 16) | (out[65] << 24), 600);
});

test('sanitizeExif does not modify the input', () => {
  const src = buildTiff();
  sanitizeExif(src, { width: 1, height: 1 });
  assert.equal(src[18], 6);
});

test('sanitizeExif rejects data without a byte order mark', () => {
  assert.equal(sanitizeExif(new Uint8Array(16), { width: 1, height: 1 }), null);
});

test('inject then extract returns the same TIFF payload', () => {
  const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, 0xff, 0xd9]);
  const tiff = buildTiff();
  const withExif = injectExif(jpeg, tiff);
  assert.equal(withExif[0], 0xff);
  assert.equal(withExif[1], 0xd8);
  assert.equal(withExif[8], 0xff);
  assert.equal(withExif[9], 0xe1);
  const back = extractExif(withExif);
  assert.deepEqual(Array.from(back), Array.from(tiff));
});

test('extractExif returns null for a file without Exif', () => {
  assert.equal(extractExif(new Uint8Array([0xff, 0xd8, 0xff, 0xd9])), null);
  assert.equal(extractExif(new Uint8Array([1, 2, 3])), null);
});
