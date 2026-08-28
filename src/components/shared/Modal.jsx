import { useEffect } from "react";
import "./shared.css";

export default function Modal({ title, children, onClose, onConfirm, confirmLabel = "OK", cancelLabel = "Cancel", danger, hideFooter }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
      if (e.key === "Enter" && onConfirm) onConfirm();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onConfirm]);

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal">
        {title && <h3 className="modal-title">{title}</h3>}
        {children}
        {!hideFooter && (
          <div className="modal-actions">
            <button className="btn" onClick={onClose}>
              {cancelLabel}
            </button>
            {onConfirm && (
              <button className={`btn ${danger ? "btn--danger" : "btn--primary"}`} onClick={onConfirm}>
                {confirmLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
