import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const src = readFileSync(new URL('../src/background.js', import.meta.url), 'utf8');

// Loads the background script in a fake environment, clicks "Edit with ImagePad" and returns the calls made.
async function clickMenu(globals) {
  const calls = [];
  const listeners = {};
  const common = {
    runtime: { getURL: (p) => `ext://${p}`, onInstalled: { addListener: (f) => (listeners.installed = f) } },
    contextMenus: { create: () => {}, onClicked: { addListener: (f) => (listeners.menu = f) } },
    storage: { session: { set: async () => {} } },
    action: { onClicked: { addListener: () => {} } },
    tabs: { create: async (o) => calls.push(['tabs.create', o.url]) },
  };
  const ctx = { console, Date, ...globals(common, calls) };
  vm.createContext(ctx);
  vm.runInContext(src, ctx);
  listeners.installed();
  await listeners.menu({ menuItemId: 'wudp-edit-image', srcUrl: 'https://example.com/a.jpg' }, { id: 3 });
  return calls;
}

test('Chrome uses the side panel even when a `browser` object exists', async () => {
  const calls = await clickMenu((common, calls) => ({
    chrome: {
      ...common,
      sidePanel: { setPanelBehavior: async () => {}, open: async (o) => calls.push(['sidePanel.open', o.tabId]) },
    },
    browser: { runtime: {}, storage: {} }, // no sidebarAction, so this is not Firefox
  }));
  assert.deepEqual(calls, [['sidePanel.open', 3]]);
});

test('Edge without a side panel opens the editor in a tab', async () => {
  const calls = await clickMenu((common) => ({ chrome: { ...common } }));
  assert.deepEqual(calls, [['tabs.create', 'ext://editor/index.html']]);
});

test('Firefox uses sidebarAction', async () => {
  const calls = await clickMenu((common, calls) => ({
    browser: {
      ...common,
      sidebarAction: { open: async () => calls.push(['sidebarAction.open']) },
    },
  }));
  assert.deepEqual(calls, [['sidebarAction.open']]);
});
