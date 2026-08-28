# Circuitful (Modernized)

An AI-optimized rebuild of 2022 project [Circuitful](https://circuitful.netlify.app) — a tool for drawing colorful circuit
diagrams — in React + SVG (used to be Phaser JS).

## Run it

```bash
npm install
npm run dev
```

## What's here

- **Workspace** (`/#/workspace`) — place parts, wire them together, pan/zoom, undo/redo, save/load
  `.circuitful.json`, export high-resolution PNG/SVG (no more screenshots, lag issues).
- **Part Editor** (`/#/part-editor`) — upload an image, click to drop pins, assign power/ground
  roles, and **save straight into your parts library** (no more editing source files or copy-pasting code).

Built-in parts (59 of them, extracted from the original `Workspace.js`) live in
`public/data/catalog.json` + `public/parts/*.png`. Custom parts you create are stored in the
browser's IndexedDB and listed in the palette with a "new" badge.

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
