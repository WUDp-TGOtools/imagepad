// One entry point for the browser extension API.
// Firefox exposes `browser` (promise based); Chrome exposes `chrome`. Both are used the same way here.
export const ext = globalThis.browser ?? globalThis.chrome;
export const isFirefox = typeof globalThis.browser !== 'undefined';
export const hasExt = !!ext?.runtime?.id;
