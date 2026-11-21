import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compositeWithMask, cropPixels } from '../src/editor/src/ops.js';

test('compositeWithMask blends by mask alpha', () => {
  const buf = new Uint8ClampedArray([0, 0, 0, 255, 0, 0, 0, 255]);
  const eff = new Uint8ClampedArray([200, 200, 200, 255, 200, 200, 200, 255]);
  compositeWithMask(buf, eff, new Uint8ClampedArray([255, 0]));
  assert.equal(buf[0], 200);
  assert.equal(buf[4], 0);
});

test('compositeWithMask with half alpha gives the midpoint', () => {
  const buf = new Uint8ClampedArray([0, 0, 0, 255]);
  const eff = new Uint8ClampedArray([100, 100, 100, 255]);
  compositeWithMask(buf, eff, new Uint8ClampedArray([128]));
  assert.ok(Math.abs(buf[0] - 50) <= 1);
});

test('cropPixels returns the whole image without a crop', () => {
  assert.deepEqual(cropPixels(800, 600, null), { x: 0, y: 0, w: 800, h: 600 });
});

test('cropPixels can extend beyond the image for fixed frames', () => {
  const r = cropPixels(1000, 1000, { rect: { x: -0.1, y: 0, w: 0.5, h: 1 } });
  assert.equal(r.x, -100);
  assert.equal(r.w, 500);
});
