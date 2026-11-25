// Background script for both browsers. Chrome uses an MV3 service worker, Firefox an event page.
// It opens the side panel / sidebar and adds the context menu. No image data passes through here.
// Firefox is detected by its sidebar API. Chrome may also expose a `browser` object, so that is not enough.
const isFirefox = typeof globalThis.browser?.sidebarAction !== 'undefined';
const ext = isFirefox ? globalThis.browser : globalThis.chrome;
const MENU_ID = 'wudp-edit-image';

// Chrome and Edge use the side panel when it exists. Firefox uses its sidebar.
// Browsers without a side panel API open the editor in a tab, so it still works.
const hasSidePanel = !isFirefox && !!ext.sidePanel;
const editorUrl = () => ext.runtime.getURL('editor/index.html');

function openEditor(tabId) {
  if (isFirefox) return ext.sidebarAction.open();
  if (hasSidePanel) return ext.sidePanel.open({ tabId });
  return ext.tabs.create({ url: editorUrl() });
}

ext.runtime.onInstalled.addListener(() => {
  ext.contextMenus.create({ id: MENU_ID, title: 'Edit with ImagePad', contexts: ['image'] });
  if (hasSidePanel) ext.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
});

if (isFirefox) {
  // Firefox has no openPanelOnActionClick; the toolbar button opens the sidebar itself.
  ext.action.onClicked.addListener(() => { ext.sidebarAction.open(); });
} else if (!hasSidePanel) {
  ext.action.onClicked.addListener(() => { ext.tabs.create({ url: editorUrl() }); });
}

ext.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID || !info.srcUrl) return;
  await ext.storage.session.set({ pendingImage: { src: info.srcUrl, at: Date.now() } });
  await openEditor(tab?.id);
});
