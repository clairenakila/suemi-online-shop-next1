"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react"; 
import toast from "react-hot-toast";
import Modal from "./Modal";

export default function ChangePasswordModal({ isOpen, onClose, user }: any) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // States para sa visibility
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

const handleUpdate = async () => {
  if (!newPassword || !confirmPassword)
    return toast.error("Please fill in all fields");
  if (newPassword !== confirmPassword)
    return toast.error("New passwords do not match!");

  setLoading(true);

  try {
    // 1. Siguraduhin na may active session
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      setLoading(false);
      return toast.error("Auth session missing! Please log in again.");
    }

    // 2. I-update ang password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      // Kung sasabihin niyang kailangan ng re-authentication, i-toast natin
      toast.error(updateError.message);
    } else {
      toast.success("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    }
  } catch (err) {
    toast.error("An unexpected error occurred.");
  } finally {
    setLoading(false);
  }
};

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Password">
      <div className="d-flex flex-column gap-3">
        
        {/* New Password Field - Seamless Design */}
        <div>
          <label className="form-label fw-medium text-dark small">New Password</label>
          <div className="input-group border rounded" style={{ overflow: 'hidden' }}>
            <input
              type={showNew ? "text" : "password"}
              className="form-control border-0 shadow-none"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              className="btn bg-white border-0"
              style={{ cursor: "pointer" }}
              type="button"
              onClick={() => setShowNew(!showNew)}
            >
              {showNew ? <EyeOff size={16} className="text-muted" /> : <Eye size={16} className="text-muted" />}
            </button>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="form-label fw-medium text-dark small">Confirm New Password</label>
          <div className="input-group border rounded" style={{ overflow: 'hidden' }}>
            <input
              type={showConfirm ? "text" : "password"}
              className="form-control border-0 shadow-none"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              className="btn bg-white border-0"
              style={{ cursor: "pointer" }}
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <EyeOff size={16} className="text-muted" /> : <Eye size={16} className="text-muted" />}
            </button>
          </div>
        </div>
      </div>

      {/* Buttons with Hover and Pointer */}
      <div className="d-flex justify-content-end gap-2 mt-4 pt-3 ">
        <button
          onClick={onClose}
          className="btn btn-light px-4 text-muted small"
          style={{
            borderRadius: "6px",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e2e6ea")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
        >
          Cancel
        </button>
        <button
          onClick={handleUpdate}
          disabled={loading}
          className="btn px-4 small"
          style={{
            backgroundColor: "#FFB6C1",
            color: "#333",
            borderRadius: "6px",
            fontWeight: "500",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            if(!loading) e.currentTarget.style.backgroundColor = "#ff9eb3";
          }}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FFB6C1")}
        >
          {loading ? "Processing..." : "Update Password"}
        </button>
      </div>
    </Modal>
  );
}