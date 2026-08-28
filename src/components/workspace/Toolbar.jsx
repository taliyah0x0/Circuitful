import { useState } from "react";
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Magnet,
  PenLine,
  Save,
  FolderOpen,
  ImageDown,
  Moon,
  Sun,
  HelpCircle,
  Home,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import IconButton from "../shared/IconButton.jsx";
import { useWorkspace } from "../../state/workspaceStore.js";
import { getStoredTheme, toggleTheme } from "../../lib/theme.js";
import "./Toolbar.css";

export default function Toolbar({ onSave, onOpen, onExportPng, onExportSvg, onShowHelp }) {
  const navigate = useNavigate();
  const past = useWorkspace((s) => s.past);
  const future = useWorkspace((s) => s.future);
  const snapEnabled = useWorkspace((s) => s.snapEnabled);
  const penMode = useWorkspace((s) => s.penMode);
  const viewport = useWorkspace((s) => s.viewport);
  const dirty = useWorkspace((s) => s.dirty);
  const { undo, redo, toggleSnap, togglePenMode, zoomAt, resetViewport } = useWorkspace.getState();
  const [theme, setTheme] = useState(getStoredTheme());

  function zoomButton(factor) {
    zoomAt(factor, window.innerWidth / 2 - 240, window.innerHeight / 2);
  }

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <IconButton icon={ArrowLeft} label="Back to menu" onClick={() => navigate("/")} />
        <span className="toolbar-title">Circuitful{dirty ? " •" : ""}</span>
      </div>

      <div className="toolbar-group">
        <IconButton icon={Undo2} label="Undo (Z)" onClick={undo} disabled={past.length === 0} />
        <IconButton icon={Redo2} label="Redo (X)" onClick={redo} disabled={future.length === 0} />
      </div>

      <div className="toolbar-group">
        <IconButton icon={ZoomOut} label="Zoom out" onClick={() => zoomButton(0.85)} />
        <span className="toolbar-zoom">{Math.round(viewport.zoom * 100)}%</span>
        <IconButton icon={ZoomIn} label="Zoom in" onClick={() => zoomButton(1.15)} />
        <IconButton icon={Home} label="Reset view" onClick={resetViewport} />
      </div>

      <div className="toolbar-group">
        <IconButton icon={Magnet} label="Snap to grid" active={snapEnabled} onClick={toggleSnap} />
        <IconButton icon={PenLine} label="Pen mode — draw wires anywhere (C)" active={penMode} onClick={togglePenMode} />
      </div>

      <div className="toolbar-group">
        <IconButton icon={FolderOpen} label="Open workspace" onClick={onOpen} />
        <IconButton icon={Save} label="Save workspace (S)" onClick={onSave} />
        <IconButton icon={ImageDown} label="Export image" onClick={onExportPng} />
      </div>

      <div className="toolbar-group toolbar-group--end">
        <IconButton icon={HelpCircle} label="Keyboard shortcuts" onClick={onShowHelp} />
        <IconButton
          icon={theme === "dark" ? Sun : Moon}
          label="Toggle dark mode"
          onClick={() => setTheme(toggleTheme())}
        />
      </div>
    </div>
  );
}
