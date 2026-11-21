// Pure image-geometry logic. No DOM, no browser APIs, so it can be tested in Node.
// Regions and manual crops use normalized coordinates (0..1 of the source).

export const FORMATS = {
  jpeg: { mime: 'image/jpeg', lossy: true },
  webp: { mime: 'image/webp', lossy: true },
  png: { mime: 'image/png', lossy: false },
};

export function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

export function fitWithin(w, h, maxW, maxH) {
  const sx = maxW ? maxW / w : Infinity;
  const sy = maxH ? maxH / h : Infinity;
  const s = Math.min(1, sx, sy);
  return { w: Math.max(1, Math.round(w * s)), h: Math.max(1, Math.round(h * s)) };
}

// Centered crop to an aspect ratio (width / height). Null keeps the full image.
export function cropRect(W, H, aspect) {
  if (!aspect) return { x: 0, y: 0, w: W, h: H };
  const cur = W / H;
  let w = W;
  let h = H;
  if (cur > aspect) w = Math.round(H * aspect);
  else h = Math.round(W / aspect);
  return { x: Math.round((W - w) / 2), y: Math.round((H - h) / 2), w, h };
}

// Manual crop, given as normalized rectangle, converted to source pixels.
export function cropFromNormalized(W, H, n) {
  const x = Math.round(clamp(n.x, 0, 1) * W);
  const y = Math.round(clamp(n.y, 0, 1) * H);
  const w = Math.max(1, Math.min(W - x, Math.round(n.w * W)));
  const h = Math.max(1, Math.min(H - y, Math.round(n.h * H)));
  return { x, y, w, h };
}

export function planOutput(src, opts = {}) {
  const format = FORMATS[opts.format] ? opts.format : 'jpeg';
  const crop = opts.crop
    ? cropFromNormalized(src.width, src.height, opts.crop)
    : cropRect(src.width, src.height, opts.aspect ?? null);
  const out = fitWithin(crop.w, crop.h, opts.maxW || null, opts.maxH || null);
  return {
    format,
    mime: FORMATS[format].mime,
    lossy: FORMATS[format].lossy,
    quality: clamp(opts.quality ?? 0.85, 0.05, 1),
    maxBytes: opts.maxBytes > 0 ? opts.maxBytes : null,
    crop,
    out,
  };
}

// Highest quality whose output fits maxBytes. encode(q) must resolve to an object with size.
export async function fitToBytes(encode, maxBytes, { hi = 0.95, lo = 0.4, steps = 7 } = {}) {
  const top = await encode(hi);
  if (top.size <= maxBytes) return { blob: top, quality: hi, ok: true };
  const bottom = await encode(lo);
  if (bottom.size > maxBytes) return { blob: bottom, quality: lo, ok: false };
  let best = { blob: bottom, quality: lo, ok: true };
  let low = lo;
  let high = hi;
  for (let i = 0; i < steps; i++) {
    const mid = Math.round(((low + high) / 2) * 100) / 100;
    const blob = await encode(mid);
    if (blob.size <= maxBytes) {
      best = { blob, quality: mid, ok: true };
      low = mid;
    } else {
      high = mid;
    }
  }
  return best;
}

export function clampRegion(r) {
  const x = clamp(r.x, 0, 1);
  const y = clamp(r.y, 0, 1);
  const w = clamp(r.w, 0, 1 - x);
  const h = clamp(r.h, 0, 1 - y);
  return { x, y, w, h };
}

// Region in source coordinates to pixel rectangle of the output canvas. Null if outside the crop.
export function mapRegionToOutput(region, src, plan) {
  const sx = region.x * src.width;
  const sy = region.y * src.height;
  const sw = region.w * src.width;
  const sh = region.h * src.height;
  const c = plan.crop;
  const ix0 = Math.max(sx, c.x);
  const iy0 = Math.max(sy, c.y);
  const ix1 = Math.min(sx + sw, c.x + c.w);
  const iy1 = Math.min(sy + sh, c.y + c.h);
  if (ix1 <= ix0 || iy1 <= iy0) return null;
  const kx = plan.out.w / c.w;
  const ky = plan.out.h / c.h;
  return {
    x: Math.round((ix0 - c.x) * kx),
    y: Math.round((iy0 - c.y) * ky),
    w: Math.max(1, Math.round((ix1 - ix0) * kx)),
    h: Math.max(1, Math.round((iy1 - iy0) * ky)),
  };
}

// Watermark placement. pos: br, bl, tr, tl. The tile mode uses tileGrid instead.
export function watermarkLayout(out, pos = 'br') {
  const font = Math.max(12, Math.round(out.w * 0.035));
  const m = Math.round(font * 0.8);
  const map = {
    br: { x: out.w - m, y: out.h - m, align: 'right', base: 'bottom' },
    bl: { x: m, y: out.h - m, align: 'left', base: 'bottom' },
    tr: { x: out.w - m, y: m, align: 'right', base: 'top' },
    tl: { x: m, y: m, align: 'left', base: 'top' },
  };
  return { font, ...(map[pos] || map.br) };
}

// Grid of points (relative to the canvas center) that covers the canvas after rotation.
export function tileGrid(out, font) {
  const step = font * 8;
  const span = Math.hypot(out.w, out.h) / 2 + step;
  const pts = [];
  for (let y = -span; y <= span; y += step) {
    for (let x = -span; x <= span; x += step) pts.push({ x, y });
  }
  return pts;
}

export function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1048576).toFixed(2)} MB`;
}

export function reductionPct(original, output) {
  if (!original) return 0;
  return Math.round((1 - output / original) * 100);
}
