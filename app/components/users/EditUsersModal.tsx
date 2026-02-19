"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { validateRequired } from "../../utils/validator";

export interface User {
  id?: string;
  name: string;
  email: string;
  password?: string;
  phone_number?: string;
  sss_number?: string;
  philhealth_number?: string;
  pagibig_number?: string;
  hourly_rate?: string;
  daily_rate?: string;
  is_employee?: "Yes" | "No";
  is_live_seller?: "Yes" | "No";
  role_id: string;
}

interface Role {
  id: string;
  name: string;
}

interface FieldConfig {
  key: keyof User;
  label: string;
  type?: "text" | "number" | "select" | "email";
  options?: Array<string | { label: string; value: string }>;
  validate?: (value: string) => string;
  required?: boolean;
}

interface EditUsersModalProps {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditUsersModal({
  isOpen,
  userId,
  onClose,
  onSuccess,
}: EditUsersModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch roles
  useEffect(() => {
    const fetchRoles = async () => {
      const { data, error } = await supabase.from("roles").select("*");
      if (error) return toast.error(error.message);
      setRoles(data || []);
    };
    fetchRoles();
  }, []);

  // Fetch user by ID
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
    };
    
    fetchUser();
  }, [userId, isOpen]);

  const allFields: FieldConfig[] = [
    { 
      key: "name", 
      label: "Name", 
      type: "text", 
      required: true,
      validate: (v) => v.trim().length < 1 ? "Name is required" : "",
    },
    { 
      key: "email", 
      label: "Email", 
      type: "email", 
      required: true,
      validate: (v) => {
        if (!v.trim()) return "Email is required";
        if (!/\S+@\S+\.\S+/.test(v)) return "Invalid email format";
        return "";
      },
    },
    { 
      key: "phone_number", 
      label: "Phone Number", 
      type: "text",
    },
    { 
      key: "password", 
      label: "Password (leave empty to keep current)", 
      type: "text",
    },
    { 
      key: "sss_number", 
      label: "SSS Number", 
      type: "text",
    },
    { 
      key: "philhealth_number", 
      label: "PhilHealth Number", 
      type: "text",
    },
    { 
      key: "pagibig_number", 
      label: "Pagibig Number", 
      type: "text",
    },
    { 
      key: "hourly_rate", 
      label: "Hourly Rate", 
      type: "number",
    },
    { 
      key: "daily_rate", 
      label: "Daily Rate", 
      type: "number",
    },
    { 
      key: "is_employee", 
      label: "Is Employee?", 
      type: "select",
      options: ["Yes", "No"],
    },
    { 
      key: "is_live_seller", 
      label: "Is Live Seller?", 
      type: "select",
      options: ["Yes", "No"],
    },
    { 
      key: "role_id", 
      label: "Role", 
      type: "select",
      options: roles.map((r) => ({ label: r.name, value: r.id })),
      required: true,
    },
  ];

  if (!isOpen || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    // Validate required fields
    for (const field of allFields.filter((f) => f.required)) {
      const value = user[field.key] || "";
      const err = validateRequired(value as string, field.label);
      if (err) newErrors[field.key] = err;
    }
    
    // Validate with custom validators
    for (const field of allFields.filter((f) => f.validate)) {
      const value = user[field.key] || "";
      const err = field.validate?.(value as string);
      if (err) newErrors[field.key] = err;
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) return;

    // Prepare update data
    const updateData: any = {
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      sss_number: user.sss_number,
      philhealth_number: user.philhealth_number,
      pagibig_number: user.pagibig_number,
      hourly_rate: user.hourly_rate,
      daily_rate: user.daily_rate,
      is_employee: user.is_employee,
      is_live_seller: user.is_live_seller,
      role_id: user.role_id,
    };

    // Only include password if it was changed
    if (user.password && user.password.trim()) {
      // Hash password here if needed
      updateData.password = user.password;
    }

    // Update
    const { error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", user.id!);

    if (error) return toast.error(error.message);

    toast.success("User updated successfully!");
    onClose();
    onSuccess?.();
  };

  const renderField = (f: FieldConfig) => {
    const hasError = errors[f.key as string];
    const baseClass = `form-control ${hasError ? "is-invalid" : ""}`;

    if (f.type === "select") {
      return (
        <>
          <select
            className={`form-select ${hasError ? "is-invalid" : ""}`}
            value={user[f.key] || ""}
            onChange={(e) => setUser({ ...user, [f.key]: e.target.value })}
          >
            <option value="">— Select —</option>
            {f.options?.map((opt) => {
              if (typeof opt === "string") {
                return (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                );
              } else {
                return (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                );
              }
            })}
          </select>
          {hasError && <div className="invalid-feedback">{hasError}</div>}
        </>
      );
    }

    return (
      <>
        <input
          type={f.type === "number" ? "number" : f.type === "email" ? "email" : "text"}
          className={baseClass}
          placeholder={f.label}
          value={user[f.key] || ""}
          onChange={(e) =>
            setUser({ ...user, [f.key]: e.target.value })
          }
        />
        {hasError && <div className="invalid-feedback">{hasError}</div>}
      </>
    );
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div
          className="modal-content overflow-hidden"
          style={{ borderRadius: "8px" }}
        >
          <div className="modal-header bg-light">
            <h5 className="modal-title">Edit User</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          <form onSubmit={handleSave} noValidate>
            <div
              className="modal-body"
              style={{ maxHeight: "70vh", overflowY: "auto" }}
            >
              <div className="row">
                {allFields.map((f) => (
                  <div className="col-md-6 mb-3 d-flex flex-column" key={f.key}>
                    <label className="form-label text-start">{f.label}</label>
                    {renderField(f)}
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-white shadow-md"
                style={{
                  backgroundColor: "#f59e0b",
                  borderRadius: "4px",
                  padding: "8px 16px",
                  fontWeight: 500,
                }}
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}