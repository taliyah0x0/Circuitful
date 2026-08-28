import Modal from "../shared/Modal.jsx";
import "../workspace/HelpModal.css";

const GROUPS = [
  {
    title: "Canvas",
    rows: [
      ["Click background", "Add pin"],
      ["Click part", "Add pin"],
      ["Drag background", "Pan"],
      ["Drag part", "Move part (pins stay put)"],
      ["⌘/Ctrl + Scroll", "Zoom in / out"],
      ["Scroll", "Pan"],
    ],
  },
  {
    title: "Selected pin",
    rows: [
      ["Drag", "Move pin"],
      ["Arrow keys", "Nudge"],
      ["Backspace", "Delete pin"],
    ],
  },
];

export default function PartEditorHelpModal({ onClose }) {
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
