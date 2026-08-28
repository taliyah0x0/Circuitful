import { useEffect, useMemo, useState } from "react";
import { Search, X, Upload, Trash2 } from "lucide-react";
import { usePartsLibrary } from "../../state/partsLibraryStore.js";
import { pickFile, readJSONFile } from "../../lib/fileIO.js";
import PartThumb from "../shared/PartThumb.jsx";
import "./PartsPalette.css";

const TABS = ["All", "Microcontrollers", "Electrical", "Modules", "Other"];

export default function PartsPalette({ onPlacePart }) {
  const builtin = usePartsLibrary((s) => s.builtin);
  const custom = usePartsLibrary((s) => s.custom);
  const saveCustomPart = usePartsLibrary((s) => s.saveCustomPart);
  const deleteCustomPart = usePartsLibrary((s) => s.deleteCustomPart);
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const parts = useMemo(() => [...custom, ...builtin], [builtin, custom]);

  const filtered = useMemo(() => {
    return parts.filter((p) => {
      const inTab = tab === "All" || p.category === tab;
      const inQuery = !query || p.name.toLowerCase().includes(query.toLowerCase());
      return inTab && inQuery;
    });
  }, [parts, tab, query]);

  async function handleImportPart() {
    const file = await pickFile(".circuitpart.json,.json");
    if (!file) return;
    try {
      const data = await readJSONFile(file);
      if (!data.name || !Array.isArray(data.pins)) {
        throw new Error("Not a valid Circuitful part file");
      }
      const saved = await saveCustomPart(data);
      setToast(`"${saved.name}" added to your parts library.`);
    } catch (err) {
      setToast(`Couldn't import that file: ${err.message}`);
    }
  }

  function handleDeleteCustomPart(e, part) {
    e.stopPropagation();
    if (!window.confirm(`Remove "${part.name}" from your parts library?`)) return;
    deleteCustomPart(part.id);
  }

  return (
    <aside className="palette">
      <div className="palette-header">
        <span>Parts</span>
        <button className="palette-import-btn" onClick={handleImportPart} title="Import a .circuitpart.json file">
          <Upload size={13} /> Import
        </button>
      </div>
      <div className="palette-search">
        <Search size={15} />
        <input placeholder="Search parts…" value={query} onChange={(e) => setQuery(e.target.value)} />
        {query && (
          <button className="palette-search-clear" onClick={() => setQuery("")}>
            <X size={13} />
          </button>
        )}
      </div>
      <div className="palette-tabs scrollable">
        {TABS.map((t) => (
          <button key={t} className={`palette-tab${tab === t ? " palette-tab--active" : ""}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      <div className="palette-grid scrollable">
        {filtered.map((part) => (
          <button
            key={part.id}
            type="button"
            className="palette-item"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/circuitful-part", part.id);
              e.dataTransfer.effectAllowed = "copy";
            }}
            onClick={() => onPlacePart?.(part.id)}
            aria-label={`Add ${part.name} to workspace`}
            title={`${part.name} — click to add, or drag onto the canvas`}
          >
            <PartThumb part={part} />
            <span>{part.name}</span>
            {part.isCustom && (
              <>
                <span className="palette-item-badge">mine</span>
                <span
                  className="palette-item-delete"
                  role="button"
                  tabIndex={0}
                  aria-label={`Remove ${part.name} from your library`}
                  title="Remove from your library"
                  onClick={(e) => handleDeleteCustomPart(e, part)}
                >
                  <Trash2 size={11} />
                </span>
              </>
            )}
          </button>
        ))}
        {filtered.length === 0 && <p className="palette-empty">No parts found.</p>}
      </div>
      {toast && <div className="palette-toast">{toast}</div>}
    </aside>
  );
}
