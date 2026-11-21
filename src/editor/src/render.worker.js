// Heavy work: decode, edit preview, output preview and export. Runs off the UI thread.
import { applyOps, cropPixels, drawCropped, drawWatermark, opKey } from './ops.js';
import { fitWithin, fitToBytes } from './pipeline.js';
import { extractExif, sanitizeExif, injectExif } from './exif.js';

// Edit preview size. The export always uses full resolution. Smaller is much faster on slower machines.
const WORK_MAX = 1400;
const MIME = { jpeg: 'image/jpeg', webp: 'image/webp', png: 'image/png' };

let bmp = null;
let W = 0;
let H = 0;
let workW = 0;
let workH = 0;
let base = null;
let srcExif = null;

// Snapshots of the image after the first n operations. A new preview resumes from the longest match.
const SNAP_MAX = 6;
let snaps = [];

self.onmessage = async (e) => {
  const m = e.data;
  const id = m.id;
  try {
    if (m.type === 'load') {
      bmp?.close?.();
      bmp = await createImageBitmap(m.file, { imageOrientation: 'from-image' });
      srcExif = m.file.type === 'image/jpeg' ? extractExif(new Uint8Array(await m.file.arrayBuffer())) : null;
      W = bmp.width;
      H = bmp.height;
      const s = Math.min(1, WORK_MAX / Math.max(W, H));
      workW = Math.max(1, Math.round(W * s));
      workH = Math.max(1, Math.round(H * s));
      const c = new OffscreenCanvas(workW, workH);
      const g = c.getContext('2d', { willReadFrequently: true });
      g.drawImage(bmp, 0, 0, workW, workH);
      base = g.getImageData(0, 0, workW, workH).data;
      snaps = [];
      self.postMessage({ id, ok: true, width: W, height: H });
      return;
    }

    if (m.type === 'preview' && m.mode === 'full') {
      const buf = fullPreview(m.ops);
      const c = new OffscreenCanvas(workW, workH);
      c.getContext('2d').putImageData(new ImageData(buf, workW, workH), 0, 0);
      const out = c.transferToImageBitmap();
      self.postMessage({ id, ok: true, bitmap: out, width: workW, height: workH }, [out]);
      return;
    }

    if (m.type === 'preview' && m.mode === 'output') {
      const rect = cropPixels(W, H, m.crop);
      const size = fitWithin(m.crop?.outW || rect.w, m.crop?.outH || rect.h, WORK_MAX, WORK_MAX);
      const c = renderOutput({ rect, tw: size.w, th: size.h, ops: m.ops, watermark: m.watermark, fill: true, crop: m.crop });
      const out = c.transferToImageBitmap();
      self.postMessage({ id, ok: true, bitmap: out, width: size.w, height: size.h }, [out]);
      return;
    }

    if (m.type === 'export') {
      const rect = cropPixels(W, H, m.crop);
      const target = fitWithin(m.crop?.outW || rect.w, m.crop?.outH || rect.h, m.maxW || null, m.maxH || null);
      const c = renderOutput({ rect, tw: target.w, th: target.h, ops: m.ops, watermark: m.watermark, fill: m.format !== 'png', crop: m.crop });
      const mime = MIME[m.format] || MIME.jpeg;
      const lossy = m.format !== 'png';
      const encode = (q) => c.convertToBlob(lossy ? { type: mime, quality: q } : { type: mime });
      let r;
      if (lossy && m.maxBytes) {
        r = await fitToBytes(encode, m.maxBytes, { hi: m.quality });
      } else {
        const blob = await encode(m.quality);
        r = { blob, quality: m.quality, ok: !m.maxBytes || blob.size <= m.maxBytes };
      }
      // Metadata is only kept on request, and only from a JPEG source.
      let blob = r.blob;
      let metaKept = false;
      if (m.keepMeta && m.format === 'jpeg' && srcExif) {
        const tiff = sanitizeExif(srcExif, { width: target.w, height: target.h });
        if (tiff) {
          blob = new Blob([injectExif(new Uint8Array(await r.blob.arrayBuffer()), tiff)], { type: 'image/jpeg' });
          metaKept = true;
        }
      }
      self.postMessage({ id, ok: true, blob, width: target.w, height: target.h, mime: blob.type, withinLimit: r.ok, quality: r.quality, metaKept });
      return;
    }

    throw new Error(`unknown request: ${m.type}`);
  } catch (err) {
    self.postMessage({ id, ok: false, error: String(err?.message || err) });
  }
};

// Applies the operations to the working image, reusing the longest cached prefix.
function fullPreview(ops) {
  const keys = ops.map(opKey);
  let start = 0;
  let buf = null;
  for (let i = snaps.length - 1; i >= 0; i--) {
    const snap = snaps[i];
    if (snap.n <= keys.length && snap.key === keys.slice(0, snap.n).join('\n')) {
      start = snap.n;
      buf = Uint8ClampedArray.from(snap.buf);
      break;
    }
  }
  if (!buf) buf = Uint8ClampedArray.from(base);
  for (let i = start; i < ops.length; i++) {
    applyOps(buf, workW, workH, [ops[i]]);
    snaps.push({ n: i + 1, key: keys.slice(0, i + 1).join('\n'), buf: Uint8ClampedArray.from(buf) });
    if (snaps.length > SNAP_MAX) snaps.shift();
  }
  return buf;
}

// Crop, resize, edit and watermark into one canvas.
function renderOutput({ rect, tw, th, ops, watermark, fill }) {
  const c = new OffscreenCanvas(tw, th);
  const g = c.getContext('2d', { willReadFrequently: true });
  if (fill) {
    g.fillStyle = '#fff';
    g.fillRect(0, 0, tw, th);
  }
  drawCropped(g, bmp, rect, tw, th);
  const img = g.getImageData(0, 0, tw, th);
  applyOps(img.data, tw, th, ops || []);
  g.putImageData(img, 0, 0);
  if (watermark?.text) drawWatermark(g, { w: tw, h: th }, watermark);
  return c;
}
