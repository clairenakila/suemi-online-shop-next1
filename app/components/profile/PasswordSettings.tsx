"use client";
import { useState } from "react";
import ChangePasswordModal from "../../components/profile/ChangePasswordModal";



export default function PasswordSettings() {
  const [isPassOpen, setIsPassOpen] = useState(false);
  return (
    <div>
      <h5 className="fw-bold mb-3 text-dark">Password Settings</h5>

      <div
        className="card position-relative"
        style={{
          borderRadius: 15,
          border: "none",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
          paddingBottom: "80px",
        }}
      >
        <div className="card-body p-4">
          <label className="form-label">Old Password</label>
          <input type="password" className="form-control mb-3" />

          <label className="form-label">New Password</label>
          <input type="password" className="form-control" />

          <button
            className="btn position-absolute" onClick={() => setIsPassOpen(true)}
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
      {/* Dito natin ilalagay yung Modal component */}
      <ChangePasswordModal 
        isOpen={isPassOpen} 
        onClose={() => setIsPassOpen(false)} 
      />
    </div>
  );
}
