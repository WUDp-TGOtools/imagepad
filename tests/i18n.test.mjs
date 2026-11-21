import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DICT } from '../src/editor/src/i18n.js';

const html = readFileSync(new URL('../src/editor/index.html', import.meta.url), 'utf8');
const appJs = readFileSync(new URL('../src/editor/src/editor.js', import.meta.url), 'utf8');

test('every key has exactly four non-empty strings (en, ru, fa, zh)', () => {
  for (const [key, row] of Object.entries(DICT)) {
    assert.equal(row.length, 4, `${key} must have 4 entries`);
    for (const s of row) assert.ok(s && s.trim().length > 0, `${key} has an empty entry`);
  }
});

test('every data-i18n, data-i18n-aria, data-i18n-ph and data-help key in index.html exists', () => {
  const keys = [...html.matchAll(/data-(?:i18n|i18n-aria|i18n-ph|help)="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(keys.length > 0);
  for (const k of keys) assert.ok(k in DICT, `missing key: ${k}`);
});

test('every translation key quoted in app.js exists', () => {
  const prefixes = new Set(Object.keys(DICT).map((k) => k.split('.')[0]));
  const used = [...appJs.matchAll(/'([a-z]+(?:\.[a-zA-Z]+)+)'/g)].map((m) => m[1]);
  for (const k of used) {
    if (!prefixes.has(k.split('.')[0])) continue;
    assert.ok(k in DICT, `missing key used in app.js: ${k}`);
  }
});
