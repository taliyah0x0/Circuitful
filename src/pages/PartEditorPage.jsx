import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, Trash2, ArrowLeft, Download, FolderInput, LayoutGrid, ZoomIn, ZoomOut, Maximize2, Minimize2, HelpCircle, Moon, Sun } from "lucide-react";
import { usePartsLibrary } from "../state/partsLibraryStore.js";
import { readDataURLFile, pickFile, readJSONFile } from "../lib/fileIO.js";
import { downloadJSON } from "../lib/fileIO.js";
import { partImageSrc } from "../lib/parts.js";
import { getStoredTheme, toggleTheme } from "../lib/theme.js";
import PinCanvas from "../components/parteditor/PinCanvas.jsx";
import PartEditorHelpModal from "../components/parteditor/PartEditorHelpModal.jsx";
import IconButton from "../components/shared/IconButton.jsx";
import "./PartEditorPage.css";

const PENDING_IMPORT_KEY = "circuitful.pendingPartImport";

const CATEGORIES = ["Microcontrollers", "Electrical", "Modules", "Other"];
const ROLES = [
  { value: "", label: "No role" },
  { value: "power", label: "Power" },
  { value: "ground", label: "Ground" },
];

export default function PartEditorPage() {
  const navigate = useNavigate();
  const { partId } = useParams();
  const init = usePartsLibrary((s) => s.init);
  const findPart = usePartsLibrary((s) => s.findPart);
  const saveCustomPart = usePartsLibrary((s) => s.saveCustomPart);
  const fileInputRef = useRef(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Other");
  const [imageSrc, setImageSrc] = useState(null);
  const [natural, setNatural] = useState(null); // native pixel size of imageSrc
  const [imagePos, setImagePos] = useState({ x: 0, y: 0 });
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [pins, setPins] = useState([]); // {x, y, role} in absolute world units
  const [scale, setScale] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [theme, setTheme] = useState(getStoredTheme());

  useEffect(() => {
    init();
  }, [init]);

  // Loads a part definition (an existing library part, or a freshly-imported
  // .circuitpart.json) into the editor's working state. Pins are stored as
  // fractions of the image's bounds; unpack them into absolute world
  // positions using the part's own scale, image centered at the origin —
  // matches how buildPart() re-normalizes them on save.
  function applyPartData(part) {
    const src = partImageSrc(part);
    const img = new Image();
    img.onload = () => {
      const size = { width: img.naturalWidth, height: img.naturalHeight };
      setNatural(size);
      const partScale = part.scale || 1;
      setPins(
        (part.pins || []).map((p) => ({
          x: p.x * size.width * partScale,
          y: p.y * size.height * partScale,
          role: p.role || "",
        }))
      );
    };
    img.src = src;
    setName(part.name);
    setCategory(part.category || "Other");
    setImageSrc(src);
    setImagePos({ x: 0, y: 0 });
    setScale(part.scale || 1);
    setSelectedIndex(null);
  }

  useEffect(() => {
    if (partId) return;
    const pending = sessionStorage.getItem(PENDING_IMPORT_KEY);
    if (!pending) return;
    sessionStorage.removeItem(PENDING_IMPORT_KEY);
    try {
      applyPartData(JSON.parse(pending));
    } catch {
      // ignore malformed pending import
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partId]);

  useEffect(() => {
    if (!partId) return;
    const part = findPart(partId);
    if (!part) return;
    applyPartData(part);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partId, findPart]);

  useEffect(() => {
    function onKeyDown(e) {
      const el = document.activeElement;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      if (selectedIndex === null) return;
      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        setPins((p) => p.filter((_, i) => i !== selectedIndex));
        setSelectedIndex(null);
      }
      const nudge = 4; // world units — pins are absolute now, not fractions
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        setPins((p) =>
          p.map((pin, i) => {
            if (i !== selectedIndex) return pin;
            const dx = e.key === "ArrowLeft" ? -nudge : e.key === "ArrowRight" ? nudge : 0;
            const dy = e.key === "ArrowUp" ? -nudge : e.key === "ArrowDown" ? nudge : 0;
            return { ...pin, x: pin.x + dx, y: pin.y + dy };
          })
        );
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedIndex]);

  async function handleFile(file) {
    if (!file) return;
    const dataUrl = await readDataURLFile(file);
    const size = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.src = dataUrl;
    });
    // Fit new artwork into a comfortable working size rather than dumping it
    // in at native pixel size (which can be huge) or a fixed 100%.
    const fit = Math.min(1, 380 / size.width, 260 / size.height);
    setNatural(size);
    setScale(fit || 1);
    setImageSrc(dataUrl);
    setImagePos({ x: 0, y: 0 });
    setPins([]);
    setSelectedIndex(null);
    if (!name) setName(file.name.replace(/\.[^.]+$/, ""));
  }

  function handleAddPin(pos) {
    setPins((p) => [...p, { x: pos.x, y: pos.y, role: "" }]);
    setSelectedIndex(pins.length);
  }

  function handleMovePin(index, pos) {
    setPins((p) => p.map((pin, i) => (i === index ? { ...pin, x: pos.x, y: pos.y } : pin)));
  }

  function buildPart() {
    // Pins are absolute world positions in the editor; normalize them back
    // to fractions of the image's current bounds for storage, so the part
    // scales correctly wherever it's placed in the Workspace.
    const imgW = (natural?.width || 1) * scale;
    const imgH = (natural?.height || 1) * scale;
    return {
      id: partId && partId.startsWith("custom-") ? partId : undefined,
      name: name.trim() || "Untitled Part",
      category,
      scale,
      pinCount: pins.length,
      image: null,
      imageDataUrl: imageSrc,
      pins: pins.map((p) => ({
        x: (p.x - imagePos.x) / imgW,
        y: (p.y - imagePos.y) / imgH,
        role: p.role || null,
      })),
    };
  }

  async function handleUseInWorkspace() {
    if (!imageSrc) return;
    // Same local-only idb save as everything else in the library — placing
    // this part in the Workspace requires it to actually exist there first.
    await saveCustomPart(buildPart());
    navigate("/workspace");
  }

  async function handleImportPartFile() {
    const file = await pickFile(".circuitpart.json,.json");
    if (!file) return;
    try {
      const data = await readJSONFile(file);
      if (!data.name || !Array.isArray(data.pins)) {
        throw new Error("Not a valid Circuitful part file");
      }
      if (partId) {
        // Currently editing an existing library part — importing a different
        // file shouldn't silently overwrite it, so detach to a fresh (unsaved)
        // part before loading the imported data in.
        navigate("/part-editor", { replace: true });
      }
      applyPartData(data);
    } catch (err) {
      alert(`Couldn't import that file: ${err.message}`);
    }
  }

  function handleDownload() {
    downloadJSON(`${(name || "part").replace(/\s+/g, "_")}.circuitpart.json`, buildPart());
  }

  // Press-and-hold scaling: a small step per tick so the part can be dialed
  // in precisely instead of jumping in coarse increments.
  const scaleIntervalRef = useRef(null);
  function startScaling(factor) {
    setScale((s) => Math.min(4, Math.max(0.05, s * factor)));
    scaleIntervalRef.current = setInterval(() => {
      setScale((s) => Math.min(4, Math.max(0.05, s * factor)));
    }, 50);
  }
  function stopScaling() {
    if (scaleIntervalRef.current) {
      clearInterval(scaleIntervalRef.current);
      scaleIntervalRef.current = null;
    }
  }

  return (
    <div className="part-editor-page">
      <div className="part-editor-toolbar">
        <IconButton icon={ArrowLeft} label="Back to menu" onClick={() => navigate("/")} />
        <span className="part-editor-title">Part Editor</span>
        <div className="part-editor-toolbar-spacer" />
        <div className="part-editor-toolbar-group">
          <span className="part-editor-toolbar-group-label">Zoom</span>
          <IconButton
            icon={ZoomOut}
            label="Zoom out (grid, part, and pins together)"
            onClick={() => setViewport((v) => ({ ...v, zoom: Math.max(0.15, v.zoom * 0.85) }))}
          />
          <span className="part-editor-scale">{Math.round(viewport.zoom * 100)}%</span>
          <IconButton
            icon={ZoomIn}
            label="Zoom in (grid, part, and pins together)"
            onClick={() => setViewport((v) => ({ ...v, zoom: Math.min(6, v.zoom * 1.15) }))}
          />
        </div>
        <div className="part-editor-toolbar-group">
          <IconButton icon={HelpCircle} label="Keyboard shortcuts" onClick={() => setShowHelp(true)} />
          <IconButton
            icon={theme === "dark" ? Sun : Moon}
            label="Toggle dark mode"
            onClick={() => setTheme(toggleTheme())}
          />
        </div>
      </div>

      <div className="part-editor-body">
        <div
          className="part-editor-canvas-area"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files?.[0]);
          }}
        >
          {imageSrc ? (
            <PinCanvas
              imageSrc={imageSrc}
              natural={natural}
              scale={scale}
              imagePos={imagePos}
              onMoveImage={setImagePos}
              viewport={viewport}
              onViewportChange={setViewport}
              pins={pins}
              selectedIndex={selectedIndex}
              onAddPin={handleAddPin}
              onSelectPin={setSelectedIndex}
              onMovePin={handleMovePin}
            />
          ) : (
            <button className="part-editor-dropzone" onClick={() => fileInputRef.current?.click()}>
              <Upload size={28} />
              <span>Click to upload an image, or drag one here</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        <aside className="part-editor-sidebar">
          <div className="field">
            <label>Name</label>
            <input className="inspector-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mini Servo" />
          </div>
          <div className="field">
            <label>Category</label>
            <select className="inspector-input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Image</label>
            <button className="inspector-btn" onClick={() => fileInputRef.current?.click()}>
              <Upload size={14} /> {imageSrc ? "Replace image" : "Upload image"}
            </button>
          </div>
          <div className="field">
            <label>Existing part</label>
            <button className="inspector-btn" onClick={handleImportPartFile}>
              <FolderInput size={14} /> Import .circuitpart.json
            </button>
          </div>

          <div className="field">
            <label>Part scale (relative to grid)</label>
            <div className="inspector-row">
              <button
                className="inspector-btn"
                onMouseDown={() => startScaling(0.98)}
                onMouseUp={stopScaling}
                onMouseLeave={stopScaling}
                title="Hold to shrink precisely"
              >
                <Minimize2 size={14} />
              </button>
              <span className="part-editor-scale" style={{ flex: 1 }}>
                {Math.round(scale * 100)}%
              </span>
              <button
                className="inspector-btn"
                onMouseDown={() => startScaling(1.02)}
                onMouseUp={stopScaling}
                onMouseLeave={stopScaling}
                title="Hold to enlarge precisely"
              >
                <Maximize2 size={14} />
              </button>
            </div>
          </div>

          <div className="part-editor-pins-header">
            <label>Pins ({pins.length})</label>
          </div>
          <div className="part-editor-pin-list scrollable">
            {pins.map((pin, i) => (
              <div key={i} className={`part-editor-pin-row${selectedIndex === i ? " part-editor-pin-row--active" : ""}`} onClick={() => setSelectedIndex(i)}>
                <span className={`part-editor-pin-dot part-editor-pin-dot--${pin.role || "none"}`} />
                <span className="part-editor-pin-index">Pin {i + 1}</span>
                <select
                  className="part-editor-pin-role"
                  value={pin.role}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setPins((p) => p.map((pp, idx) => (idx === i ? { ...pp, role: e.target.value } : pp)))}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <button
                  className="part-editor-pin-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPins((p) => p.filter((_, idx) => idx !== i));
                    if (selectedIndex === i) setSelectedIndex(null);
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            {pins.length === 0 && <p className="inspector-hint">No pins yet — click anywhere on the canvas to add one.</p>}
          </div>

          <div className="part-editor-actions">
            <button className="inspector-btn" onClick={handleDownload} disabled={!imageSrc}>
              <Download size={14} /> Download .circuitpart.json
            </button>
            <button className="btn btn--primary part-editor-save" onClick={handleUseInWorkspace} disabled={!imageSrc}>
              <LayoutGrid size={14} /> Use in Workspace
            </button>
          </div>
        </aside>
      </div>
      {showHelp && <PartEditorHelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}
