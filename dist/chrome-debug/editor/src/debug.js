// Diagnostics. Logging is active only in debug builds (npm run build:debug).
// Errors are always reported with console.error, in every build.
import { DEBUG_BUILD } from './build-flags.js';

const RING = [];
const RING_MAX = 500;

function safe(data) {
  try {
    return JSON.parse(JSON.stringify(data));
  } catch {
    return String(data);
  }
}

export function dlog(scope, msg, data) {
  if (!DEBUG_BUILD) return;
  const entry = { t: Date.now(), scope, msg, data: data === undefined ? undefined : safe(data) };
  RING.push(entry);
  if (RING.length > RING_MAX) RING.shift();
  console.debug(`[ImagePad][${scope}] ${msg}`, data === undefined ? '' : data);
}

// The last entries as text, for a bug report. Empty in normal builds.
export function diagnosticsText() {
  const header = `ImagePad debug log  build=${DEBUG_BUILD ? 'debug' : 'normal'}  ua=${navigator.userAgent}`;
  const lines = RING.map((e) => {
    const time = new Date(e.t).toISOString();
    const data = e.data === undefined ? '' : ' ' + JSON.stringify(e.data);
    return `${time} [${e.scope}] ${e.msg}${data}`;
  });
  return [header, ...lines].join('\n');
}

export function installErrorReporting() {
  window.addEventListener('error', (e) => {
    console.error('[ImagePad] uncaught error:', e.message, `${e.filename}:${e.lineno}:${e.colno}`, e.error);
    dlog('error', 'uncaught', { message: e.message, at: `${e.filename}:${e.lineno}` });
  });
  window.addEventListener('unhandledrejection', (e) => {
    console.error('[ImagePad] unhandled promise rejection:', e.reason);
    dlog('error', 'unhandled rejection', { reason: String(e.reason) });
  });
}
