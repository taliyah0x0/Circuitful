import Modal from "../shared/Modal.jsx";
import "./HelpModal.css";

const GROUPS = [
  {
    title: "General",
    rows: [
      ["S", "Save workspace"],
      ["Z", "Undo"],
      ["X", "Redo"],
      ["C", "Toggle pen mode"],
      ["⌘/Ctrl + Scroll", "Zoom in / out"],
      ["Scroll", "Pan"],
      ["Alt + Drag", "Pan"],
      ["Drag empty canvas", "Box-select"],
      ["Shift + Click", "Add/remove from selection"],
      ["Escape", "Clear selection"],
    ],
  },
  {
    title: "Selected object",
    rows: [
      ["Arrow keys", "Nudge"],
      ["Shift + ← / →", "Rotate 90°"],
      ["Shift + ↑", "Bring to front"],
      ["Shift + ↓", "Send to back"],
      ["D", "Duplicate"],
      ["Backspace", "Delete"],
    ],
  },
  {
    title: "Selected wire",
    rows: [
      ["0–9", "Set preset color"],
      ["W", "Add node at midpoint"],
      ["Backspace", "Delete wire"],
    ],
  },
];

export default function HelpModal({ onClose }) {
  return (
    <Modal title="Keyboard shortcuts" onClose={onClose} hideFooter>
      <div className="help-grid">
        {GROUPS.map((group) => (
          <div key={group.title} className="help-group">
            <h4>{group.title}</h4>
            {group.rows.map(([key, desc]) => (
              <div className="help-row" key={key}>
                <kbd>{key}</kbd>
                <span>{desc}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="modal-actions">
        <button className="btn btn--primary" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
}
