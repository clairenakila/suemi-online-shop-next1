"use client";
import { useState, useEffect } from "react";
import Modal from "../../components/profile/Modal";

interface EditProfileProps {
  isOpen: boolean;
  onClose: () => void;
  user: any; 
}

export default function EditProfileModal({ isOpen, onClose, user }: EditProfileProps) {
  // Local state para sa form inputs - ginamit ang 'name'
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    address: ""
  });

  // I-update ang form kapag nagbago ang user data o binuksan ang modal
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "", 
        email: user.email || "",
        phone_number: user.phone_number || "",
        address: user.address || ""
      });
    }
  }, [user, isOpen]);

  // Function para sa Save button na tatawag sa backend
  const handleSave = async () => {
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id, // Para sa .eq('id', id) ng Supabase
          ...formData
        }),
      });

      if (res.ok) {
        alert("Profile updated successfully!");
        onClose();
        window.location.reload(); // Para mag-refresh ang main display
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Update failed:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label fw-medium text-dark">Real Name</label>
          <input 
            type="text" 
            className="form-control" 
            value={formData.name} // Pinalitan mula nickname
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>
        
        <div className="col-md-6">
          <label className="form-label fw-medium text-dark">Email</label>
          <input 
            type="email" 
            className="form-control" 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label fw-medium text-dark">Phone Number</label>
          <input 
            type="text" 
            className="form-control" 
            value={formData.phone_number}
            onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label fw-medium text-dark">Address</label>
          <textarea 
            className="form-control" 
            rows={4} 
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
          />
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button onClick={onClose} className="btn btn-light px-4" style={{ backgroundColor: 'lightgrey', border: 'none' }}>Cancel</button>
        <button 
          onClick={handleSave}
          className="btn text-black px-4" 
          style={{ backgroundColor: '#FFB6C1', border: 'none' }}
        >
          Save Changes
        </button>
      </div>
    </Modal>
  );
}