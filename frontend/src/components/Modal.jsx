function Modal({ visible, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, variant }) {
  if (!visible) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{title}</h3>
        {message && <p className="modal-message">{message}</p>}
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onCancel}>
            {cancelLabel || "Cancel"}
          </button>
          <button className={`btn btn-${variant || "danger"}`} onClick={onConfirm}>
            {confirmLabel || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
