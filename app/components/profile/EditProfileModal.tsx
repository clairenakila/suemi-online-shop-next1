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
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d33", // Red for Confirm
      cancelButtonColor: "#D3D3D3", // Light Grey for Cancel
      confirmButtonText: "Yes, save it!",
      cancelButtonText: "No, cancel",
      reverseButtons: true, // Standard UI: Positive action on the right
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
        }
      );
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
        <div className="row g-3">
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

          <div className="col-md-6">
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
            className="btn btn-light px-4"
            style={{ backgroundColor: "lightgrey", border: "none" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn text-black px-4"
            style={{ backgroundColor: "#FFB6C1", border: "none" }}
          >
            Save Changes
          </button>
        </div>
      </Modal>
    </>
  );
}
