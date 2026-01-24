"use client";

import { useEffect, useState } from "react";
import Modal from "../../components/profile/Modal";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "@/lib/supabase"; // Make sure you have this configured

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
  const [loading, setLoading] = useState(false);

  // Initialize form when modal opens
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
        confirmButton: "text-dark px-4",
        cancelButton: "text-dark px-4",
        popup: "rounded-4",
      },
    });

    if (!result.isConfirmed) return;

    setLoading(true);

    toast.promise(
      (async () => {
        // Update Supabase users table
        const { data, error } = await supabase
          .from("users")
          .update({
            name: formData.name,
            email: formData.email,
            phone_number: formData.phone_number,
            address: formData.address,
          })
          .eq("id", user.id)
          .select()
          .single(); // return updated row

        if (error) throw error;

        // Update localStorage so Profile page updates immediately
        localStorage.setItem("user", JSON.stringify(data));

        setLoading(false);
        onClose();
        return "Profile updated successfully! 🚀";
      })(),
      {
        loading: "Saving changes...",
        success: (msg) => <b>{msg}</b>,
        error: (err) => <b>{err.message}</b>,
      },
    );
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
        <div className="row g-3">
          {/* Name */}
          <div className="col-md-6">
            <label className="form-label fw-medium text-dark">Name</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          {/* Email */}
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

          {/* Phone */}
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

          {/* Address */}
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

        {/* Buttons */}
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="btn px-4"
            style={{
              backgroundColor: "lightgrey",
              border: "none",
              borderRadius: "6px",
              color: "#333",
              transition: "all 0.3s ease",
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
            disabled={loading}
            className="btn text-black px-4"
            style={{
              backgroundColor: "#FFB6C1",
              border: "none",
              borderRadius: "6px",
              fontWeight: "500",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#ff9eb3";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 5px 15px rgba(255, 182, 193, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FFB6C1";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";
            }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </Modal>
    </>
  );
}
