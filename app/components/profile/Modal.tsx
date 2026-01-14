// components/modals/Modal.tsx

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Black overlay na may opacity
        zIndex: 1050, // Standard Bootstrap modal z-index
      }}
    >
      <div
        className="card shadow-lg border-0 w-100 mx-3"
        style={{ maxWidth: "600px" }}
      >
        {/* Header Part */}
        <div className="card-header bg-white d-flex justify-content-between align-items-center border-0 pt-4 px-4">
          <h5 className="mb-0 fw-medium text-dark">{title}</h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Close"
          ></button>
        </div>

        {/* Body Part */}
        <div className="card-body p-4">{children}</div>
      </div>
    </div>
  );
}
