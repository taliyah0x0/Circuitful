import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PenTool, LayoutGrid, FolderInput, FileUp, Sun, Moon, ExternalLink, Keyboard } from "lucide-react";
import { getStoredTheme, toggleTheme } from "../lib/theme.js";
import { pickFile, readJSONFile } from "../lib/fileIO.js";
import "./Landing.css";

const PENDING_PART_IMPORT_KEY = "circuitful.pendingPartImport";

export default function Landing() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(getStoredTheme());
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleImportPart() {
    const file = await pickFile(".circuitpart.json,.json");
    if (!file) return;
    try {
      const data = await readJSONFile(file);
      if (!data.name || !Array.isArray(data.pins)) {
        throw new Error("Not a valid Circuitful part file");
      }
      // Hand off to the Part Editor to review/adjust before it's saved into
      // the library, rather than saving it sight-unseen.
      sessionStorage.setItem(PENDING_PART_IMPORT_KEY, JSON.stringify(data));
      navigate("/part-editor");
    } catch (err) {
      setToast(`Couldn't import that file: ${err.message}`);
    }
  }

  async function handleImportWorkspace() {
    const file = await pickFile(".circuitful.json,.json");
    if (!file) return;
    try {
      const data = await readJSONFile(file);
      if (!Array.isArray(data.objects)) {
        throw new Error("Not a valid Circuitful workspace file");
      }
      sessionStorage.setItem("circuitful.pendingImport", JSON.stringify(data));
      navigate("/workspace");
    } catch (err) {
      setToast(`Couldn't import that file: ${err.message}`);
    }
  }

  return (
    <div className="landing">
      <button
        className="landing-theme-toggle"
        onClick={() => setTheme(toggleTheme())}
        aria-label="Toggle dark mode"
        title="Toggle dark mode"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="landing-header">
        <div className="landing-logo">
          <img src="/favicon.png" alt="" />
          <h1 className="landing-title">Circuitful</h1>
        </div>
        <p className="landing-subtitle">
          A tool for drawing colorful, precise circuit diagrams — place parts, wire them up, and
          export a crisp image in seconds.
        </p>
      </div>

      <div className="landing-grid">
        <button
          className="landing-card"
          style={{ "--card-accent": "var(--accent-red)" }}
          onClick={() => navigate("/part-editor")}
        >
          <span className="landing-card-icon">
            <PenTool size={22} />
          </span>
          <h3>Prepare a New Object</h3>
          <p>Upload an image, drop pins on it, and save it straight into your parts library.</p>
          <span className="landing-card-spacer" />
          <span className="landing-card-cta">Open Part Editor →</span>
        </button>

        <button
          className="landing-card"
          style={{ "--card-accent": "var(--accent-yellow)" }}
          onClick={() => navigate("/workspace")}
        >
          <span className="landing-card-icon">
            <LayoutGrid size={22} />
          </span>
          <h3>Go to Workspace</h3>
          <p>Place parts, wire them together, and lay out your circuit diagram.</p>
          <span className="landing-card-spacer" />
          <span className="landing-card-cta">Open Workspace →</span>
        </button>

        <button
          className="landing-card"
          style={{ "--card-accent": "var(--accent-green)" }}
          onClick={handleImportPart}
        >
          <span className="landing-card-icon">
            <FolderInput size={22} />
          </span>
          <h3>Import Saved Part</h3>
          <p>Load a <code>.circuitpart.json</code> file someone shared with you into the Part Editor to review before saving.</p>
          <span className="landing-card-spacer" />
          <span className="landing-card-cta">Choose file →</span>
        </button>

        <button
          className="landing-card"
          style={{ "--card-accent": "var(--accent-blue)" }}
          onClick={handleImportWorkspace}
        >
          <span className="landing-card-icon">
            <FileUp size={22} />
          </span>
          <h3>Import Saved Workspace</h3>
          <p>Open a <code>.circuitful.json</code> diagram you saved earlier and keep editing.</p>
          <span className="landing-card-spacer" />
          <span className="landing-card-cta">Choose file →</span>
        </button>
      </div>

      <div className="landing-footer">
        <a href="https://github.com/taliyahhh/Circuitful" target="_blank" rel="noreferrer">
          <ExternalLink size={16} /> GitHub
        </a>
      </div>

      {toast && <div className="landing-toast">{toast}</div>}
    </div>
  );
}
