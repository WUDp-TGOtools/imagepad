"""Captures README screenshots from a real Chromium with the built extension loaded.

Requirements (run on your machine, not in CI):
    pip install playwright
    python -m playwright install chromium
    npm run build:chrome
    python scripts/capture.py

Writes docs/images/*.png. Replace the placeholders with these files.
Note: the editor is opened as a tab here, because Playwright cannot open the side panel.
This script is not tested in every environment; adjust selectors if the UI changes.
"""
import pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
EXT = ROOT / "dist" / "chrome"
OUT = ROOT / "docs" / "images"
DEMO = "https://images.google.com/"  # Google Images: the camera icon opens the upload drop area
SAMPLE = ROOT / "src" / "editor" / "assets" / "demo.jpg"


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        ctx = p.chromium.launch_persistent_context(
            "",
            headless=False,
            args=[f"--disable-extensions-except={EXT}", f"--load-extension={EXT}"],
            viewport={"width": 1280, "height": 800},
        )
        page = ctx.pages[0] if ctx.pages else ctx.new_page()
        page.goto(DEMO)
        page.wait_for_timeout(500)
        page.screenshot(path=str(OUT / "google-images-upload.png"))

        worker = ctx.service_workers[0] if ctx.service_workers else ctx.wait_for_event("serviceworker")
        ext_id = worker.url.split("/")[2]
        editor = ctx.new_page()
        editor.set_viewport_size({"width": 420, "height": 860})
        editor.goto(f"chrome-extension://{ext_id}/editor/index.html")
        editor.set_input_files("#fileInput", str(SAMPLE))
        editor.wait_for_selector("#workspace:not([hidden])")
        editor.wait_for_timeout(800)
        editor.screenshot(path=str(OUT / "panel-edit.png"))

        editor.click("[data-tool=area]")
        box = editor.locator("#view").bounding_box()
        editor.mouse.move(box["x"] + box["width"] * 0.3, box["y"] + box["height"] * 0.3)
        editor.mouse.down()
        editor.mouse.move(box["x"] + box["width"] * 0.6, box["y"] + box["height"] * 0.5, steps=8)
        editor.mouse.up()
        editor.wait_for_timeout(600)
        editor.screenshot(path=str(OUT / "panel-blur.png"))

        editor.click("[data-phase=out]")
        editor.wait_for_timeout(1500)
        editor.screenshot(path=str(OUT / "panel-finish.png"))
        ctx.close()
    print("captured into", OUT)


if __name__ == "__main__":
    main()
