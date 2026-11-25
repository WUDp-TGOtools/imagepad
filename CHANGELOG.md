# Changelog

## 1.2.4
- Fixed (Chrome): the background script took the Firefox path, because Chrome also exposes a `browser` object. Firefox is now detected by its sidebar API.
- Fixed (Chrome): the `license` key was removed from manifest.json (Chrome warned about it). The license stays in LICENSE and package.json.
- Tests cover Chrome, Edge without a side panel, and Firefox.

## 1.2.3
- Fixed (Firefox): dropping the finished image back onto the panel, or outside it, replaced the source with the processed image. Drops that start inside ImagePad are now ignored.
- New debug build: `npm run build:debug` (or `build:debug:firefox`, etc.) writes `dist/<browser>-debug` and `imagepad-<browser>-<version>-debug.zip`. It logs drag and drop events, worker round trips with timings, and previews; it adds a "Copy debug log" button in Settings. The normal build keeps logging off.
- Errors are reported with their cause in every build.

## 1.2.2
- Firefox: dragging the output image no longer replaces the editor with the image. The browser's default URL data is cleared, so only the file is dragged.

## 1.2.1
- Firefox: errors in the preview, the export and the drawing are logged to the console with their cause. A closed image is skipped instead of breaking the view.

## 1.2.0
- Renamed the extension to **ImagePad**.
- One repository for Chrome, Edge and Firefox (`npm run build` produces all three).
- Edge build with a tab fallback when the side panel is not available.
- Faster editing: cached operation masks, resumable previews, and the Finish image is built only when the Finish tab is open.
- Loading indicator while changes are applied.
- Guided tour uses the demo image when nothing is open.
- README with screenshots, store listings (coming soon), release posts in dist/posts.

## 1.1.0
- Edge build (see 1.2.0 for the Edge fallback).
- Faster editing and a loading indicator.

## 1.0.1
- Guided tour uses the WUDp banner as a demo image when nothing is open.

## 1.0.0
- First official release (Chrome). Side panel editor, areas, brush, crop with site frames, watermark, output settings, optional metadata (JPEG), guided tour, settings, privacy notes.
