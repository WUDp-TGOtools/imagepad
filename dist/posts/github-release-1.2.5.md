# ImagePad 1.2.5 (first stable release)

ImagePad prepares images for upload, right beside the page you are on. Crop to free areas or site frames, blur, pixelate or cover parts of a picture, add a watermark, then drag the result into the site, copy it or save it. Nothing is uploaded.

## Highlights
- First stable release, for Chrome, Edge and Firefox, from one source.
- Edit: crop (free or site frames, with the image moving under the frame), area blur, pixelate and color cover (rectangle or ellipse), brush, undo and redo, zoom.
- Finish: text watermark (corner or tiled), JPEG, WebP or PNG, quality, maximum file size and pixel size, optional metadata for JPEG.
- Output: drag the finished image into a page, copy it as PNG, or save it.
- Guided tour with a demo image, settings (language, theme, UX options), privacy notes.
- Fixes in this line: Firefox no longer replaces the source when a drag ends on the panel; Chrome side panel detection; drag navigation fix.

## Downloads

| Browser | File |
| --- | --- |
| Chrome | `imagepad-chrome-1.2.5.zip` |
| Edge | `imagepad-edge-1.2.5.zip` |
| Firefox | `imagepad-firefox-1.2.5.zip` |
| Debug builds (verbose logs) | `imagepad-<browser>-1.2.5-debug.zip` |

Store links: coming soon.

## Install from the ZIP
- **Chrome:** `chrome://extensions` → Developer mode → Load unpacked → the unpacked folder.
- **Edge:** `edge://extensions` → Developer mode → Load unpacked.
- **Firefox:** `about:debugging` → This Firefox → Load Temporary Add-on → `manifest.json`. (Temporary add-ons are removed when Firefox restarts.)

## Known limits
- Brush has no eraser; use undo.
- Metadata can be kept for JPEG output only.
- The Firefox file in this release is not signed; store signing is pending.

Full changes: see CHANGELOG.md.
