// Edit operations: masks, effects and compositing. Shared by the render worker.
// Operations use normalized coordinates (0..1 of the source), so the same list
// works for the preview and for the full-resolution export.
import { boxBlur, pixelate, solidFill, hexToRgb } from './effects.js';
import { watermarkLayout, tileGrid } from './pipeline.js';

// Crop rectangle in source pixels. Can extend beyond the image (fixed frames can).
export function cropPixels(W, H, crop) {
  if (!crop) return { x: 0, y: 0, w: W, h: H };
  const r = crop.rect;
  return {
    x: Math.round(r.x * W),
    y: Math.round(r.y * H),
    w: Math.max(1, Math.round(r.w * W)),
    h: Math.max(1, Math.round(r.h * H)),
  };
}

const MASK_CACHE = new Map();
const MASK_CACHE_MAX = 16;

// Alpha mask (0..255) at the given size for one operation. Masks are cached by geometry.
export function buildMask(op, w, h) {
  const key = `${w}x${h}|${JSON.stringify(op)}`;
  const hit = MASK_CACHE.get(key);
  if (hit) return hit;
  const alpha = renderMask(op, w, h);
  if (MASK_CACHE.size >= MASK_CACHE_MAX) MASK_CACHE.delete(MASK_CACHE.keys().next().value);
  MASK_CACHE.set(key, alpha);
  return alpha;
}

function renderMask(op, w, h) {
  const c = new OffscreenCanvas(w, h);
  const g = c.getContext('2d', { willReadFrequently: true });
  g.fillStyle = '#000';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#fff';
  g.strokeStyle = '#fff';
  if (op.kind === 'area') {
    const x = op.x * w;
    const y = op.y * h;
    const rw = op.w * w;
    const rh = op.h * h;
    g.beginPath();
    if (op.shape === 'ellipse') g.ellipse(x + rw / 2, y + rh / 2, rw / 2, rh / 2, 0, 0, Math.PI * 2);
    else g.rect(x, y, rw, rh);
    g.fill();
  } else if (op.kind === 'brush') {
    const r = Math.max(1, op.size * Math.max(w, h));
    if (op.points.length === 1) {
      const p = op.points[0];
      g.beginPath();
      g.arc(p.x * w, p.y * h, r, 0, Math.PI * 2);
      g.fill();
    } else {
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.lineWidth = r * 2;
      g.beginPath();
      op.points.forEach((p, i) => (i ? g.lineTo(p.x * w, p.y * h) : g.moveTo(p.x * w, p.y * h)));
      g.stroke();
    }
  }
  const data = g.getImageData(0, 0, w, h).data;
  const alpha = new Uint8ClampedArray(w * h);
  for (let i = 0; i < alpha.length; i++) alpha[i] = data[i * 4];
  return alpha;
}

// Strength is relative to the longer side, so preview and export look the same.
// Stable identity of an operation, used by the worker's snapshot cache.
export function opKey(op) {
  return JSON.stringify(op);
}

export function effectFor(op, buf, w, h) {
  if (op.mode === 'solid') return solidFill(w * h, hexToRgb(op.color));
  const k = Math.max(2, Math.round((op.strength || 10) * Math.max(w, h) / 1000));
  if (op.mode === 'pixelate') return pixelate(buf, w, h, k);
  return boxBlur(buf, w, h, k);
}

// buf = buf + (eff - buf) * mask
export function compositeWithMask(buf, eff, mask) {
  for (let i = 0; i < mask.length; i++) {
    const a = mask[i] / 255;
    if (a === 0) continue;
    const p = i * 4;
    buf[p] += (eff[p] - buf[p]) * a;
    buf[p + 1] += (eff[p + 1] - buf[p + 1]) * a;
    buf[p + 2] += (eff[p + 2] - buf[p + 2]) * a;
  }
  return buf;
}

export function applyOps(buf, w, h, ops) {
  for (const op of ops) {
    const mask = buildMask(op, w, h);
    const eff = effectFor(op, buf, w, h);
    compositeWithMask(buf, eff, mask);
  }
  return buf;
}

// Draws the part of the source inside rect onto a canvas of size tw x th.
// Parts outside the source are left as they are (the caller fills the background).
export function drawCropped(g, bmp, rect, tw, th) {
  const kx = tw / rect.w;
  const ky = th / rect.h;
  const ix0 = Math.max(rect.x, 0);
  const iy0 = Math.max(rect.y, 0);
  const ix1 = Math.min(rect.x + rect.w, bmp.width);
  const iy1 = Math.min(rect.y + rect.h, bmp.height);
  if (ix1 <= ix0 || iy1 <= iy0) return;
  g.imageSmoothingQuality = 'high';
  g.drawImage(bmp, ix0, iy0, ix1 - ix0, iy1 - iy0, (ix0 - rect.x) * kx, (iy0 - rect.y) * ky, (ix1 - ix0) * kx, (iy1 - iy0) * ky);
}

export function drawWatermark(g, out, wm) {
  const L = watermarkLayout(out, wm.pos);
  g.save();
  if (wm.pos === 'tile') {
    g.translate(out.w / 2, out.h / 2);
    g.rotate(-Math.PI / 6);
    g.font = `${L.font}px sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = 'rgba(255,255,255,0.28)';
    g.strokeStyle = 'rgba(0,0,0,0.22)';
    g.lineWidth = Math.max(1, L.font / 14);
    for (const p of tileGrid(out, L.font)) {
      g.strokeText(wm.text, p.x, p.y);
      g.fillText(wm.text, p.x, p.y);
    }
  } else {
    g.font = `${L.font}px sans-serif`;
    g.textAlign = L.align;
    g.textBaseline = L.base;
    g.fillStyle = 'rgba(255,255,255,0.85)';
    g.strokeStyle = 'rgba(0,0,0,0.45)';
    g.lineWidth = Math.max(1, L.font / 12);
    g.strokeText(wm.text, L.x, L.y);
    g.fillText(wm.text, L.x, L.y);
  }
  g.restore();
}
