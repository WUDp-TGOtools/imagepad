// Shared helpers for the build and the checks. Only Node built-ins.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const readJson = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));

// Objects merge deeply. Arrays are concatenated without duplicates. Other values from the overlay win.
export function merge(base, over) {
  if (Array.isArray(base) && Array.isArray(over)) return [...new Set([...base, ...over])];
  if (base && typeof base === 'object' && over && typeof over === 'object' && !Array.isArray(over)) {
    const out = { ...base };
    for (const [k, v] of Object.entries(over)) out[k] = k in out ? merge(out[k], v) : v;
    return out;
  }
  return over === undefined ? base : over;
}

export function manifestFor(target) {
  const pkg = readJson('package.json');
  const base = readJson('manifests/base.json');
  const over = readJson(`manifests/${target}.json`);
  return { ...merge(base, over), version: pkg.version };
}

export const TARGETS = ['chrome', 'edge', 'firefox'];
