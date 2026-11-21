// Persistent settings. Only settings and custom templates are stored. Images never are.
const KEY = 'wudp-data';
import { ext, hasExt as inExt } from './browser.js';
const hasExt = inExt && !!ext.storage?.local;

export async function loadData() {
  try {
    if (hasExt) {
      const r = await ext.storage.local.get(KEY);
      return r[KEY] || {};
    }
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

export async function saveData(data) {
  try {
    if (hasExt) await ext.storage.local.set({ [KEY]: data });
    else localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Storage can be full or blocked. The app keeps working with in-memory settings.
  }
}

export async function clearData() {
  try {
    if (hasExt) await ext.storage.local.remove(KEY);
    else localStorage.removeItem(KEY);
  } catch {
    // ignored
  }
}
