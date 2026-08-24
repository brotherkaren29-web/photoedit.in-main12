# photoedit.in — PRD

## Problem Statement
Free browser-based image / screenshot editor branded **photoedit.in**. No accounts. Runs entirely client-side. Multi-page site is AdSense-compliant.

## Core Requirements
- Photopea-inspired workspace with `photoedit.in` branding (not a visual copy).
- Full markup toolkit: crop, resize, rotate, brush, eraser, arrow, rectangle, ellipse, highlight, text, pixelate, fill, picker, undo/redo, download.
- Edits FLATTENED into one merged image.
- Sources: file upload, clipboard paste, browser screen capture.
- AdSense-compliance pages, ads.txt, meta tags.
- Local drafts + auto-save so users can return to unfinished work.
- Touch support (pinch-zoom + two-finger pan) for mobile.

## Personas
- Anyone wanting a quick browser-based image / screenshot editor without signing up.

## Implemented (2026-02)
- **Routing**: React Router — Home, Editor, About, Privacy, Terms, Contact, Disclaimer, 404.
- **Content pages**: original AdSense-ready copy with cross-links + footer.
- **AdSense**: `AdSlot` component with placeholder → real ins tag; `/public/ads.txt`; SEO meta tags; central `src/config.js`.
- **Editor menus**: functional dropdowns for File / Edit / Image / Layer / Filter / View.
- **Editor tools**: move, select, crop (drag rectangle), resize, brush, eraser, arrow, highlight, rectangle, ellipse, text (click-to-place), blur/pixelate, fill, picker, hand.
- **Options bar** adapts to tool: color picker + size slider appear where applicable; hints for crop/text/fill/picker.
- **Adjustments**: brightness / contrast / grayscale / sepia / invert live via CSS filter, baked into pixels on export or Filter menu.
- **Rotate CW+CCW / Flip H+V** bake into pixels.
- **Undo/redo** via snapshot stack (30) preserving dimensions.
- **Export** PNG or JPG.
- **Native aspect ratio** preserved on upload (1600px longest-edge cap).
- **Touch**: pinch-zoom (clamped 25–200%) + two-finger pan via `usePinchZoom` hook; `touch-action: none` on canvas.
- **Drafts**: multiple named drafts in localStorage via `useDraft` hook. JPEG@0.72 compression + max-1200px so ~5 full-size drafts easily fit; auto-drops oldest if quota still hit. Right-panel Drafts tab lists cards with thumbnail, dimensions, rename, load, delete. **Hover preview** shows a larger version + full metadata popup. **Export all** downloads every draft as a ZIP (with sanitized filenames + `drafts-manifest.txt`) via JSZip.
- **Auto-save**: every 60s to a separate slot (only after first edit). On next visit, `Restore auto-save` banner appears with Restore/Discard.
- **Legacy migration**: old `photoedit_draft_v1` key moves into the auto-save slot on first mount.
- **Standalone** `/app/standalone/index.html` all-in-one file.

## Backlog / Not Yet Built (P1)
- Real backend contact form (currently mailto:).
- Selectable / removable annotation objects.
- Further Editor.jsx refactor (split into `<Menubar>`, `<ToolRail>`, `<RightPanel>` sub-components).
- Draft export to file (download all drafts as a .zip archive).

## Deferred (P2)
- Multi-layer editing (current version is intentionally flattened).
- Cloud save / auth / sharing.
- IndexedDB migration if users hit even the compressed quota.

## Architecture
- Frontend only: React + React Router 7 + client-side `<canvas>`.
- No backend / DB use.
- Snapshot history in `useRef` as PNG data URLs.
- Drafts + autosave in localStorage under `photoedit_drafts_v2` (array) and `photoedit_autosave_v1` (single).
- Hooks: `useDraft`, `usePinchZoom`.
- AdSense pub ID centralised in `src/config.js`; ads.txt at `/public/ads.txt`.
