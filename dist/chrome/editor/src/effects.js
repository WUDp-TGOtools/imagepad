// Pixel effects on RGBA buffers. Pure functions, no DOM, testable in Node.
// Blur is a separable box blur repeated 3 times (close to a Gaussian).
import { clamp } from './pipeline.js';

export function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return [0, 0, 0];
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function blurRadius(region) {
  return clamp(Math.round(Number(region.strength) || 10), 2, 60);
}

export function pixelBlock(region) {
  return Math.max(2, Math.round(Number(region.strength) || 10));
}

// Extra pixels read around a region, so that blur does not fade at the edges.
export function paddingFor(region) {
  return region.mode === 'blur' ? blurRadius(region) * 3 : 0;
}

export function boxBlur(src, w, h, radius) {
  const r = Math.max(0, Math.round(radius));
  const a = Uint8ClampedArray.from(src);
  if (r === 0) return a;
  const b = new Uint8ClampedArray(src.length);
  for (let pass = 0; pass < 3; pass++) {
    blurPass(a, b, w, h, r, true);
    blurPass(b, a, w, h, r, false);
  }
  return a;
}

// One sliding-window pass. Sums are exact integers, so the result matches a naive box blur.
function blurPass(src, dst, w, h, r, horizontal) {
  const len = horizontal ? w : h;
  const lines = horizontal ? h : w;
  const step = horizontal ? 4 : w * 4;
  const lineStride = horizontal ? w * 4 : 4;
  const d = 2 * r + 1;
  const last = len - 1;
  for (let line = 0; line < lines; line++) {
    const base = line * lineStride;
    let s0 = 0;
    let s1 = 0;
    let s2 = 0;
    let s3 = 0;
    for (let k = -r; k <= r; k++) {
      const p = base + (k < 0 ? 0 : k > last ? last : k) * step;
      s0 += src[p];
      s1 += src[p + 1];
      s2 += src[p + 2];
      s3 += src[p + 3];
    }
    let o = base;
    for (let i = 0; i < len; i++) {
      dst[o] = s0 / d;
      dst[o + 1] = s1 / d;
      dst[o + 2] = s2 / d;
      dst[o + 3] = s3 / d;
      const ai = i + r + 1;
      const ri = i - r;
      const add = base + (ai > last ? last : ai) * step;
      const rem = base + (ri < 0 ? 0 : ri) * step;
      s0 += src[add] - src[rem];
      s1 += src[add + 1] - src[rem + 1];
      s2 += src[add + 2] - src[rem + 2];
      s3 += src[add + 3] - src[rem + 3];
      o += step;
    }
  }
}

export function pixelate(src, w, h, block) {
  const out = new Uint8ClampedArray(src.length);
  for (let by = 0; by < h; by += block) {
    for (let bx = 0; bx < w; bx += block) {
      const ex = Math.min(w, bx + block);
      const ey = Math.min(h, by + block);
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let n = 0;
      for (let y = by; y < ey; y++) {
        for (let x = bx; x < ex; x++) {
          const p = (y * w + x) * 4;
          r += src[p];
          g += src[p + 1];
          b += src[p + 2];
          a += src[p + 3];
          n++;
        }
      }
      r /= n; g /= n; b /= n; a /= n;
      for (let y = by; y < ey; y++) {
        for (let x = bx; x < ex; x++) {
          const p = (y * w + x) * 4;
          out[p] = r; out[p + 1] = g; out[p + 2] = b; out[p + 3] = a;
        }
      }
    }
  }
  return out;
}

export function solidFill(n, rgb) {
  const out = new Uint8ClampedArray(n * 4);
  for (let i = 0; i < n; i++) {
    out[i * 4] = rgb[0];
    out[i * 4 + 1] = rgb[1];
    out[i * 4 + 2] = rgb[2];
    out[i * 4 + 3] = 255;
  }
  return out;
}

export function cropBuf(buf, bw, bh, x, y, w, h) {
  const out = new Uint8ClampedArray(w * h * 4);
  for (let j = 0; j < h; j++) {
    const start = ((y + j) * bw + x) * 4;
    out.set(buf.subarray(start, start + w * 4), j * w * 4);
  }
  return out;
}

// Inside the ellipse take the effect, outside keep the original pixels.
export function ellipseMask(orig, eff, w, h) {
  const out = new Uint8ClampedArray(orig.length);
  const rx = w / 2;
  const ry = h / 2;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (x + 0.5 - rx) / rx;
      const dy = (y + 0.5 - ry) / ry;
      const p = (y * w + x) * 4;
      const src = dx * dx + dy * dy <= 1 ? eff : orig;
      out[p] = src[p];
      out[p + 1] = src[p + 1];
      out[p + 2] = src[p + 2];
      out[p + 3] = src[p + 3];
    }
  }
  return out;
}

// buf: padded RGBA area; rect: the region inside buf (x, y, w, h).
// Returns RGBA of size rect.w x rect.h.
export function renderRegion({ buf, bw, bh, rect, mode, strength, color, shape }) {
  const { x, y, w, h } = rect;
  const region = { mode, strength };
  let eff;
  if (mode === 'solid') {
    eff = solidFill(w * h, color);
  } else if (mode === 'pixelate') {
    eff = cropBuf(pixelate(buf, bw, bh, pixelBlock(region)), bw, bh, x, y, w, h);
  } else {
    eff = cropBuf(boxBlur(buf, bw, bh, blurRadius(region)), bw, bh, x, y, w, h);
  }
  if (shape !== 'ellipse') return eff;
  const orig = cropBuf(buf, bw, bh, x, y, w, h);
  return ellipseMask(orig, eff, w, h);
}
