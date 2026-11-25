// One entry point for the browser extension API.
// Firefox exposes `browser` (promise based); Chrome exposes `chrome`. Both are used the same way here.
// Firefox is detected by its sidebar API (Chrome may also expose a `browser` object).
export const isFirefox = typeof globalThis.browser?.sidebarAction !== 'undefined';
export const ext = isFirefox ? globalThis.browser : globalThis.chrome;
export const hasExt = !!ext?.runtime?.id;
