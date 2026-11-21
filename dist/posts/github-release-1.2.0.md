# ImagePad 1.2.0

Prepare images for upload beside any page. Crop to free areas or site frames, blur, pixelate or cover parts of a picture, add a watermark, then drag the result into the site, copy it or save it. Nothing is uploaded.

## Highlights
- Renamed to **ImagePad** (part of WUDp by TGO.tools).
- One source for **Chrome, Edge and Firefox**. Builds: `dist/chrome`, `dist/edge`, `dist/firefox`.
- Faster editing: cached operation masks, resumable previews, the Finish image is built only when Finish is open.
- A loading indicator appears while changes are applied.
- Guided tour uses a demo image when nothing is open.

## Downloads
| Browser | File |
| --- | --- |
| Chrome | `imagepad-chrome-1.2.0.zip` |
| Edge | `imagepad-edge-1.2.0.zip` |
| Firefox | `imagepad-firefox-1.2.0.zip` |

Store links: coming soon.

## Install from the ZIP
- **Chrome:** `chrome://extensions` → Developer mode → Load unpacked → the unpacked folder.
- **Edge:** `edge://extensions` → Developer mode → Load unpacked.
- **Firefox:** `about:debugging` → This Firefox → Load Temporary Add-on → `manifest.json`.

## Known limits
- Firefox and Edge builds are not yet tested in the browser by the maintainers; please report issues.
- Brush has no eraser (use undo).
- Metadata can be kept for JPEG output only.

Full changes: see CHANGELOG.md.
