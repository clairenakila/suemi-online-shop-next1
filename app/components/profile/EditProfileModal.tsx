"use client";
import { useState, useEffect } from "react";
import Modal from "../../components/profile/Modal";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast"; // Import natin ang Toaster at toast

interface EditProfileProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  user,
}: EditProfileProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    address: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        address: user.address || "",
      });
    }
  }, [user, isOpen]);

  const handleSave = async () => {
    // 1. English Confirmation Dialog with Red/Grey scheme
    const result = await Swal.fire({
      title: "Confirm Changes?",
      text: "Are you sure you want to save these profile updates?",
      icon: "info",
      iconColor: "#FFB6C1",
      showCancelButton: true,
      confirmButtonColor: "#FFB6C1", 
      cancelButtonColor: "#D3D3D3", 
      confirmButtonText: "Yes, save it!",
      cancelButtonText: "No, cancel",
      reverseButtons: true, 
      
      customClass: {
        confirmButton: 'text-dark px-4', 
        cancelButton: 'text-dark px-4',
        popup: 'rounded-4'
      }
  
    });

    if (result.isConfirmed) {
      // 2. English Promise Toast for the update flow
      toast.promise(
        (async () => {
          const res = await fetch("/api/profile/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: user.id, // Targeting ID 332
              ...formData,
            }),
          });

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Update failed");
          }

          // Wait a bit so the user sees the success toast before the reload
          setTimeout(() => window.location.reload(), 1500);
          onClose();
          return "Profile updated successfully! 🚀";
        })(),
        {
          loading: "Saving changes...",
          success: (msg) => <b>{msg}</b>,
          error: (err) => <b>{err.message}</b>,
        },
      );
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
        <div className="row g-3" style={{cursor: "pointer"}}>
          <div className="col-md-6">
            <label className="form-label fw-medium text-dark">Real Name</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="col-md-6 ">
            <label className="form-label fw-medium text-dark">Email</label>
            <input
              type="email"
              className="form-control"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-medium text-dark">
              Phone Number
            </label>
            <input
              type="text"
              className="form-control"
              value={formData.phone_number}
              onChange={(e) =>
                setFormData({ ...formData, phone_number: e.target.value })
              }
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-medium text-dark">Address</label>
            <textarea
              className="form-control"
              rows={4}
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="btn px-4"
            style={{
              backgroundColor: "lightgrey",
              border: "none",
              borderRadius: "6px",
              transition: "all 0.3s ease", 
              color: "#333",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#d3d3d3"; 
              e.currentTarget.style.transform = "translateY(-2px)"; 
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "lightgrey"; 
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn text-black px-4"
            style={{
              backgroundColor: "#FFB6C1",
              border: "none",
              borderRadius: "6px",
              fontWeight: "500",
              transition: "all 0.3s ease", // Smooth animation
              boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#ff9eb3"; // Lighter pink
              e.currentTarget.style.transform = "translateY(-2px)"; // Subtle lift
              e.currentTarget.style.boxShadow =
                "0 5px 15px rgba(255, 182, 193, 0.4)"; // Pinkish glow
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FFB6C1"; // Reset color
              e.currentTarget.style.transform = "translateY(0)"; // Reset position
              e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)"; // Reset shadow
            }}
          >
            Save Changes
          </button>
        </div>
      </Modal>
    </>
  );
}
