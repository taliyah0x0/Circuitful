import { useEffect, useMemo, useState } from "react";
import { RotateCcw, RotateCw, Copy, Trash2, ChevronsUp, ChevronsDown, Info, Plus, Download } from "lucide-react";
import { useWorkspace } from "../../state/workspaceStore.js";
import { usePartsLibrary } from "../../state/partsLibraryStore.js";
import { formatOhms } from "../../lib/resistorCode.js";
import { partImageSrc, isColorable } from "../../lib/parts.js";
import { resolveNodePosition } from "../../lib/wireResolve.js";
import { useImageCacheVersion } from "../../lib/useImageSize.js";
import { downloadJSON, urlToDataUrl } from "../../lib/fileIO.js";
import PartThumb from "../shared/PartThumb.jsx";
import "./Inspector.css";

export default function Inspector() {
  const selection = useWorkspace((s) => s.selection);
  const doc = useWorkspace((s) => s.doc);
  const builtin = usePartsLibrary((s) => s.builtin);
  const custom = usePartsLibrary((s) => s.custom);
  const partsById = useMemo(() => {
    const map = new Map();
    for (const p of [...builtin, ...custom]) map.set(p.id, p);
    return map;
  }, [builtin, custom]);

  if (selection.type === "object" && selection.ids.length === 1) {
    const object = doc.objects.find((o) => o.id === selection.ids[0]);
    if (object) return <ObjectInspector key={object.id} object={object} part={partsById.get(object.partId)} />;
  }
  if (selection.type === "object" && selection.ids.length > 1) {
    return <MultiObjectInspector ids={selection.ids} />;
  }
  if (selection.type === "wire" && selection.ids.length >= 1) {
    const wire = doc.wires.find((w) => w.id === selection.ids[0]);
    if (wire) return <WireInspector wire={wire} />;
  }
  return null;
}

async function downloadPart(part) {
  const imageDataUrl = part.imageDataUrl || (await urlToDataUrl(partImageSrc(part)));
  downloadJSON(`${part.name.replace(/\s+/g, "_")}.circuitpart.json`, {
    name: part.name,
    category: part.category,
    scale: part.scale,
    pinCount: part.pins.length,
    image: null,
    imageDataUrl,
    spritesheet: part.spritesheet || undefined,
    pins: part.pins.map((p) => ({ x: p.x, y: p.y, role: p.role || null })),
  });
}

function Section({ title, children }) {
  return (
    <div className="inspector-section">
      {title && <h4>{title}</h4>}
      {children}
    </div>
  );
}

function ObjectInspector({ object, part }) {
  const { rotateObjects, duplicateObjects, deleteObjects, bringToFront, sendToBack, setObjectSettings, updateObjectSettingsLive, beginDrag } =
    useWorkspace.getState();
  const ids = [object.id];

  // Continuous text inputs: one undo step per edit session (on focus),
  // then live updates on every keystroke without spamming history.
  const startEditSession = () => beginDrag();

  return (
    <aside className="inspector">
      <div className="inspector-header">
        <PartThumb part={part} object={object} />
        <div>
          <h3>{part.name}</h3>
          <span>{part.category}</span>
        </div>
      </div>

      <Section title="Transform">
        <div className="inspector-row">
          <button className="inspector-btn" onClick={() => rotateObjects(ids, -1)}>
            <RotateCcw size={15} /> Rotate
          </button>
          <button className="inspector-btn" onClick={() => rotateObjects(ids, 1)}>
            <RotateCw size={15} /> Rotate
          </button>
        </div>
        <div className="inspector-row">
          <button className="inspector-btn" onClick={() => bringToFront(ids)}>
            <ChevronsUp size={15} /> Front
          </button>
          <button className="inspector-btn" onClick={() => sendToBack(ids)}>
            <ChevronsDown size={15} /> Back
          </button>
        </div>
      </Section>

      {part.builtinId === 2 && (
        <Section title="Resistance">
          <input
            type="number"
            className="inspector-input"
            value={object.settings?.resistorOhms ?? 220}
            onFocus={startEditSession}
            onChange={(e) => updateObjectSettingsLive(object.id, { resistorOhms: Number(e.target.value) || 0 })}
          />
          <p className="inspector-hint">{formatOhms(object.settings?.resistorOhms ?? 220)}</p>
        </Section>
      )}

      {(part.builtinId === 4 || part.builtinId === 12) && (
        <Section title="Pin count">
          <select
            className="inspector-input"
            value={object.settings?.pinVariant ?? part.pinCount}
            onChange={(e) => setObjectSettings(object.id, { pinVariant: Number(e.target.value) })}
          >
            {(part.builtinId === 4 ? [2, 4] : [4, 6, 8, 10, 12, 14, 16]).map((n) => (
              <option key={n} value={n}>
                {n} pins
              </option>
            ))}
          </select>
        </Section>
      )}

      {part.defaultLabel && (
        <Section title="Label">
          <input
            type="text"
            className="inspector-input"
            value={object.settings?.label ?? part.defaultLabel.text}
            onFocus={startEditSession}
            onChange={(e) => updateObjectSettingsLive(object.id, { label: e.target.value })}
          />
        </Section>
      )}

      {isColorable(part) && (
        <Section title="Color">
          <ColorPicker
            value={object.settings?.tintColor || null}
            onChange={(color) => setObjectSettings(object.id, { tintColor: color })}
          />
        </Section>
      )}

      {(part.builtinId === 13 || part.builtinId === 14) && (
        <Section title="Label Color">
          <ColorPicker
            value={object.settings?.labelColor || null}
            onChange={(color) => setObjectSettings(object.id, { labelColor: color })}
            noneTitle="Use theme default (black/white)"
          />
        </Section>
      )}

      <Section>
        <div className="inspector-row">
          <button className="inspector-btn" onClick={() => duplicateObjects(ids)}>
            <Copy size={15} /> Duplicate
          </button>
          <button
            className="inspector-btn inspector-btn--danger"
            onClick={() => deleteObjects(ids)}
          >
            <Trash2 size={15} /> Delete
          </button>
        </div>
        <button className="inspector-btn" onClick={() => downloadPart(part)}>
          <Download size={15} /> Download part
        </button>
        {part.builtinId >= 0 && part.builtinId <= 9 && (
          <a className="inspector-btn" href={`/info/${part.builtinId}/info.html`} target="_blank" rel="noreferrer">
            <Info size={15} /> Part info
          </a>
        )}
      </Section>
    </aside>
  );
}

function MultiObjectInspector({ ids }) {
  const { rotateObjects, duplicateObjects, deleteObjects, bringToFront, sendToBack } = useWorkspace.getState();
  return (
    <aside className="inspector">
      <div className="inspector-header">
        <div>
          <h3>{ids.length} objects selected</h3>
        </div>
      </div>
      <Section title="Transform">
        <div className="inspector-row">
          <button className="inspector-btn" onClick={() => rotateObjects(ids, -1)}>
            <RotateCcw size={15} /> Rotate
          </button>
          <button className="inspector-btn" onClick={() => rotateObjects(ids, 1)}>
            <RotateCw size={15} /> Rotate
          </button>
        </div>
        <div className="inspector-row">
          <button className="inspector-btn" onClick={() => bringToFront(ids)}>
            <ChevronsUp size={15} /> Front
          </button>
          <button className="inspector-btn" onClick={() => sendToBack(ids)}>
            <ChevronsDown size={15} /> Back
          </button>
        </div>
      </Section>
      <Section>
        <div className="inspector-row">
          <button className="inspector-btn" onClick={() => duplicateObjects(ids)}>
            <Copy size={15} /> Duplicate
          </button>
          <button className="inspector-btn inspector-btn--danger" onClick={() => deleteObjects(ids)}>
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </Section>
    </aside>
  );
}

function ColorPicker({ value, onChange, noneTitle = "No tint" }) {
  const defaults = (usePartsLibrary((s) => s.builtinMeta?.customObjectColorDefaults) || []).filter(
    (c) => c.toLowerCase() !== "#ffffff"
  );
  const [hex, setHex] = useState(value || "#");

  // Keep the field in sync when the active color changes from elsewhere
  // (a swatch, the color well, or switching selected objects).
  useEffect(() => {
    setHex(value || "#");
  }, [value]);

  function handleHexChange(e) {
    // The leading "#" can't be typed away — deleting everything just leaves it.
    const raw = e.target.value.replace(/#/g, "");
    const next = "#" + raw;
    setHex(next);
    if (/^#([0-9a-fA-F]{6})$/.test(next)) onChange(next);
  }

  return (
    <>
      <div className="inspector-swatches">
        <button
          className="inspector-swatch inspector-swatch--none"
          style={{ outline: !value ? "2px solid var(--primary)" : "none" }}
          onClick={() => onChange(null)}
          title={noneTitle}
        />
        {defaults.map((c) => (
          <button
            key={c}
            className="inspector-swatch"
            style={{ background: c, outline: value === c ? "2px solid var(--primary)" : "none" }}
            onClick={() => onChange(c)}
          />
        ))}
      </div>
      <div className="field" style={{ marginTop: 10, marginBottom: 0 }}>
        <label>Custom</label>
        <div className="inspector-row" style={{ marginTop: 0 }}>
          <input
            type="color"
            className="inspector-color-well"
            value={/^#([0-9a-fA-F]{6})$/.test(hex) ? hex : "#ffffff"}
            onChange={(e) => {
              setHex(e.target.value);
              onChange(e.target.value);
            }}
            title="Pick any color"
          />
          <input className="inspector-input" value={hex} onChange={handleHexChange} />
        </div>
      </div>
    </>
  );
}

function WireInspector({ wire }) {
  useImageCacheVersion();
  const doc = useWorkspace((s) => s.doc);
  const builtinMeta = usePartsLibrary((s) => s.builtinMeta);
  const builtin = usePartsLibrary((s) => s.builtin);
  const custom2 = usePartsLibrary((s) => s.custom);
  const partsById = useMemo(() => {
    const map = new Map();
    for (const p of [...builtin, ...custom2]) map.set(p.id, p);
    return map;
  }, [builtin, custom2]);
  const { setSegmentColor, deleteWireGroup, addNodeOnWire, addCustomColor, removeCustomColor } = useWorkspace.getState();
  const [hex, setHex] = useState(wire.color || "#");

  useEffect(() => {
    setHex(wire.color || "#");
  }, [wire.color, wire.id]);

  const presets = builtinMeta?.palette || [];
  const custom = doc.customColors || [];

  function handleHexChange(e) {
    // The leading "#" can't be typed away — deleting everything just leaves it.
    const next = "#" + e.target.value.replace(/#/g, "");
    setHex(next);
    if (/^#([0-9a-fA-F]{6})$/.test(next)) {
      setSegmentColor(wire.id, next);
      addCustomColor(next);
    }
  }

  return (
    <aside className="inspector">
      <div className="inspector-header">
        <div>
          <h3>Wire</h3>
        </div>
      </div>
      <Section title="Color">
        <div className="inspector-swatches">
          {presets.map((c) => (
            <button
              key={c}
              className="inspector-swatch"
              style={{ background: c, outline: wire.color === c ? "2px solid var(--primary)" : "none" }}
              onClick={() => setSegmentColor(wire.id, c)}
            />
          ))}
        </div>
      </Section>
      {custom.length > 0 && (
        <Section title="Recent">
          <div className="inspector-swatches">
            {custom.map((c) => (
              <button
                key={c}
                className="inspector-swatch"
                style={{ background: c, outline: wire.color === c ? "2px solid var(--primary)" : "none" }}
                onClick={() => setSegmentColor(wire.id, c)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  removeCustomColor(c);
                }}
                title="Right-click to remove"
              />
            ))}
          </div>
        </Section>
      )}
      <div className="field" style={{ marginTop: 10, marginBottom: 0 }}>
        <label>Custom</label>
        <div className="inspector-row" style={{ marginTop: 0 }}>
          <input
            type="color"
            className="inspector-color-well"
            value={/^#([0-9a-fA-F]{6})$/.test(hex) ? hex : "#ffffff"}
            onChange={(e) => {
              setHex(e.target.value);
              setSegmentColor(wire.id, e.target.value);
              addCustomColor(e.target.value);
            }}
            title="Pick any color"
          />
          <input className="inspector-input" value={hex} onChange={handleHexChange} />
        </div>
      </div>
      <Section>
        <div className="inspector-row">
          <button
            className="inspector-btn"
            onClick={() => {
              const nodeA = doc.nodes.find((n) => n.id === wire.nodeA);
              const nodeB = doc.nodes.find((n) => n.id === wire.nodeB);
              const a = resolveNodePosition(nodeA, doc, partsById, builtinMeta);
              const b = resolveNodePosition(nodeB, doc, partsById, builtinMeta);
              addNodeOnWire(wire.id, (a.x + b.x) / 2, (a.y + b.y) / 2);
            }}
          >
            <Plus size={15} /> Add node
          </button>
          <button className="inspector-btn inspector-btn--danger" onClick={() => deleteWireGroup(wire.groupId)}>
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </Section>
    </aside>
  );
}
