import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  cropRect, fitWithin, planOutput, fitToBytes, mapRegionToOutput,
  clampRegion, formatBytes, reductionPct, watermarkLayout, cropFromNormalized,
} from '../src/editor/src/pipeline.js';
import { CROP_PRESETS, findPreset } from '../src/editor/src/presets.js';

test('cropRect centers a 4:5 crop on a 1920x1080 image', () => {
  assert.deepEqual(cropRect(1920, 1080, 4 / 5), { x: 528, y: 0, w: 864, h: 1080 });
});

test('cropRect keeps the full image when aspect is null', () => {
  assert.deepEqual(cropRect(800, 600, null), { x: 0, y: 0, w: 800, h: 600 });
});

test('fitWithin keeps the ratio and never upscales', () => {
  assert.deepEqual(fitWithin(800, 600, 400, null), { w: 400, h: 300 });
  assert.deepEqual(fitWithin(100, 100, 1080, 1080), { w: 100, h: 100 });
});

test('planOutput falls back to jpeg for an unknown format', () => {
  const plan = planOutput({ width: 100, height: 100 }, { format: 'avif' });
  assert.equal(plan.format, 'jpeg');
  assert.equal(plan.mime, 'image/jpeg');
});

test('planOutput marks png as lossless', () => {
  assert.equal(planOutput({ width: 10, height: 10 }, { format: 'png' }).lossy, false);
});

test('fitToBytes returns the highest quality that fits', async () => {
  const encode = async (q) => ({ size: Math.round(q * 1000) });
  const r = await fitToBytes(encode, 700, { hi: 0.95 });
  assert.equal(r.ok, true);
  assert.ok(r.blob.size <= 700);
  assert.ok(r.quality >= 0.65);
});

test('fitToBytes reports failure when even the lowest quality is too big', async () => {
  const r = await fitToBytes(async () => ({ size: 5000 }), 700);
  assert.equal(r.ok, false);
});

test('mapRegionToOutput scales a region into the output', () => {
  const src = { width: 1000, height: 1000 };
  const plan = planOutput(src, { maxW: 500 });
  assert.deepEqual(mapRegionToOutput({ x: 0, y: 0, w: 0.5, h: 0.5 }, src, plan), { x: 0, y: 0, w: 250, h: 250 });
});

test('mapRegionToOutput returns null for a region outside the crop', () => {
  const src = { width: 1000, height: 500 };
  const plan = planOutput(src, { aspect: 1 });
  assert.equal(mapRegionToOutput({ x: 0, y: 0, w: 0.2, h: 1 }, src, plan), null);
});

test('clampRegion keeps the region inside the image', () => {
  const r = clampRegion({ x: 0.9, y: 0.9, w: 0.5, h: 0.5 });
  assert.ok(Math.abs(r.x - 0.9) < 1e-9 && Math.abs(r.y - 0.9) < 1e-9);
  assert.ok(Math.abs(r.w - 0.1) < 1e-9 && Math.abs(r.h - 0.1) < 1e-9);
});

test('formatBytes uses B, KB and MB', () => {
  assert.equal(formatBytes(512), '512 B');
  assert.equal(formatBytes(2048), '2.0 KB');
  assert.equal(formatBytes(3 * 1024 * 1024), '3.00 MB');
});

test('reductionPct reports the saving', () => {
  assert.equal(reductionPct(1000, 250), 75);
});

test('watermarkLayout scales the font and places the corner', () => {
  const L = watermarkLayout({ w: 1000, h: 800 });
  assert.equal(L.font, 35);
  assert.equal(L.x, 972);
  assert.equal(L.y, 772);
  assert.equal(watermarkLayout({ w: 1000, h: 800 }, 'tl').align, 'left');
});

test('cropFromNormalized converts to pixels and stays inside the image', () => {
  assert.deepEqual(cropFromNormalized(1000, 500, { x: 0.5, y: 0, w: 0.5, h: 1 }), { x: 500, y: 0, w: 500, h: 500 });
  const c = cropFromNormalized(100, 100, { x: 0.9, y: 0.9, w: 0.5, h: 0.5 });
  assert.ok(c.x + c.w <= 100 && c.y + c.h <= 100);
});

test('crop presets are valid and findable', () => {
  const ids = CROP_PRESETS.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const p of CROP_PRESETS) assert.ok(p.w > 0 && p.h > 0);
  assert.equal(findPreset('post').w, 1080);
  assert.equal(findPreset('nope'), null);
});
