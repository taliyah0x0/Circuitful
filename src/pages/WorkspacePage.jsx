import { useEffect, useRef, useState } from "react";
import { useWorkspace } from "../state/workspaceStore.js";
import { usePartsLibrary } from "../state/partsLibraryStore.js";
import Toolbar from "../components/workspace/Toolbar.jsx";
import PartsPalette from "../components/workspace/PartsPalette.jsx";
import Canvas from "../components/workspace/Canvas.jsx";
import Inspector from "../components/workspace/Inspector.jsx";
import HelpModal from "../components/workspace/HelpModal.jsx";
import ExportModal from "../components/workspace/ExportModal.jsx";
import { downloadJSON, pickFile, readJSONFile } from "../lib/fileIO.js";
import { snap, snapObjectToPinGrid } from "../lib/parts.js";
import { nativeSizeFor } from "../lib/wireResolve.js";
import "./WorkspacePage.css";

const GRID_SIZE = 28;

export default function WorkspacePage() {
  const svgRef = useRef(null);
  const initLibrary = usePartsLibrary((s) => s.init);
  const [showHelp, setShowHelp] = useState(false);
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    initLibrary();
  }, [initLibrary]);

  useEffect(() => {
    const pending = sessionStorage.getItem("circuitful.pendingImport");
    if (pending) {
      try {
        useWorkspace.getState().loadFromJSON(JSON.parse(pending));
      } catch {
        // ignore malformed pending import
      }
      sessionStorage.removeItem("circuitful.pendingImport");
    }
  }, []);

  function handleSave() {
    const data = useWorkspace.getState().toJSON();
    downloadJSON("workspace.circuitful.json", data);
    useWorkspace.getState().markSaved();
  }

  async function handleOpen() {
    const file = await pickFile(".circuitful.json,.json");
    if (!file) return;
    try {
      const data = await readJSONFile(file);
      useWorkspace.getState().loadFromJSON(data);
    } catch (err) {
      alert(`Couldn't open that file: ${err.message}`);
    }
  }

  function handlePlacePart(partId) {
    const { addObject, viewport, snapEnabled } = useWorkspace.getState();
    const rect = svgRef.current?.getBoundingClientRect();
    const cx = rect ? (rect.width / 2 - viewport.x) / viewport.zoom : 0;
    const cy = rect ? (rect.height / 2 - viewport.y) / viewport.zoom : 0;
    const part = usePartsLibrary.getState().findPart(partId);
    const point =
      snapEnabled && part
        ? snapObjectToPinGrid(part, { x: cx, y: cy, rotation: 0, scale: 1 }, nativeSizeFor(part), GRID_SIZE)
        : { x: snap(cx, GRID_SIZE), y: snap(cy, GRID_SIZE) };
    addObject(partId, point.x, point.y);
  }

  useEffect(() => {
    function isTyping() {
      const el = document.activeElement;
      return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
    }

    function onKeyDown(e) {
      if (isTyping()) return;
      const store = useWorkspace.getState();
      const { selection } = store;
      const key = e.key.toLowerCase();

      if (key === "escape") {
        store.clearSelection();
        return;
      }

      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        store.undo();
        return;
      }
      if (key === "x" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        store.redo();
        return;
      }
      if (key === "s" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleSave();
        return;
      }
      if (key === "c") {
        store.togglePenMode();
        return;
      }

      if (selection.type === "object" && selection.ids.length) {
        if (key === "d") {
          e.preventDefault();
          store.duplicateObjects(selection.ids);
          return;
        }
        if (key === "backspace" || key === "delete") {
          e.preventDefault();
          store.deleteObjects(selection.ids);
          return;
        }
        const nudge = GRID_SIZE / 4;
        if (["arrowleft", "arrowright", "arrowup", "arrowdown"].includes(key)) {
          e.preventDefault();
          if (e.shiftKey && (key === "arrowleft" || key === "arrowright")) {
            store.rotateObjects(selection.ids, key === "arrowright" ? 1 : -1);
          } else if (e.shiftKey && key === "arrowup") {
            store.bringToFront(selection.ids);
          } else if (e.shiftKey && key === "arrowdown") {
            store.sendToBack(selection.ids);
          } else {
            store.beginDrag();
            const dx = key === "arrowleft" ? -nudge : key === "arrowright" ? nudge : 0;
            const dy = key === "arrowup" ? -nudge : key === "arrowdown" ? nudge : 0;
            store.moveObjects(selection.ids, dx, dy);
          }
          return;
        }
      }

      if (selection.type === "wire" && selection.ids.length) {
        const wire = store.doc.wires.find((w) => w.id === selection.ids[0]);
        if (wire) {
          if (key === "backspace" || key === "delete") {
            e.preventDefault();
            store.deleteWireGroup(wire.groupId);
            return;
          }
          if (key === "w") {
            const nodeA = store.doc.nodes.find((n) => n.id === wire.nodeA);
            const nodeB = store.doc.nodes.find((n) => n.id === wire.nodeB);
            if (nodeA && nodeB) store.addNodeOnWire(wire.id, (nodeA.x + nodeB.x) / 2, (nodeA.y + nodeB.y) / 2);
            return;
          }
          const palette = usePartsLibrary.getState().builtinMeta?.palette || [];
          if (/^[0-9]$/.test(key) && !e.shiftKey) {
            const idx = key === "0" ? 9 : Number(key) - 1;
            if (palette[idx]) {
              store.setSegmentColor(wire.id, palette[idx]);
            }
            return;
          }
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="workspace-page">
      <Toolbar
        onSave={handleSave}
        onOpen={handleOpen}
        onExportPng={() => setShowExport(true)}
        onShowHelp={() => setShowHelp(true)}
      />
      <div className="workspace-body">
        <PartsPalette onPlacePart={handlePlacePart} />
        <Canvas forwardedRef={svgRef} />
        <Inspector />
      </div>
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showExport && <ExportModal svgRef={svgRef} onClose={() => setShowExport(false)} />}
    </div>
  );
}
