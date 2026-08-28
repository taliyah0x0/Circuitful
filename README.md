# Circuitful (Modern)

A ground-up rebuild of [Circuitful](../Circuitful%208:7:2022) — a tool for drawing colorful circuit
diagrams — in React + SVG. The original 2022 project (Phaser-based) is untouched; this is an
independent app that reads its part data once at build time via `scripts/extract-catalog.mjs` and
otherwise shares nothing with it at runtime.

## Run it

```bash
npm install
npm run dev
```

## What's here

- **Workspace** (`/#/workspace`) — place parts, wire them together, pan/zoom, undo/redo, save/load
  `.circuitful.json`, export high-resolution PNG/SVG (no screenshots needed).
- **Part Editor** (`/#/part-editor`) — upload an image, click to drop pins, assign power/ground
  roles, and **save straight into your parts library** — no editing source files or copy-pasting
  generated code, which was the main pain point in the original app.
- **Landing** (`/#/`) — the four original entry points, now all fully wired up (importing a saved
  part or workspace actually works, unlike the original where both just opened a tutorial page).

Built-in parts (59 of them, extracted from the original `Workspace.js`) live in
`public/data/catalog.json` + `public/parts/*.png`. Custom parts you create are stored in the
browser's IndexedDB and listed in the palette with a "mine" badge; they round-trip through
`.circuitpart.json` files if you want to share one.

## Architecture

- `src/state/workspaceStore.js` — the whole diagram (objects, wires, nodes) plus undo/redo, as a
  Zustand store. Wires use a proper node-graph (shared node ids referenced by segments) instead of
  the original's sentinel-integer encoding — dragging a node moves every wire attached to it, and
  wire endpoints track their part's pin live instead of needing manual resync.
- `src/components/workspace/Canvas.jsx` — the SVG canvas: pan/zoom, box-select, drag, wiring.
- `src/components/workspace/*` — palette, toolbar, inspector, wire/object rendering.
- `src/components/parteditor/*` — the part authoring UI.
- `src/lib/exportImage.js` — SVG → PNG/SVG export (crops to content bounds, adjustable resolution).
- `src/state/partsLibraryStore.js` + `src/lib/idb.js` — built-in catalog + custom parts (IndexedDB).

## Known gaps vs. the original

- Only the first 10 of 59 built-ins have a hand-written `object-information` spec page in the
  original app; those pages were copied over as-is (`public/info/`) but nothing links to the
  missing 49 — same as the original.
- Object labels (e.g. resistor value text) are implemented per the reverse-engineered spec but
  have seen less hands-on testing than the core place/wire/save/export flow. Per-object scale and
  IC-chip/button pin-count variants have since been verified working (including undo).
- "Submit to community" is not reimplemented as a Google Form handoff — saving to your local
  library replaces it. A real community-sharing backend would be a separate project.
