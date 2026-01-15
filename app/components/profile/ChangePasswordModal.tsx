// components/profile/ChangePasswordModal.tsx
import Modal from "./Modal"; 

interface ChangePasswordProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Password">
      <div className="row g-3">
        <div className="col-12">
          <label className="form-label fw-medium text-dark">Old Password</label>
          <input type="password" className="form-control" placeholder="Enter old password" />
        </div>
        <div className="col-12">
          <label className="form-label fw-medium text-dark">New Password</label>
          <input type="password" className="form-control" placeholder="Enter new password" />
        </div>
        <div className="col-12">
          <label className="form-label fw-medium text-dark">Confirm New Password</label>
          <input type="password" className="form-control" placeholder="Confirm new password" />
        </div>
      </div>

      {/* Footer Buttons na may border-top at tamang kulay */}
      <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
        <button 
          onClick={onClose} 
          className="btn text-dark px-4"
          style={{ backgroundColor: 'lightgrey', border: 'none', fontSize: '0.9rem' }}
        >
          Cancel
        </button>
        <button 
          className="btn text-dark px-4"
          style={{ backgroundColor: '#FFB6C1', border: 'none', fontSize: '0.9rem' }}
        >
          Update Password
        </button>
      </div>
    </Modal>
  );
}