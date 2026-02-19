"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export interface User {
  id?: string;
  name: string;
  email: string;
  phone_number?: string;
  sss_number?: string;
  philhealth_number?: string;
  pagibig_number?: string;
  hourly_rate?: string;
  daily_rate?: string;
  is_employee?: "Yes" | "No";
  is_live_seller?: "Yes" | "No";
  role_id: string;
  role_name?: string;
  created_at?: string;
}

interface ViewUsersModalProps {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
}

export default function ViewUsersModal({ 
  isOpen, 
  userId, 
  onClose 
}: ViewUsersModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [roleName, setRoleName] = useState<string>("");

  useEffect(() => {
    if (!isOpen) return;
    
    const fetchUser = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (error) return toast.error(error.message);
      
      setUser(data);
      
      // Fetch role name
      if (data.role_id) {
        const { data: roleData } = await supabase
          .from("roles")
          .select("name")
          .eq("id", data.role_id)
          .single();
        
        if (roleData) setRoleName(roleData.name);
      }
    };
    
    fetchUser();
  }, [userId, isOpen]);

  if (!isOpen || !user) return null;

  const displayFields: { label: string; value: any }[] = [
    { label: "Created At", value: user.created_at },
    { label: "Name", value: user.name },
    { label: "Email", value: user.email },
    { label: "Phone Number", value: user.phone_number },
    { label: "SSS Number", value: user.sss_number },
    { label: "PhilHealth Number", value: user.philhealth_number },
    { label: "Pagibig Number", value: user.pagibig_number },
    { label: "Hourly Rate", value: user.hourly_rate },
    { label: "Daily Rate", value: user.daily_rate },
    { label: "Is Employee", value: user.is_employee },
    { label: "Is Live Seller", value: user.is_live_seller },
    { label: "Role", value: roleName },
  ];

  const formatValue = (val: any) => {
    if (!val) return "-";
    if (!isNaN(Date.parse(val))) {
      const date = new Date(val);
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    }
    return val;
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div
          className="modal-content"
          style={{ borderRadius: "8px" }}
        >
          <div className="modal-header bg-light">
            <h5 className="modal-title">View User</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
            ></button>
          </div>

          <div
            className="modal-body"
            style={{ maxHeight: "70vh", overflowY: "auto" }}
          >
            <table className="table table-bordered mb-0">
              <tbody>
                {displayFields.map((field, idx) => (
                  <tr key={idx}>
                    <td
                      style={{
                        backgroundColor: "#f0f0f0",
                        fontWeight: 500,
                        width: "30%",
                        textAlign: "left",
                      }}
                    >
                      {field.label}
                    </td>
                    <td style={{ width: "70%", textAlign: "left" }}>
                      {formatValue(field.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}