"use client";

type Props = {
  show: boolean;
  onClose: () => void;
};

export default function EditProfileModal({ show, onClose }: Props) {
  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show" />

      <div className="modal fade show d-block" tabIndex={-1}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: 12 }}>
            <div className="modal-header">
              <h5 className="modal-title fw-semibold">Edit Profile</h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small text-muted">
                    Real Name
                  </label>
                  <input className="form-control form-control-sm" />
                </div>

                <div className="col-md-6">
                  <label className="form-label small text-muted">
                    Username
                  </label>
                  <input className="form-control form-control-sm" />
                </div>

                <div className="col-md-12">
                  <label className="form-label small text-muted">
                    Address
                  </label>
                  <textarea className="form-control form-control-sm" />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-sm btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="btn btn-sm"
                style={{ backgroundColor: "#FFB6C1" }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
