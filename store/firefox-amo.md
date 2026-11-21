# Firefox Add-ons (AMO) listing: ImagePad

**Download:** Coming soon

**Name:** ImagePad
**Summary (max 250 characters):**
Prepare images for upload beside any page: crop, blur, watermark, then drag into the site. Nothing is uploaded.

**Categories:** Photo, Editing (suggested: Photos)
**Language:** English (default)

**Description:**
Same as the Chrome Web Store description (store/chrome-web-store.md). ImagePad opens in the Firefox sidebar.

**Reviewer notes:**
- The extension has no background network access. Images never leave the browser.
- The editor opens in the sidebar from the toolbar button or from the right-click menu "Edit with ImagePad".
- To try the guided tour, open the sidebar and press the help button (?). The tour loads a demo image.
- Build: `npm ci` is not needed (no dependencies). Run `npm run build:firefox`; the source is in src/.
- Source code: https://github.com/WUDp-TGOtools (repository link to be published with the release)

**Data collection:** none (declared in the manifest as data_collection_permissions: none).
**Privacy policy:** to be published with the release (link to be added).
