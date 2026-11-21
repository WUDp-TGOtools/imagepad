// Full-tab editor: state, drawing, pointer and keyboard handling, undo, preview and export.
import { LANGS, t, setLang, applyI18n, detectLang, setHints } from './i18n.js';
import { CROP_PRESETS, findPreset } from './presets.js';
import { fitWithin, formatBytes, clamp } from './pipeline.js';
import { cropPixels } from './ops.js';
import { loadData, saveData } from './storage.js';
import { applyIcons } from './icons.js';
import { ext, hasExt as inExt } from './browser.js';
import { TOUR } from './tour.js';

const hasExt = inExt;
const THEMES = ['modern', 'dark', 'xp'];
const FORMATS = ['jpeg', 'webp', 'png'];
const FORMAT_EXT = { jpeg: 'jpg', webp: 'webp', png: 'png' };
const MIME_EXT = { 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/png': 'png' };
const HISTORY_LIMIT = 60;

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const cv = $('#view');
const g = cv.getContext('2d');
const viewport = $('#viewport');
const el = {
  open: $('#openBtn'), emptyOpen: $('#emptyOpen'), dropBox: $('#dropBox'), file: $('#fileInput'),
  empty: $('#empty'), workspace: $('#workspace'),
  undo: $('#undoBtn'), redo: $('#redoBtn'),
  zoomLabel: $('#zoomLabel'), fit: $('#fitBtn'), actual: $('#actualBtn'), views: $$('[data-view]'),
  tools: $$('[data-tool]'), toolHint: $('#toolHint'),
  panels: { area: $('#panel-area'), brush: $('#panel-brush'), crop: $('#panel-crop') },
  areaMode: $('#areaMode'), areaShape: $('#areaShape'), areaStrength: $('#areaStrength'), areaColor: $('#areaColor'), areaColorField: $('#areaColorField'),
  brushMode: $('#brushMode'), brushSize: $('#brushSize'), brushStrength: $('#brushStrength'), brushColor: $('#brushColor'), brushColorField: $('#brushColorField'),
  cropRatio: $('#cropRatio'), cropCustom: $('#cropCustom'), cropW: $('#cropW'), cropH: $('#cropH'), cropInfo: $('#cropInfo'),
  applyCrop: $('#applyCrop'), removeCrop: $('#removeCrop'),
  opsList: $('#opsList'), clearOps: $('#clearOps'),
  outFormat: $('#outFormat'), outQuality: $('#outQuality'), outMaxKB: $('#outMaxKB'), outMaxW: $('#outMaxW'), outMaxH: $('#outMaxH'),
  wmOn: $('#wmOn'), wmText: $('#wmText'), wmPos: $('#wmPos'),
  info: $('#info'), status: $('#statusText'), save: $('#saveBtn'), copy: $('#copyBtn'),
  settingsBtn: $('#settingsBtn'), settingsDlg: $('#settingsDlg'), closeSettings: $('#closeSettings'),
  langSel: $('#langSel'), themeSel: $('#themeSel'), resetPrefs: $('#resetPrefs'), toast: $('#toast'),
};

Object.assign(el, {
  helpBtn: $('#helpBtn'), tourEl: $('#tour'), tourHole: $('#tourHole'), tourStep: $('#tourStep'),
  tourTitle: $('#tourTitle'), tourBody: $('#tourBody'), tourNext: $('#tourNext'), tourBack: $('#tourBack'), tourSkip: $('#tourSkip'),
  welcomeDlg: $('#welcomeDlg'), welcomeStart: $('#welcomeStart'), welcomeLater: $('#welcomeLater'), replayTour: $('#replayTour'),
  finishTip: $('#finishTip'), metaKeep: $('#metaKeep'), setLarge: $('#setLarge'), setHints: $('#setHints'), setMotion: $('#setMotion'),
  startTool: $('#setTool'), startView: $('#setView'),
  mtabs: $$('[data-mtab]'), zoomInBtn: $('#zoomInBtn'), zoomOutBtn: $('#zoomOutBtn'),
  opsToggle: $('#opsToggle'), opsCount: $('#opsCount'), busy: $('#busy'), busyText: $('#busyText'), outImg: $('#outImg'), outScroll: $('#outScroll'),
  phaseEdit: $('#phaseEdit'), phaseOut: $('#phaseOut'), phaseBtns: $$('[data-phase]'),
  zoomBtn: $('#zoomBtn'), zoomDlg: $('#zoomDlg'), zoomCanvas: $('#zoomCanvas'),
  zoomRange: $('#zoomDlgRange'), zoomClose: $('#zoomClose'), zoomBody: $('#zoomBody'),
});

const DEFAULT_PREFS = () => ({
  area: { mode: 'blur', shape: 'rect', strength: 10, color: '#1f2937' },
  brush: { mode: 'blur', strength: 10, color: '#1f2937', size: 10 },
  crop: { ratio: 'free', cw: 1080, ch: 1350 },
  output: { format: 'jpeg', quality: 0.85, maxKB: 0, maxW: 0, maxH: 0, keepMeta: false },
  wm: { enabled: false, text: '', pos: 'br' },
  ui: { hints: true, largeUi: false, reduceMotion: false, startTool: 'area', startView: 'edited', tourDone: false },
});

// Brush size is stored as a slider value (1..40); the mask uses size / 500 of the longer side.
const brushRadius = (sliderValue) => sliderValue / 500;

const S = {
  prefs: DEFAULT_PREFS(),
  tool: 'area', view: 'edited', ops: [], crop: null, undo: [], redo: [], selected: -1,
  file: null, baseName: 'image', srcBmp: null, srcW: 0, srcH: 0, previewBmp: null, outputBmp: null,
  scale: 1, ox: 0, oy: 0, drag: null, draftArea: null, draftBrush: null, draftCrop: null, space: false,
  isDemo: false, reqId: 0, busy: false, statusKey: 'status.idle', theme: 'modern', exportCache: null, outZoom: 1, needsFit: false, phase: 'edit',
};

// ---------- worker ----------

const worker = new Worker(new URL('./render.worker.js', import.meta.url), { type: 'module' });
const pending = new Map();
let rid = 0;

worker.onmessage = ({ data }) => {
  const p = pending.get(data.id);
  if (!p) return;
  pending.delete(data.id);
  if (data.ok) p.resolve(data);
  else p.reject(new Error(data.error));
};
worker.onerror = () => {
  for (const p of pending.values()) p.reject(new Error('worker'));
  pending.clear();
};

function call(msg) {
  return new Promise((resolve, reject) => {
    const id = ++rid;
    pending.set(id, { resolve, reject });
    worker.postMessage({ ...msg, id });
  });
}

// ---------- preview ----------

let previewTimer = 0;
function requestPreview() {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(runPreview, 120);
}

async function runPreview() {
  if (!S.srcBmp) return;
  const id = ++S.reqId;
  setBusy(true);
  try {
    const full = await call({ type: 'preview', mode: 'full', ops: S.ops });
    if (id !== S.reqId) { full.bitmap.close(); return; }
    S.previewBmp?.close?.();
    S.previewBmp = full.bitmap;
    if (S.view === 'output') {
      const out = await call({ type: 'preview', mode: 'output', ops: S.ops, crop: S.crop, watermark: wmOption() });
      if (id !== S.reqId) { out.bitmap.close(); return; }
      S.outputBmp?.close?.();
      S.outputBmp = out.bitmap;
    }
    setStatus('status.ready');
  } catch {
    setStatus('status.error');
  } finally {
    setBusy(false);
    draw();
    updateInfo();
  }
}

function wmOption() {
  const w = S.prefs.wm;
  const text = w.text.trim();
  return w.enabled && text ? { text, pos: w.pos } : null;
}

async function exportOutput() {
  const o = S.prefs.output;
  return call({
    type: 'export',
    ops: S.ops,
    crop: S.crop,
    format: o.format,
    quality: o.quality,
    maxBytes: o.maxKB * 1024,
    maxW: o.maxW,
    maxH: o.maxH,
    keepMeta: !!o.keepMeta && o.format === 'jpeg',
    watermark: wmOption(),
  });
}

// ---------- loading ----------

async function loadFile(file, name, demo = false) {
  if (!file || !file.type.startsWith('image/')) return toast('toast.notimage');
  let bmp;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    return toast('toast.error');
  }
  S.srcBmp?.close?.();
  S.srcBmp = bmp;
  S.srcW = bmp.width;
  S.srcH = bmp.height;
  S.file = file;
  S.isDemo = demo;
  S.baseName = (name || file.name || 'image').replace(/\.[^.]+$/, '') || 'image';
  S.ops = [];
  S.crop = null;
  S.undo = [];
  S.redo = [];
  S.selected = -1;
  S.previewBmp?.close?.();
  S.previewBmp = null;
  S.outputBmp?.close?.();
  S.outputBmp = null;
  try {
    await call({ type: 'load', file });
  } catch {
    return toast('toast.error');
  }
  el.empty.hidden = true;
  el.workspace.hidden = false;
  S.view = S.prefs.ui.startView === 'original' ? 'original' : 'edited';
  S.needsFit = true;
  fit();
  syncViewButtons();
  renderAll();
  requestPreview();
  scheduleExportCache();
}

async function checkPending() {
  if (!hasExt) return;
  const { pendingImage } = await ext.storage.session.get('pendingImage');
  if (!pendingImage) return;
  await ext.storage.session.remove('pendingImage');
  try {
    const res = await fetch(pendingImage.src);
    if (!res.ok) throw new Error('http');
    await loadFile(await res.blob(), 'page-image');
  } catch {
    toast('toast.fetchfail');
  }
}

// ---------- view and coordinates ----------

const viewW = () => cv.clientWidth;
const viewH = () => cv.clientHeight;

function resizeCanvas() {
  const W = viewW();
  const H = viewH();
  if (!W || !H) return;
  const dpr = window.devicePixelRatio || 1;
  const pw = Math.round(W * dpr);
  const ph = Math.round(H * dpr);
  if (cv.width !== pw || cv.height !== ph) {
    cv.width = pw;
    cv.height = ph;
  }
}

// Computes the fit for the current view size. If the view has no size yet, the fit stays pending.
function computeFit() {
  if (!S.srcW) return false;
  const W = viewW();
  const H = viewH();
  if (!W || !H) { S.needsFit = true; return false; }
  S.needsFit = false;
  S.scale = Math.min(W / S.srcW, H / S.srcH) * 0.92;
  S.ox = (W - S.srcW * S.scale) / 2;
  S.oy = (H - S.srcH * S.scale) / 2;
  return true;
}

function fit() {
  S.outZoom = 1;
  computeFit();
  updateZoom();
  draw();
}

function stepZoom(factor) {
  if (S.view === 'output') {
    S.outZoom = clamp(S.outZoom * factor, 1, 8);
    updateZoom();
    draw();
  } else if (S.srcW) {
    zoomAt(viewW() / 2, viewH() / 2, factor);
  }
}

function actual() {
  if (!S.srcW) return;
  const W = viewW();
  const H = viewH();
  S.scale = 1;
  S.ox = (W - S.srcW) / 2;
  S.oy = (H - S.srcH) / 2;
  updateZoom();
  draw();
}

function zoomAt(mx, my, factor) {
  if (!S.srcW) return;
  const ns = clamp(S.scale * factor, 0.02, 16);
  S.ox = mx - (mx - S.ox) * (ns / S.scale);
  S.oy = my - (my - S.oy) * (ns / S.scale);
  S.scale = ns;
  updateZoom();
  draw();
}

function updateZoom() {
  const pct = S.view === 'output' ? Math.round(S.outZoom * 100) : Math.round(S.scale * 100);
  el.zoomLabel.textContent = `${pct}%`;
}

// Mouse position in canvas CSS pixels, and normalized image coordinates (may be outside 0..1).
function pointOf(e) {
  const r = cv.getBoundingClientRect();
  const mx = e.clientX - r.left;
  const my = e.clientY - r.top;
  return {
    mx, my,
    x: (mx - S.ox) / (S.scale * S.srcW),
    y: (my - S.oy) / (S.scale * S.srcH),
  };
}

const clamp01 = (v) => clamp(v, 0, 1);
const normRect = (a, b) => ({ x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(a.x - b.x), h: Math.abs(a.y - b.y) });
const toScreen = (r) => ({ x: r.x * S.srcW * S.scale + S.ox, y: r.y * S.srcH * S.scale + S.oy, w: r.w * S.srcW * S.scale, h: r.h * S.srcH * S.scale });
const toNorm = (f) => ({ x: (f.x - S.ox) / (S.scale * S.srcW), y: (f.y - S.oy) / (S.scale * S.srcH), w: f.w / (S.scale * S.srcW), h: f.h / (S.scale * S.srcH) });

// ---------- crop frames ----------

function frameDims() {
  const r = S.prefs.crop.ratio;
  if (r === 'free') return null;
  if (r === 'custom') return { w: S.prefs.crop.cw, h: S.prefs.crop.ch };
  const p = findPreset(r);
  return p ? { w: p.w, h: p.h } : null;
}

// The frame stays in the middle of the view. The image moves beneath it.
function fixedFrame() {
  const d = frameDims();
  if (!d) return null;
  const W = viewW();
  const H = viewH();
  const ar = d.w / d.h;
  const fw = Math.min(W * 0.86, H * 0.86 * ar);
  const fh = fw / ar;
  return { x: (W - fw) / 2, y: (H - fh) / 2, w: fw, h: fh };
}

function applyFixedCrop() {
  const d = frameDims();
  const f = fixedFrame();
  if (!d || !f) return;
  const rect = toNorm(f);
  commit(() => { S.crop = { rect, outW: d.w, outH: d.h }; });
  setView('output');
  toast('toast.cropped');
}

// ---------- drawing ----------

function syncOutputDom() {
  const ready = S.view === 'output' && !!S.exportCache?.url;
  el.outScroll.classList.toggle('is-off', !ready);
  cv.classList.toggle('is-off', ready);
  if (!ready) return;
  if (el.outImg.getAttribute('src') !== S.exportCache.url) el.outImg.src = S.exportCache.url;
  el.outImg.draggable = S.exportCache.key === outputKey();
  el.outImg.classList.toggle('zoomed', S.outZoom !== 1);
  el.outImg.style.width = S.outZoom === 1 ? '' : `${Math.round(S.outZoom * 100)}%`;
}

function draw() {
  syncOutputDom();
  resizeCanvas();
  if (S.needsFit) computeFit();
  const W = viewW();
  const H = viewH();
  if (!W || !H) return;
  const dpr = window.devicePixelRatio || 1;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, W, H);
  if (!S.srcBmp) return;

  if (S.view === 'output') {
    const img = S.outputBmp;
    if (!img) return;
    const s = Math.min(W / img.width, H / img.height) * 0.9;
    g.imageSmoothingQuality = 'high';
    g.drawImage(img, (W - img.width * s) / 2, (H - img.height * s) / 2, img.width * s, img.height * s);
    return;
  }

  const img = S.view === 'original' ? S.srcBmp : (S.previewBmp || S.srcBmp);
  g.imageSmoothingQuality = 'high';
  g.drawImage(img, S.ox, S.oy, S.srcW * S.scale, S.srcH * S.scale);
  drawAreaOutlines();
  drawCropOverlay(W, H);
  drawDrafts();
}

function drawAreaOutlines() {
  g.save();
  g.setLineDash([5, 4]);
  S.ops.forEach((op, i) => {
    if (op.kind !== 'area') return;
    const r = toScreen(op);
    g.lineWidth = i === S.selected ? 2.5 : 1;
    g.strokeStyle = i === S.selected ? '#f59e0b' : 'rgba(255,255,255,.7)';
    g.beginPath();
    if (op.shape === 'ellipse') g.ellipse(r.x + r.w / 2, r.y + r.h / 2, r.w / 2, r.h / 2, 0, 0, Math.PI * 2);
    else g.rect(r.x, r.y, r.w, r.h);
    g.stroke();
  });
  g.restore();
}

function drawCropOverlay(W, H) {
  let rect = null;
  if (S.tool === 'crop' && frameDims()) rect = fixedFrame();
  else if (S.draftCrop) rect = toScreen(S.draftCrop);
  else if (S.crop) rect = toScreen(S.crop.rect);
  if (!rect) return;
  g.save();
  g.fillStyle = 'rgba(0,0,0,0.5)';
  g.beginPath();
  g.rect(0, 0, W, H);
  g.rect(rect.x, rect.y, rect.w, rect.h);
  g.fill('evenodd');
  g.strokeStyle = '#22c55e';
  g.lineWidth = 2;
  g.strokeRect(rect.x, rect.y, rect.w, rect.h);
  g.strokeStyle = 'rgba(255,255,255,.55)';
  g.lineWidth = 1;
  for (let i = 1; i <= 2; i++) {
    g.beginPath();
    g.moveTo(rect.x + (rect.w * i) / 3, rect.y);
    g.lineTo(rect.x + (rect.w * i) / 3, rect.y + rect.h);
    g.moveTo(rect.x, rect.y + (rect.h * i) / 3);
    g.lineTo(rect.x + rect.w, rect.y + (rect.h * i) / 3);
    g.stroke();
  }
  g.restore();
}

function drawDrafts() {
  if (S.draftArea) {
    const r = toScreen(S.draftArea);
    g.save();
    g.setLineDash([6, 4]);
    g.strokeStyle = '#f59e0b';
    g.lineWidth = 2;
    g.beginPath();
    if (S.prefs.area.shape === 'ellipse') g.ellipse(r.x + r.w / 2, r.y + r.h / 2, r.w / 2, r.h / 2, 0, 0, Math.PI * 2);
    else g.rect(r.x, r.y, r.w, r.h);
    g.stroke();
    g.restore();
  }
  if (S.draftBrush && S.draftBrush.length) {
    const p = S.prefs.brush;
    const radius = brushRadius(p.size) * Math.max(S.srcW, S.srcH) * S.scale;
    g.save();
    g.globalAlpha = 0.45;
    g.strokeStyle = p.mode === 'solid' ? p.color : '#60a5fa';
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.lineWidth = radius * 2;
    g.beginPath();
    S.draftBrush.forEach((q, i) => {
      const X = q.x * S.srcW * S.scale + S.ox;
      const Y = q.y * S.srcH * S.scale + S.oy;
      if (i) g.lineTo(X, Y); else g.moveTo(X, Y);
    });
    g.stroke();
    g.restore();
  }
}

// ---------- pointer and keyboard ----------

function setTool(name) {
  S.tool = name;
  if (name === 'crop' && S.view === 'output') setView('edited');
  el.tools.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tool === name)));
  cv.style.cursor = name === 'hand' ? 'grab' : name === 'select' ? 'default' : 'crosshair';
  renderPanels();
  draw();
}

function bindCanvas() {
  cv.addEventListener('pointerdown', (e) => {
    if (!S.srcW || S.view !== 'edited' && S.view !== 'original') return;
    const p = pointOf(e);
    const tool = S.space || e.button === 1 ? 'hand' : S.tool;
    const drag = { tool, start: p, lx: e.clientX, ly: e.clientY, points: [] };
    if (tool === 'select') {
      S.selected = hitTest(p);
      renderOps();
      draw();
      return;
    }
    S.drag = drag;
    cv.setPointerCapture(e.pointerId);
    if (tool === 'brush') {
      drag.points = [{ x: clamp01(p.x), y: clamp01(p.y) }];
      S.draftBrush = drag.points;
    }
    if (tool === 'crop' && !frameDims()) S.draftCrop = { x: clamp01(p.x), y: clamp01(p.y), w: 0, h: 0 };
    if (tool === 'hand' || (tool === 'crop' && frameDims())) cv.style.cursor = 'grabbing';
    e.preventDefault();
  });

  cv.addEventListener('pointermove', (e) => {
    const d = S.drag;
    if (!d) return;
    const p = pointOf(e);
    if (d.tool === 'hand' || (d.tool === 'crop' && frameDims())) {
      S.ox += e.clientX - d.lx;
      S.oy += e.clientY - d.ly;
      updateZoom();
    } else if (d.tool === 'area') {
      S.draftArea = normRect({ x: clamp01(d.start.x), y: clamp01(d.start.y) }, { x: clamp01(p.x), y: clamp01(p.y) });
    } else if (d.tool === 'brush') {
      d.points.push({ x: clamp01(p.x), y: clamp01(p.y) });
    } else if (d.tool === 'crop' && S.draftCrop) {
      S.draftCrop = normRect({ x: clamp01(d.start.x), y: clamp01(d.start.y) }, { x: clamp01(p.x), y: clamp01(p.y) });
    }
    d.lx = e.clientX;
    d.ly = e.clientY;
    draw();
  });

  const finish = (e) => {
    const d = S.drag;
    if (!d) return;
    S.drag = null;
    cv.style.cursor = d.tool === 'hand' ? 'grab' : 'crosshair';
    if (d.tool === 'area' && S.draftArea) {
      const r = S.draftArea;
      S.draftArea = null;
      if (r.w > 0.005 && r.h > 0.005) {
        const a = S.prefs.area;
        commit(() => {
          S.ops.push({ kind: 'area', x: r.x, y: r.y, w: r.w, h: r.h, shape: a.shape, mode: a.mode, strength: a.strength, color: a.color });
        });
      }
    } else if (d.tool === 'brush') {
      const pts = d.points;
      S.draftBrush = null;
      if (pts.length) {
        const b = S.prefs.brush;
        commit(() => {
          S.ops.push({ kind: 'brush', mode: b.mode, strength: b.strength, color: b.color, size: brushRadius(b.size), points: pts });
        });
      }
    } else if (d.tool === 'crop' && S.draftCrop) {
      const r = S.draftCrop;
      S.draftCrop = null;
      if (r.w > 0.01 && r.h > 0.01) {
        commit(() => { S.crop = { rect: r, outW: null, outH: null }; });
        setView('output');
      }
    }
    draw();
    if (e) e.preventDefault?.();
  };
  cv.addEventListener('pointerup', finish);
  cv.addEventListener('pointercancel', () => { S.drag = null; S.draftArea = null; S.draftBrush = null; S.draftCrop = null; draw(); });

  cv.addEventListener('wheel', (e) => {
    if (!S.srcW) return;
    e.preventDefault();
    const r = cv.getBoundingClientRect();
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    zoomAt(e.clientX - r.left, e.clientY - r.top, factor);
  }, { passive: false });
}

function hitTest(p) {
  for (let i = S.ops.length - 1; i >= 0; i--) {
    const op = S.ops[i];
    if (op.kind !== 'area') continue;
    if (p.x >= op.x && p.x <= op.x + op.w && p.y >= op.y && p.y <= op.y + op.h) return i;
  }
  return -1;
}

function bindKeys() {
  document.addEventListener('keydown', (e) => {
    const inField = e.target.matches?.('input, textarea, select');
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey && !inField) { e.preventDefault(); undo(); return; }
    if (mod && ((e.key.toLowerCase() === 'z' && e.shiftKey) || e.key.toLowerCase() === 'y') && !inField) { e.preventDefault(); redo(); return; }
    if (mod && e.key.toLowerCase() === 's' && S.srcW) { e.preventDefault(); saveOutput(); return; }
    if (inField) return;
    if (e.code === 'Space') { S.space = true; e.preventDefault(); cv.style.cursor = 'grab'; return; }
    if ((e.key === 'Delete' || e.key === 'Backspace') && S.selected >= 0) {
      e.preventDefault();
      const i = S.selected;
      commit(() => { S.ops.splice(i, 1); S.selected = -1; });
      return;
    }
    const keys = { v: 'select', r: 'area', b: 'brush', c: 'crop', h: 'hand' };
    if (!mod && keys[e.key.toLowerCase()]) setTool(keys[e.key.toLowerCase()]);
  });
  document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') { S.space = false; cv.style.cursor = S.tool === 'hand' ? 'grab' : 'crosshair'; }
  });
}

// ---------- history ----------

const snapshot = () => JSON.stringify({ ops: S.ops, crop: S.crop });

function commit(mutate) {
  S.undo.push(snapshot());
  if (S.undo.length > HISTORY_LIMIT) S.undo.shift();
  S.redo = [];
  mutate();
  afterChange();
}

function undo() {
  if (!S.undo.length) return;
  S.redo.push(snapshot());
  restore(S.undo.pop());
  toast('toast.undo');
}

function redo() {
  if (!S.redo.length) return;
  S.undo.push(snapshot());
  restore(S.redo.pop());
  toast('toast.redo');
}

function restore(s) {
  const o = JSON.parse(s);
  S.ops = o.ops;
  S.crop = o.crop;
  S.selected = -1;
  afterChange();
}

function afterChange() {
  renderAll();
  requestPreview();
  scheduleExportCache();
  draw();
}

// ---------- panels ----------

function renderPanels() {
  for (const [name, node] of Object.entries(el.panels)) node.hidden = S.tool !== name;
  el.toolHint.textContent = t(`hint.${S.tool === 'crop' && !frameDims() ? 'crop.free' : S.tool === 'crop' ? 'crop.fixed' : S.tool}`);
  syncInputs();
}

function syncInputs() {
  const p = S.prefs;
  el.metaKeep.checked = !!p.output.keepMeta;
  el.metaKeep.disabled = p.output.format !== 'jpeg';
  el.areaMode.value = p.area.mode;
  el.areaShape.value = p.area.shape;
  el.areaStrength.value = String(p.area.strength);
  el.areaColor.value = p.area.color;
  el.areaColorField.hidden = p.area.mode !== 'solid';

  el.brushMode.value = p.brush.mode;
  el.brushSize.value = String(p.brush.size);
  el.brushStrength.value = String(p.brush.strength);
  el.brushColor.value = p.brush.color;
  el.brushColorField.hidden = p.brush.mode !== 'solid';

  el.cropRatio.value = p.crop.ratio;
  el.cropCustom.hidden = p.crop.ratio !== 'custom';
  el.cropW.value = String(p.crop.cw);
  el.cropH.value = String(p.crop.ch);
  el.applyCrop.hidden = !frameDims();
  el.removeCrop.disabled = !S.crop;
  renderCropInfo();

  el.outFormat.value = p.output.format;
  el.outQuality.value = String(Math.round(p.output.quality * 100));
  el.outQuality.disabled = p.output.format === 'png';
  el.outMaxKB.value = p.output.maxKB || '';
  el.outMaxW.value = p.output.maxW || '';
  el.outMaxH.value = p.output.maxH || '';

  el.wmOn.checked = p.wm.enabled;
  el.wmText.value = p.wm.text;
  el.wmText.disabled = !p.wm.enabled;
  el.wmPos.value = p.wm.pos;
  el.wmPos.disabled = !p.wm.enabled;

  el.undo.disabled = !S.undo.length;
  el.redo.disabled = !S.redo.length;
  el.clearOps.disabled = !S.ops.length;
}

function renderCropInfo() {
  if (!S.srcW) { el.cropInfo.textContent = ''; return; }
  if (S.crop) {
    const c = S.crop.outW ? { w: S.crop.outW, h: S.crop.outH } : cropPixels(S.srcW, S.srcH, S.crop);
    el.cropInfo.textContent = `${t('panel.crop')}: ${c.w}×${c.h}`;
  } else {
    el.cropInfo.textContent = t('info.nocrop');
  }
}

function renderCropRatioOptions() {
  const opts = [new Option(t('ratio.free'), 'free')];
  for (const p of CROP_PRESETS) opts.push(new Option(`${p.name} · ${p.w}×${p.h}`, p.id));
  opts.push(new Option(t('ratio.custom'), 'custom'));
  el.cropRatio.replaceChildren(...opts);
}

function renderOps() {
  el.opsCount.textContent = S.ops.length ? t('edit.count', { n: S.ops.length }) : t('edit.none');
  el.clearOps.disabled = !S.ops.length;
  el.opsList.replaceChildren(...(S.ops.length ? S.ops.map((op, i) => {
    const li = document.createElement('li');
    if (i === S.selected) li.classList.add('sel');
    const pick = document.createElement('button');
    pick.type = 'button';
    pick.className = 'pick';
    const what = op.kind === 'area'
      ? t('edit.area', { mode: t(`mode.${op.mode}`) })
      : t('edit.brush', { mode: t(`mode.${op.mode}`) });
    pick.textContent = t('edit.label', { n: i + 1, what });
    pick.addEventListener('click', () => { S.selected = i; renderOps(); draw(); });
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'btn ghost small';
    del.textContent = '×';
    del.setAttribute('aria-label', 'delete');
    del.addEventListener('click', () => commit(() => { S.ops.splice(i, 1); S.selected = -1; }));
    li.append(pick, del);
    return li;
  }) : [Object.assign(document.createElement('li'), { className: 'muted', textContent: t('edit.none') })]));
}

function outputDims() {
  if (!S.srcW) return null;
  const c = S.crop?.outW ? { w: S.crop.outW, h: S.crop.outH } : cropPixels(S.srcW, S.srcH, S.crop);
  const o = S.prefs.output;
  return fitWithin(c.w, c.h, o.maxW || null, o.maxH || null);
}

function updateInfo() {
  if (!S.srcW) { el.info.textContent = ''; return; }
  const d = outputDims();
  const size = S.file ? formatBytes(S.file.size) : '';
  el.info.textContent = `${t('info.size', { w: S.srcW, h: S.srcH, size })}  ·  ${t('info.output', { w: d.w, h: d.h })}`;
}

function renderAll() {
  renderCropRatioOptions();
  renderOps();
  renderPanels();
  updateInfo();
  for (const b of [el.save, el.copy]) b.disabled = !S.srcW;
  el.fit.disabled = el.actual.disabled = el.zoomBtn.disabled = !S.srcW;
}

function setStatus(key) {
  S.statusKey = key;
  updateStatus();
}

let busyCount = 0;
let busyTimer = 0;

// Counts overlapping work. The overlay appears after 150 ms, so quick updates do not flicker.
function setBusy(on) {
  busyCount = Math.max(0, busyCount + (on ? 1 : -1));
  S.busy = busyCount > 0;
  clearTimeout(busyTimer);
  if (S.busy) {
    busyTimer = setTimeout(() => {
      el.busyText.textContent = t('status.working');
      el.busy.hidden = false;
    }, 150);
  } else {
    el.busy.hidden = true;
  }
  updateStatus();
}

function updateStatus() {
  el.status.textContent = t(S.busy ? 'status.working' : S.statusKey);
}

let toastTimer = 0;
function toast(key) {
  el.toast.textContent = t(key);
  el.toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.toast.hidden = true; }, 2600);
}

// ---------- output actions ----------

function outName(mime) {
  return `${S.baseName}-wudp.${MIME_EXT[mime] || FORMAT_EXT[S.prefs.output.format]}`;
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

async function toPng(blob) {
  if (blob.type === 'image/png') return blob;
  const bmp = await createImageBitmap(blob);
  const c = new OffscreenCanvas(bmp.width, bmp.height);
  c.getContext('2d').drawImage(bmp, 0, 0);
  bmp.close();
  return c.convertToBlob({ type: 'image/png' });
}

async function copyBlob(blob) {
  try {
    const png = await toPng(blob);
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
    return true;
  } catch {
    return false;
  }
}

async function copyOutput() {
  if (!S.srcW) return;
  try {
    const r = await exportOutput();
    toast((await copyBlob(r.blob)) ? 'toast.copied' : 'toast.error');
  } catch {
    toast('toast.error');
  }
}

async function saveOutput() {
  if (!S.srcW) return;
  try {
    const r = await exportOutput();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(r.blob);
    a.download = outName(r.mime);
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    toast('toast.saved');
  } catch {
    toast('toast.error');
  }
}

// ---------- drag out of the panel ----------

// The file is prepared in the background, so the drag can start at once.
const outputKey = () => JSON.stringify({ ops: S.ops, crop: S.crop, o: S.prefs.output, w: wmOption() });
let cacheTimer = 0;
let cacheRun = 0;

function scheduleExportCache(immediate = false) {
  clearTimeout(cacheTimer);
  S.exportCache = null;
  updateDragHandle();
  if (S.phase !== 'out') return; // nothing to drag while editing
  cacheTimer = setTimeout(refreshExportCache, immediate ? 0 : 350);
}

async function refreshExportCache() {
  if (!S.srcW || S.phase !== 'out') return;
  const key = outputKey();
  const run = ++cacheRun;
  setBusy(true);
  try {
    const r = await exportOutput();
    const url = await blobToDataUrl(r.blob);
    if (run !== cacheRun || key !== outputKey()) return;
    S.exportCache = { key, blob: r.blob, mime: r.mime, name: outName(r.mime), url };
    draw();
  } catch {
    // The next change schedules another attempt.
  } finally {
    setBusy(false);
  }
  updateDragHandle();
}

function updateDragHandle() {
  const ready = !!S.exportCache && S.exportCache.key === outputKey();
  el.outImg.draggable = ready;
  el.outImg.title = t(ready ? 'drag.ready' : 'drag.wait');
}

function bindDrag() {
  el.outImg.addEventListener('mouseenter', () => { if (S.prefs.ui.hints) el.finishTip.classList.remove('is-off'); });
  el.outImg.addEventListener('mouseleave', () => el.finishTip.classList.add('is-off'));
  el.outImg.addEventListener('dragstart', (e) => {
    el.finishTip.classList.add('is-off');
    const c = S.exportCache;
    if (!c || c.key !== outputKey()) {
      e.preventDefault();
      toast('toast.preparing');
      return;
    }
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.items.add(new File([c.blob], c.name, { type: c.mime }));
  });
  // Zoom the output with the wheel; the image stays draggable at any zoom.
  el.outScroll.addEventListener('wheel', (e) => {
    if (!S.exportCache) return;
    e.preventDefault();
    S.outZoom = clamp(S.outZoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12), 1, 8);
    updateZoom();
    draw();
  }, { passive: false });
}


// ---------- workflow phases ----------

function setPhase(name) {
  const edit = name === 'edit';
  S.phase = name === 'out' ? 'out' : 'edit';
  if (!edit) scheduleExportCache(true);
  el.phaseEdit.hidden = !edit;
  el.phaseOut.hidden = edit;
  el.phaseBtns.forEach((b) => {
    const on = (b.dataset.phase === 'edit') === edit;
    b.setAttribute('aria-selected', String(on));
    b.tabIndex = on ? 0 : -1;
  });
  if (!edit && S.view !== 'output') setView('output');
  if (edit && S.view === 'output') setView('edited');
}

// ---------- views and zoom dialog ----------

function setView(name) {
  S.view = name;
  syncViewButtons();
  if (name === 'output') requestPreview();
  draw();
}

function syncViewButtons() {
  el.views.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === S.view)));
}

function currentImage() {
  if (S.view === 'original') return S.srcBmp;
  if (S.view === 'output') return S.outputBmp || S.srcBmp;
  return S.previewBmp || S.srcBmp;
}

function openZoom() {
  const img = currentImage();
  if (!img) return;
  const c = el.zoomCanvas;
  c.width = img.width;
  c.height = img.height;
  c.getContext('2d').drawImage(img, 0, 0);
  const avail = Math.max(120, el.zoomBody.clientWidth - 16);
  el.zoomRange.value = String(Math.max(25, Math.min(100, Math.floor((avail / img.width) * 100))));
  applyZoomDlg();
  el.zoomDlg.showModal();
}

function applyZoomDlg() {
  const z = Number(el.zoomRange.value) / 100;
  el.zoomCanvas.style.width = `${Math.round(el.zoomCanvas.width * z)}px`;
}


// ---------- interface preferences ----------

function applyUi() {
  const u = S.prefs.ui;
  document.body.classList.toggle('large-ui', u.largeUi);
  document.body.classList.toggle('reduce-motion', u.reduceMotion);
  setHints(u.hints);
  applyI18n();
  el.setLarge.checked = u.largeUi;
  el.setHints.checked = u.hints;
  el.setMotion.checked = u.reduceMotion;
  el.startTool.value = u.startTool;
  el.startView.value = u.startView;
  renderAll();
}

function setUi(key, value) {
  S.prefs.ui[key] = value;
  persist();
  applyUi();
}

// ---------- guided tour ----------

let tourIndex = 0;

// The tour runs on the real editor. With no image open, the WUDp banner is loaded as a demo,
// so every step points at a visible control. An image the user already opened is never replaced.
async function loadDemo() {
  const res = await fetch('assets/demo.jpg');
  if (!res.ok) throw new Error('demo');
  await loadFile(await res.blob(), 'wudp-demo', true);
}

async function startTour() {
  tourIndex = 0;
  if (!S.srcW) {
    try {
      await loadDemo();
    } catch {
      toast('toast.error');
    }
  }
  el.tourEl.hidden = false;
  showTourStep();
}

function endTour() {
  el.tourEl.hidden = true;
  S.prefs.ui.tourDone = true;
  persist();
  if (S.isDemo) toast('toast.demo');
}

function showTourStep() {
  const step = TOUR[tourIndex];
  if (step.phase) setPhase(step.phase);
  el.tourStep.textContent = t('tour.step', { i: tourIndex + 1, n: TOUR.length });
  el.tourTitle.textContent = t(step.t);
  el.tourBody.textContent = t(step.b);
  el.tourBack.disabled = tourIndex === 0;
  el.tourNext.textContent = t(tourIndex === TOUR.length - 1 ? 'tour.done' : 'tour.next');
  requestAnimationFrame(() => placeTourHole(document.querySelector(step.target)));
}

// The highlighted element is cut out of a full-screen dim. A missing target dims everything.
function placeTourHole(target) {
  const h = el.tourHole;
  const visible = target && target.getClientRects().length > 0;
  if (!visible) {
    Object.assign(h.style, { left: '50%', top: '50%', width: '0px', height: '0px' });
    return;
  }
  const r = target.getBoundingClientRect();
  const pad = 6;
  Object.assign(h.style, {
    left: `${r.left - pad}px`, top: `${r.top - pad}px`,
    width: `${r.width + pad * 2}px`, height: `${r.height + pad * 2}px`,
  });
}

function bindTour() {
  el.helpBtn.addEventListener('click', startTour);
  el.replayTour.addEventListener('click', () => { el.settingsDlg.close(); startTour(); });
  el.tourNext.addEventListener('click', () => {
    if (tourIndex === TOUR.length - 1) return endTour();
    tourIndex++;
    showTourStep();
  });
  el.tourBack.addEventListener('click', () => { if (tourIndex > 0) { tourIndex--; showTourStep(); } });
  el.tourSkip.addEventListener('click', endTour);
  window.addEventListener('resize', () => { if (!el.tourEl.hidden) placeTourHole(document.querySelector(TOUR[tourIndex].target)); });
  el.welcomeStart.addEventListener('click', () => { el.welcomeDlg.close(); startTour(); });
  el.welcomeLater.addEventListener('click', () => { el.welcomeDlg.close(); S.prefs.ui.tourDone = true; persist(); });

  el.setLarge.addEventListener('change', () => setUi('largeUi', el.setLarge.checked));
  el.setHints.addEventListener('change', () => setUi('hints', el.setHints.checked));
  el.setMotion.addEventListener('change', () => setUi('reduceMotion', el.setMotion.checked));
  el.startTool.addEventListener('change', () => setUi('startTool', el.startTool.value));
  el.startView.addEventListener('change', () => setUi('startView', el.startView.value));
}

// ---------- settings ----------

let saveTimer = 0;
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveData({ prefs: S.prefs }), 300);
}

function sanitize(p = {}) {
  const d = DEFAULT_PREFS();
  const num = (v, fallback, min, max) => clamp(Number.isFinite(Number(v)) ? Number(v) : fallback, min, max);
  const ratioOk = (r) => Array.isArray(r) && r.length === 2 && r.every((n) => n > 0);
  return {
    area: {
      mode: ['blur', 'pixelate', 'solid'].includes(p.area?.mode) ? p.area.mode : d.area.mode,
      shape: ['rect', 'ellipse'].includes(p.area?.shape) ? p.area.shape : d.area.shape,
      strength: num(p.area?.strength, d.area.strength, 1, 40),
      color: /^#[0-9a-f]{6}$/i.test(p.area?.color) ? p.area.color : d.area.color,
    },
    brush: {
      mode: ['blur', 'pixelate', 'solid'].includes(p.brush?.mode) ? p.brush.mode : d.brush.mode,
      strength: num(p.brush?.strength, d.brush.strength, 1, 40),
      color: /^#[0-9a-f]{6}$/i.test(p.brush?.color) ? p.brush.color : d.brush.color,
      size: num(p.brush?.size, d.brush.size, 1, 40),
    },
    crop: {
      ratio: p.crop?.ratio === 'custom' || p.crop?.ratio === 'free' || findPreset(p.crop?.ratio) ? p.crop.ratio : d.crop.ratio,
      cw: Math.round(num(p.crop?.cw, d.crop.cw, 1, 20000)),
      ch: Math.round(num(p.crop?.ch, d.crop.ch, 1, 20000)),
    },
    output: {
      keepMeta: !!p.output?.keepMeta,
      format: FORMATS.includes(p.output?.format) ? p.output.format : d.output.format,
      quality: num(p.output?.quality, d.output.quality, 0.4, 1),
      maxKB: Math.round(num(p.output?.maxKB, 0, 0, 100000)),
      maxW: Math.round(num(p.output?.maxW, 0, 0, 20000)),
      maxH: Math.round(num(p.output?.maxH, 0, 0, 20000)),
    },
    ui: {
      hints: p.ui?.hints !== false,
      largeUi: !!p.ui?.largeUi,
      reduceMotion: !!p.ui?.reduceMotion,
      startTool: ['select', 'area', 'brush', 'crop', 'hand'].includes(p.ui?.startTool) ? p.ui.startTool : d.ui.startTool,
      startView: p.ui?.startView === 'original' ? 'original' : 'edited',
      tourDone: !!p.ui?.tourDone,
    },
    wm: {
      enabled: !!p.wm?.enabled,
      text: typeof p.wm?.text === 'string' ? p.wm.text.slice(0, 60) : '',
      pos: ['br', 'bl', 'tr', 'tl', 'tile'].includes(p.wm?.pos) ? p.wm.pos : d.wm.pos,
    },
    _ok: ratioOk,
  };
}

function applyTheme(id) {
  const theme = THEMES.includes(id) ? id : 'modern';
  S.theme = theme;
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('wudp-theme', theme);
  el.themeSel.value = theme;
}

function populateSettings() {
  el.langSel.replaceChildren(...LANGS.map((l) => new Option(l.name, l.code)));
  el.langSel.value = document.documentElement.lang || 'en';
  el.themeSel.replaceChildren(...THEMES.map((id) => new Option(t(`theme.${id}`), id)));
  el.themeSel.value = S.theme;
}

// ---------- bindings ----------

function bindControls() {
  const changePrefs = (fn) => { fn(); persist(); syncInputs(); if (S.view === 'output') requestPreview(); scheduleExportCache(); };

  el.open.addEventListener('click', () => el.file.click());
  el.emptyOpen.addEventListener('click', (e) => { e.stopPropagation(); el.file.click(); });
  el.dropBox.addEventListener('click', () => el.file.click());
  el.dropBox.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.file.click(); } });
  el.file.addEventListener('change', () => {
    const f = el.file.files?.[0];
    el.file.value = '';
    if (f) loadFile(f);
  });

  let dragDepth = 0;
  window.addEventListener('dragenter', () => { dragDepth++; el.dropBox.classList.add('dragover'); });
  window.addEventListener('dragleave', () => { dragDepth = Math.max(0, dragDepth - 1); if (!dragDepth) el.dropBox.classList.remove('dragover'); });
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    dragDepth = 0;
    el.dropBox.classList.remove('dragover');
    const f = e.dataTransfer?.files?.[0];
    if (f) loadFile(f);
  });
  document.addEventListener('paste', (e) => {
    const f = [...(e.clipboardData?.files || [])].find((x) => x.type.startsWith('image/'));
    if (f) loadFile(f, 'pasted-image');
  });

  el.undo.addEventListener('click', undo);
  el.redo.addEventListener('click', redo);
  el.zoomBtn.addEventListener('click', openZoom);
  el.zoomClose.addEventListener('click', () => el.zoomDlg.close());
  el.zoomDlg.addEventListener('click', (e) => { if (e.target === el.zoomDlg) el.zoomDlg.close(); });
  el.zoomRange.addEventListener('input', applyZoomDlg);
  el.fit.addEventListener('click', fit);
  el.actual.addEventListener('click', actual);
  el.views.forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));
  el.tools.forEach((b) => b.addEventListener('click', () => setTool(b.dataset.tool)));

  // Area and brush
  el.areaMode.addEventListener('change', () => changePrefs(() => { S.prefs.area.mode = el.areaMode.value; }));
  el.areaShape.addEventListener('change', () => changePrefs(() => { S.prefs.area.shape = el.areaShape.value; }));
  el.areaStrength.addEventListener('input', () => changePrefs(() => { S.prefs.area.strength = Number(el.areaStrength.value); }));
  el.areaColor.addEventListener('input', () => changePrefs(() => { S.prefs.area.color = el.areaColor.value; }));
  el.brushMode.addEventListener('change', () => changePrefs(() => { S.prefs.brush.mode = el.brushMode.value; }));
  el.brushSize.addEventListener('input', () => changePrefs(() => { S.prefs.brush.size = Number(el.brushSize.value); }));
  el.brushStrength.addEventListener('input', () => changePrefs(() => { S.prefs.brush.strength = Number(el.brushStrength.value); }));
  el.brushColor.addEventListener('input', () => changePrefs(() => { S.prefs.brush.color = el.brushColor.value; }));

  // Crop
  el.cropRatio.addEventListener('change', () => {
    S.prefs.crop.ratio = el.cropRatio.value;
    persist();
    renderPanels();
    draw();
  });
  const customSize = () => {
    const w = Math.round(Number(el.cropW.value));
    const h = Math.round(Number(el.cropH.value));
    if (w > 0 && h > 0) { S.prefs.crop.cw = w; S.prefs.crop.ch = h; persist(); draw(); }
  };
  el.cropW.addEventListener('input', customSize);
  el.cropH.addEventListener('input', customSize);
  el.applyCrop.addEventListener('click', applyFixedCrop);
  el.removeCrop.addEventListener('click', () => {
    commit(() => { S.crop = null; });
    setView('edited');
  });

  el.clearOps.addEventListener('click', () => commit(() => { S.ops = []; S.selected = -1; }));

  // Output
  el.outFormat.addEventListener('change', () => changePrefs(() => { S.prefs.output.format = el.outFormat.value; }));
  el.outQuality.addEventListener('input', () => changePrefs(() => { S.prefs.output.quality = Number(el.outQuality.value) / 100; }));
  el.outMaxKB.addEventListener('input', () => changePrefs(() => { S.prefs.output.maxKB = Math.max(0, Math.round(Number(el.outMaxKB.value) || 0)); }));
  el.outMaxW.addEventListener('input', () => changePrefs(() => { S.prefs.output.maxW = Math.max(0, Math.round(Number(el.outMaxW.value) || 0)); }));
  el.outMaxH.addEventListener('input', () => changePrefs(() => { S.prefs.output.maxH = Math.max(0, Math.round(Number(el.outMaxH.value) || 0)); }));

  // Watermark
  el.wmOn.addEventListener('change', () => changePrefs(() => { S.prefs.wm.enabled = el.wmOn.checked; }));
  el.wmText.addEventListener('input', () => changePrefs(() => { S.prefs.wm.text = el.wmText.value; }));
  el.wmPos.addEventListener('change', () => changePrefs(() => { S.prefs.wm.pos = el.wmPos.value; }));
  el.metaKeep.addEventListener('change', () => changePrefs(() => { S.prefs.output.keepMeta = el.metaKeep.checked; }));

  // Actions
  el.save.addEventListener('click', saveOutput);
  el.copy.addEventListener('click', copyOutput);

  // Settings dialog
  el.settingsBtn.addEventListener('click', () => { el.settingsDlg.showModal(); });
  el.closeSettings.addEventListener('click', () => el.settingsDlg.close());
  el.settingsDlg.addEventListener('click', (e) => { if (e.target === el.settingsDlg) el.settingsDlg.close(); });
  el.langSel.addEventListener('change', () => {
    setLang(el.langSel.value);
    applyI18n();
    populateSettings();
    renderAll();
    updateStatus();
    renderPanels();
  });
  el.themeSel.addEventListener('change', () => applyTheme(el.themeSel.value));
  el.phaseBtns.forEach((b) => b.addEventListener('click', () => setPhase(b.dataset.phase)));
  el.mtabs.forEach((b, i) => {
    const show = (name) => {
      el.mtabs.forEach((x) => { const on = x.dataset.mtab === name; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; });
      $('#pane-settings').hidden = name !== 'settings';
      $('#pane-about').hidden = name !== 'about';
    };
    b.addEventListener('click', () => show(b.dataset.mtab));
    b.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const next = el.mtabs[(i + (e.key === 'ArrowRight' ? 1 : el.mtabs.length - 1)) % el.mtabs.length];
      next.focus();
      show(next.dataset.mtab);
    });
  });
  bindDrag();
  el.opsToggle.addEventListener('click', () => {
    const open = el.opsList.hidden;
    el.opsList.hidden = !open;
    el.opsToggle.setAttribute('aria-expanded', String(open));
  });
  el.resetPrefs.addEventListener('click', () => {
    S.prefs = DEFAULT_PREFS();
    persist();
    syncInputs();
    renderAll();
    draw();
    toast('toast.settingsreset');
  });

  if (hasExt) {
    ext.storage.onChanged.addListener((changes, area) => {
      if (area === 'session' && changes.pendingImage?.newValue) checkPending();
    });
  }
  new ResizeObserver(() => { draw(); }).observe(viewport);
  el.zoomInBtn.addEventListener('click', () => stepZoom(1.25));
  el.zoomOutBtn.addEventListener('click', () => stepZoom(0.8));
}

// ---------- init ----------

async function init() {
  setLang(detectLang());
  applyTheme(localStorage.getItem('wudp-theme') || 'modern');
  applyI18n();

  const data = await loadData();
  const p = sanitize(data.prefs);
  delete p._ok;
  S.prefs = p;

  applyIcons();
  setPhase('edit');
  bindCanvas();
  bindKeys();
  bindControls();
  syncViewButtons();
  updateDragHandle();
  populateSettings();
  renderAll();
  bindTour();
  applyUi();
  setTool(S.prefs.ui.startTool);
  setStatus('status.idle');
  checkPending();
  if (!S.prefs.ui.tourDone) el.welcomeDlg.showModal();
}

init();
