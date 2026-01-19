"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react"; // Mas malinis na icons
import toast from "react-hot-toast"; 
import Modal from "./Modal"; 

export default function ChangePasswordModal({ isOpen, onClose, user }: any) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // States para sa visibility ng bawat field
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleUpdate = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) return toast.error("Please fill in all fields");
    if (newPassword !== confirmPassword) return toast.error("New passwords do not match!");
    
    setLoading(true);
    // Verifying old password using sign-in logic
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email, 
      password: oldPassword,
    });

    if (signInError) {
      setLoading(false);
      return toast.error("Incorrect old password!");
    }

    // Updating to new hashed password
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

    if (updateError) {
      toast.error(updateError.message);
    } else {
      toast.success("Password updated successfully!");
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
      onClose();
    }
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Password">
      <div className="d-flex flex-column gap-3"> {/* Vertical spacing */}
        
        {/* Old Password */}
        <div>
          <label className="form-label fw-medium text-dark small">Old Password</label>
          <div className="input-group">
            <input 
              type={showOld ? "text" : "password"} 
              className="form-control shadow-sm" 
              placeholder="Enter old password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <button className="btn btn-outline-secondary border-0" type="button" onClick={() => setShowOld(!showOld)}>
              {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="form-label fw-medium text-dark small">New Password</label>
          <div className="input-group">
            <input 
              type={showNew ? "text" : "password"} 
              className="form-control shadow-sm" 
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button className="btn btn-outline-secondary border-0" type="button" onClick={() => setShowNew(!showNew)}>
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="form-label fw-medium text-dark small">Confirm New Password</label>
          <div className="input-group">
            <input 
              type={showConfirm ? "text" : "password"} 
              className="form-control shadow-sm" 
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button className="btn btn-outline-secondary border-0" type="button" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4 pt-3 ">
        <button onClick={onClose} className="btn btn-light px-4 text-muted small" style={{ borderRadius: '6px' }}>Cancel</button>
        <button 
          onClick={handleUpdate} 
          disabled={loading} 
          className="btn px-4 small" 
          style={{ backgroundColor: '#FFB6C1', color: '#333', borderRadius: '6px', fontWeight: '500' }}
        >
          {loading ? "Processing..." : "Update Password"}
        </button>
      </div>
    </Modal>
  );
}