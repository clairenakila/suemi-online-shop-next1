// components/profile/EditProfileModal.tsx
import Modal from "../../components/profile/Modal";


export default function EditProfileModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      {/* Bootstrap Grid System */}
      <div className="row g-3"> 
        <div className="col-md-6">
          <label className="form-label fw-medium text-dark">Real Name</label>
          <input type="text" className="form-control" />
        </div>
        
        <div className="col-md-6">
          <label className="form-label fw-medium text-dark">Username</label>
          <input type="text" className="form-control" />
        </div>

        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label fw-medium text-dark">Email</label>
            <input type="email" className="form-control" />
          </div>
          <div>
            <label className="form-label fw-medium text-dark">Phone Number</label>
            <input type="text" className="form-control" />
          </div>
        </div>

        <div className="col-md-6">
          <label className="form-label fw-medium text-dark">Address</label>
          <textarea className="form-control" rows={4} style={{ height: 'calc(100% - 32px)' }} />
        </div>
      </div>

      {/* Footer Buttons gamit ang Bootstrap utilities */}
      <div className="d-flex justify-content-end gap-2 mt-4">
        <button 
          onClick={onClose} 
          className="btn btn-light px-4"
          style={{ backgroundColor: 'lightgrey', border: 'none' }}
        >
          Cancel
        </button>
        <button 
          className="btn text-black px-4"
          style={{ backgroundColor: '#FFB6C1', border: 'none' }}
        >
          Save
        </button>
      </div>
    </Modal>
  );
}