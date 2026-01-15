"use client";
import { useState } from "react";
import EditProfileModal from "../../components/profile/EditProfileModal";

// 1. I-declare ang interface para sa user prop
interface ProfileSettingsProps {
  user: any;
}

// 2. Tanggapin ang { user } sa function arguments
export default function ProfileSettings({ user }: ProfileSettingsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <div>
      <h5 className="fw-bold mb-3 text-dark">Profile Settings</h5>
      <div className="card position-relative" style={{ borderRadius: 15, border: "none", boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }}>
        <div className="card-body p-3 pb-5">
          <div className="row g-4">
            <div className="col-md-6">
              <label className="form-label">Name</label>
              {/* Gamitin ang nickname base sa database mo */}
              <input className="form-control" value={user?.name || ""} readOnly />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input className="form-control" value={user?.email || ""} readOnly />
            </div>
            <div className="col-md-6 my-5">
              <label className="form-label">Phone Number</label>
              <input className="form-control" value={user?.phone_number || ""} readOnly />
            </div>
            <div className="col-md-6 my-5">
              <label className="form-label">Address</label>
              <textarea className="form-control" rows={4} value={user?.address || ""} readOnly />
            </div>
          </div>

          <button
            className="btn position-absolute" 
            onClick={() => setIsEditOpen(true)}
            style={{ bottom: 20, right: 20, backgroundColor: "#FFB6C1", border: "none", padding: "8px 24px", color: "#333", borderRadius: "6px" }}
          >
            Edit
          </button>
        </div>
      </div>

      {/* 3. Ipasa ang user sa Modal */}
      <EditProfileModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        user={user} // Dito nanggagaling ang error sa Line 63
      />
    </div>
  );
}