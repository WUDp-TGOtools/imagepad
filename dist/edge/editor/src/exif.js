// EXIF handling for JPEG output. Pure functions on bytes, testable in Node.
// Keeping metadata is optional. When kept, the orientation is reset (pixels are already upright),
// the pixel dimensions are updated, and the embedded thumbnail (which may show the original) is erased.

const SOI = [0xff, 0xd8];

function u16(d, o, le) {
  return le ? d[o] | (d[o + 1] << 8) : (d[o] << 8) | d[o + 1];
}
function u32(d, o, le) {
  return le
    ? (d[o] | (d[o + 1] << 8) | (d[o + 2] << 16) | (d[o + 3] << 24)) >>> 0
    : ((d[o] << 24) | (d[o + 1] << 16) | (d[o + 2] << 8) | d[o + 3]) >>> 0;
}
function w16(d, o, v, le) {
  if (le) { d[o] = v & 255; d[o + 1] = (v >> 8) & 255; }
  else { d[o] = (v >> 8) & 255; d[o + 1] = v & 255; }
}
function w32(d, o, v, le) {
  if (le) { d[o] = v & 255; d[o + 1] = (v >>> 8) & 255; d[o + 2] = (v >>> 16) & 255; d[o + 3] = (v >>> 24) & 255; }
  else { d[o] = (v >>> 24) & 255; d[o + 1] = (v >>> 16) & 255; d[o + 2] = (v >>> 8) & 255; d[o + 3] = v & 255; }
}

// Returns the TIFF payload of the Exif APP1 segment, or null.
export function extractExif(bytes) {
  if (bytes[0] !== SOI[0] || bytes[1] !== SOI[1]) return null;
  let o = 2;
  while (o + 4 <= bytes.length) {
    if (bytes[o] !== 0xff) return null;
    const marker = bytes[o + 1];
    if (marker === 0xda) break; // start of scan: no more metadata segments
    const len = (bytes[o + 2] << 8) | bytes[o + 3];
    const isExif = marker === 0xe1 && len >= 8 &&
      bytes[o + 4] === 0x45 && bytes[o + 5] === 0x78 && bytes[o + 6] === 0x69 && bytes[o + 7] === 0x66 &&
      bytes[o + 8] === 0 && bytes[o + 9] === 0;
    if (isExif) return bytes.slice(o + 10, o + 2 + len);
    o += 2 + len;
  }
  return null;
}

// Returns a corrected copy of the TIFF payload, or null if it cannot be parsed.
export function sanitizeExif(input, { width, height }) {
  const d = Uint8Array.from(input);
  if (d.length < 8) return null;
  const le = d[0] === 0x49 && d[1] === 0x49;
  if (!le && !(d[0] === 0x4d && d[1] === 0x4d)) return null;
  const ifd0 = u32(d, 4, le);
  if (ifd0 + 2 > d.length) return null;
  const n0 = u16(d, ifd0, le);
  const next0 = ifd0 + 2 + n0 * 12;
  let exifPtr = 0;
  for (let i = 0; i < n0; i++) {
    const e = ifd0 + 2 + i * 12;
    if (e + 12 > d.length) break;
    const tag = u16(d, e, le);
    if (tag === 0x0112) w16(d, e + 8, 1, le); // orientation: pixels are already upright
    if (tag === 0x8769) exifPtr = u32(d, e + 8, le);
  }

  // Erase the thumbnail IFD (IFD1) and its image bytes.
  if (next0 + 4 <= d.length) {
    const ifd1 = u32(d, next0, le);
    if (ifd1 && ifd1 + 2 <= d.length) {
      const n1 = u16(d, ifd1, le);
      let off = 0;
      let len = 0;
      for (let i = 0; i < n1; i++) {
        const e = ifd1 + 2 + i * 12;
        if (e + 12 > d.length) break;
        const tag = u16(d, e, le);
        if (tag === 0x0201) off = u32(d, e + 8, le);
        if (tag === 0x0202) len = u32(d, e + 8, le);
      }
      if (off && len && off + len <= d.length) d.fill(0, off, off + len);
      d.fill(0, ifd1, Math.min(d.length, ifd1 + 2 + n1 * 12 + 4));
    }
    w32(d, next0, 0, le);
  }

  // The pixel dimensions in the Exif IFD now match the output.
  if (exifPtr && exifPtr + 2 <= d.length) {
    const n = u16(d, exifPtr, le);
    for (let i = 0; i < n; i++) {
      const e = exifPtr + 2 + i * 12;
      if (e + 12 > d.length) break;
      const tag = u16(d, e, le);
      const type = u16(d, e + 2, le);
      const value = tag === 0xa002 ? width : tag === 0xa003 ? height : null;
      if (value === null) continue;
      if (type === 3) w16(d, e + 8, value, le);
      else if (type === 4) w32(d, e + 8, value, le);
    }
  }
  return d;
}

// Inserts an Exif APP1 segment after SOI and any JFIF APP0 segment.
export function injectExif(jpeg, tiff) {
  const payload = new Uint8Array(6 + tiff.length);
  payload.set([0x45, 0x78, 0x69, 0x66, 0, 0], 0);
  payload.set(tiff, 6);
  const segLen = payload.length + 2;
  if (segLen > 0xffff) return jpeg;
  let at = 2;
  if (jpeg[2] === 0xff && jpeg[3] === 0xe0) at = 4 + ((jpeg[4] << 8) | jpeg[5]);
  const out = new Uint8Array(jpeg.length + 4 + payload.length);
  out.set(jpeg.subarray(0, at), 0);
  out[at] = 0xff;
  out[at + 1] = 0xe1;
  out[at + 2] = (segLen >> 8) & 255;
  out[at + 3] = segLen & 255;
  out.set(payload, at + 4);
  out.set(jpeg.subarray(at), at + 4 + payload.length);
  return out;
}
