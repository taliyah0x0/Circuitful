import { useMemo, useState } from "react";
import { useWorkspace } from "../../state/workspaceStore.js";
import { usePartsLibrary } from "../../state/partsLibraryStore.js";
import { computeSceneBounds } from "../../lib/exportBounds.js";
import { downloadPng, downloadSvg } from "../../lib/exportImage.js";
import { urlToDataUrl } from "../../lib/fileIO.js";
import Modal from "../shared/Modal.jsx";
import "./ExportModal.css";

const PADDING = 40;

function buildCroppedClone(svgEl, bounds) {
  const clone = svgEl.cloneNode(true);
  clone.querySelectorAll(".workspace-grid-bg, .workspace-selection-outline").forEach((el) => el.remove());
  const viewport = clone.querySelector(".workspace-viewport");
  if (viewport) viewport.setAttribute("transform", `translate(${-bounds.x + PADDING} ${-bounds.y + PADDING})`);
  const width = bounds.width + PADDING * 2;
  const height = bounds.height + PADDING * 2;
  clone.setAttribute("width", width);
  clone.setAttribute("height", height);
  clone.setAttribute("viewBox", `0 0 ${width} ${height}`);
  return clone;
}

// A rasterized SVG's nested <image href> references are resolved against the
// blob: URL used to load it, not the page — relative/absolute-but-same-origin
// paths silently fail to draw there, so every reference has to be inlined as
// a data URI before we serialize the SVG for export.
async function inlineImageHrefs(svgEl) {
  const images = Array.from(svgEl.querySelectorAll("image"));
  await Promise.all(
    images.map(async (img) => {
      const href = img.getAttribute("href") || img.getAttribute("xlink:href");
      if (!href) return;
      const dataUrl = await urlToDataUrl(href);
      img.setAttribute("href", dataUrl);
      img.removeAttribute("xlink:href");
    })
  );
}

export default function ExportModal({ svgRef, onClose }) {
  const [scale, setScale] = useState(2);
  const [background, setBackground] = useState("#ffffff");
  const [transparent, setTransparent] = useState(false);
  const [busy, setBusy] = useState(false);

  const doc = useWorkspace((s) => s.doc);
  const builtin = usePartsLibrary((s) => s.builtin);
  const custom = usePartsLibrary((s) => s.custom);
  const builtinMeta = usePartsLibrary((s) => s.builtinMeta);
  const partsById = useMemo(() => {
    const map = new Map();
    for (const p of [...builtin, ...custom]) map.set(p.id, p);
    return map;
  }, [builtin, custom]);

  const bounds = useMemo(() => computeSceneBounds(doc, partsById, builtinMeta), [doc, partsById, builtinMeta]);

  async function handleExportPng() {
    setBusy(true);
    try {
      const clone = buildCroppedClone(svgRef.current, bounds);
      await inlineImageHrefs(clone);
      await downloadPng(clone, "circuit.png", { scale, background: transparent ? null : background });
    } finally {
      setBusy(false);
      onClose();
    }
  }

  async function handleExportSvg() {
    setBusy(true);
    try {
      const clone = buildCroppedClone(svgRef.current, bounds);
      // Inlined so the .svg file is self-contained and opens correctly outside this app too.
      await inlineImageHrefs(clone);
      downloadSvg(clone, "circuit.svg", { background: transparent ? null : background });
    } finally {
      setBusy(false);
      onClose();
    }
  }

  return (
    <Modal title="Export image" onClose={onClose} hideFooter>
      <div className="export-form">
        <div className="field">
          <label>Resolution</label>
          <div className="export-scale-row">
            {[1, 2, 3, 4].map((s) => (
              <button key={s} className={`export-scale-btn${scale === s ? " export-scale-btn--active" : ""}`} onClick={() => setScale(s)}>
                {s}×
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Background</label>
          <div className="export-bg-row">
            <input type="color" value={background} onChange={(e) => setBackground(e.target.value)} disabled={transparent} />
            <label className="export-transparent-toggle">
              <input type="checkbox" checked={transparent} onChange={(e) => setTransparent(e.target.checked)} />
              Transparent
            </label>
          </div>
        </div>
        <p className="inspector-hint">
          {Math.round(bounds.width + PADDING * 2)} × {Math.round(bounds.height + PADDING * 2)} px at 1× — exports at{" "}
          {Math.round((bounds.width + PADDING * 2) * scale)} × {Math.round((bounds.height + PADDING * 2) * scale)} px
        </p>
      </div>
      <div className="modal-actions">
        <button className="btn" onClick={onClose}>
          Cancel
        </button>
        <button className="btn" onClick={handleExportSvg} disabled={busy}>
          Export SVG
        </button>
        <button className="btn btn--primary" onClick={handleExportPng} disabled={busy}>
          {busy ? "Exporting…" : "Export PNG"}
        </button>
      </div>
    </Modal>
  );
}
