"use client";
import { useState } from "react";
import EditProfileModal from "../../components/profile/EditProfileModal";

export default function ProfileSettings() {
  const [isEditOpen, setIsEditOpen] = useState(false);
  return (
    <div>
      <h5 className="fw-bold mb-3 text-dark">Profile Settings</h5>

      <div
        className="card position-relative"
        style={{
          borderRadius: 15,
          border: "none",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        }}
      >
        <div className="card-body p-3 pb-5">
          <div className="row g-4">
            <div className="col-md-6">
              <label className="form-label"> Name</label>
              <input className="form-control" />
            </div>

            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input className="form-control" />
            </div>
            <div className="col-md-6 my-5">
              <label className="form-label">Phone Number</label>
              <input className="form-control" />
            </div>
            <div className="col-md-6 my-5">
              <label className="form-label">Address</label>
              <textarea className="form-control" rows={4} />
            </div>
          </div>
          

          <button
            className="btn position-absolute" onClick={() => setIsEditOpen(true)} // I-trigger ang modal dito
            style={{
              bottom: 20,
              right: 20,
              backgroundColor: "#FFB6C1",
              border: "none",
              padding: "8px 24px",
              color: "#333",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#ff9eb3";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 6px 16px rgba(255, 182, 193, 0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FFB6C1";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
            }}
          >
            Edit
          </button>
        </div>
      </div>
      <EditProfileModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
      />
    </div>
  );
}
