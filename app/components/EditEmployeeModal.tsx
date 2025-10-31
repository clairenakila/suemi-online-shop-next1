"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface Role {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  role_id?: string;
  role_name?: string;
  contact_number?: string;
  sss_number?: string;
  philhealth_number?: string;
  pagibig_number?: string;
  hourly_rate?: string;
  daily_rate?: string;
  is_employee?: "Yes" | "No";
  is_live_seller?: "Yes" | "No";
}

interface FieldConfig {
  key: keyof User;
  label: string;
  type?: "text" | "number" | "float" | "select";
  options?: string[];
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  roles: Role[];
  selectedUsers: User[];
}

export default function EditUserModal({
  isOpen,
  onClose,
  onSuccess,
  roles,
  selectedUsers,
}: EditUserModalProps) {
  const [fieldsState, setFieldsState] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const fields: FieldConfig[] = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "contact_number", label: "Contact Number" },
    { key: "sss_number", label: "SSS Number" },
    { key: "philhealth_number", label: "PhilHealth Number" },
    { key: "pagibig_number", label: "Pagibig Number" },
    { key: "hourly_rate", label: "Hourly Rate", type: "float" },
    { key: "daily_rate", label: "Daily Rate", type: "float" },
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
      options: roles.map((r) => r.name),
    },
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updates: Partial<User> = { ...fieldsState };

      const res = await fetch("/api/employees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedUsers.map((u) => u.id),
          updates,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to update users");

      toast.success(data.message);
      setFieldsState({});
      onClose();
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Error updating users");
    } finally {
      setLoading(false);
    }
  };

  const renderField = (f: FieldConfig) => {
    if (f.type === "select") {
      return (
        <select
          className="form-select"
          value={
            f.key === "role_id"
              ? roles.find((r) => r.id === fieldsState.role_id)?.name || ""
              : (fieldsState[f.key] as string) || ""
          }
          onChange={(e) => {
            if (f.key === "role_id") {
              const selectedRole = roles.find((r) => r.name === e.target.value);
              setFieldsState({
                ...fieldsState,
                role_id: selectedRole ? selectedRole.id : undefined,
              });
            } else {
              setFieldsState({ ...fieldsState, [f.key]: e.target.value });
            }
          }}
        >
          <option value="">— Select —</option>
          {f.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type="text"
        className="form-control"
        placeholder={f.label}
        value={(fieldsState[f.key] as string) || ""}
        onChange={(e) =>
          setFieldsState({ ...fieldsState, [f.key]: e.target.value })
        }
      />
    );
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-light">
            <h5 className="modal-title">Edit Employees</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <form onSubmit={handleSave}>
            <div className="modal-body">
              <div className="row">
                {fields.map((f) => (
                  <div className="col-md-6 mb-3" key={f.key as string}>
                    <label className="form-label">{f.label}</label>
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
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-warning text-white"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
