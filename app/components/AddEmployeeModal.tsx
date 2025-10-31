"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface Role {
  id: string;
  name: string;
}

export interface Employee {
  name: string;
  email: string;
  password: string;
  role_id: string;
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
  key: keyof Employee;
  label: string;
  type?: "text" | "number" | "float" | "select" | "password";
  options?: string[];
  required?: boolean;
}

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  roles: Role[];
}

export default function AddEmployeeModal({
  isOpen,
  onClose,
  onSuccess,
  roles,
}: AddEmployeeModalProps) {
  const [employee, setEmployee] = useState<Employee>({
    name: "",
    email: "",
    password: "",
    role_id: "",
    contact_number: "",
    sss_number: "",
    philhealth_number: "",
    pagibig_number: "",
    hourly_rate: "0.00",
    daily_rate: "0.00",
    is_employee: "Yes",
    is_live_seller: "No",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const fields: FieldConfig[] = [
    { key: "name", label: "Name", required: true },
    { key: "email", label: "Email", required: true },
    { key: "password", label: "Password", type: "password", required: true },
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
      options: roles.map((r) => r.name), // display names
      required: true,
    },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.required && !employee[f.key]) {
        newErrors[f.key as string] = `${f.label} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employee),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add employee");

      toast.success(data.message);

      setEmployee({
        name: "",
        email: "",
        password: "",
        role_id: "",
        contact_number: "",
        sss_number: "",
        philhealth_number: "",
        pagibig_number: "",
        hourly_rate: "0.00",
        daily_rate: "0.00",
        is_employee: "Yes",
        is_live_seller: "No",
      });
      setErrors({});
      onClose();
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Error adding employee");
    } finally {
      setLoading(false);
    }
  };

  const renderField = (f: FieldConfig) => {
    const hasError = errors[f.key as string];

    if (f.type === "select") {
      return (
        <>
          <select
            className={`form-select ${hasError ? "is-invalid" : ""}`}
            value={
              f.key === "role_id"
                ? roles.find((r) => r.id === employee.role_id)?.name || ""
                : employee[f.key] || ""
            }
            onChange={(e) => {
              if (f.key === "role_id") {
                const selectedRole = roles.find(
                  (r) => r.name === e.target.value
                );
                setEmployee({
                  ...employee,
                  role_id: selectedRole ? selectedRole.id : "",
                });
              } else {
                setEmployee({ ...employee, [f.key]: e.target.value });
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
          {hasError && <div className="invalid-feedback">{hasError}</div>}
        </>
      );
    }

    return (
      <div className="position-relative">
        <input
          type={
            f.type === "password"
              ? showPassword
                ? "text"
                : "password"
              : "text"
          }
          className={`form-control ${hasError ? "is-invalid" : ""}`}
          placeholder={f.label}
          value={employee[f.key] || ""}
          onChange={(e) =>
            setEmployee({ ...employee, [f.key]: e.target.value })
          }
        />
        {f.type === "password" && (
          <span
            className="position-absolute top-50 end-0 translate-middle-y me-2"
            style={{ cursor: "pointer" }}
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? "Hide" : "Show"}
          </span>
        )}
        {hasError && <div className="invalid-feedback">{hasError}</div>}
      </div>
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
            <h5 className="modal-title">Add Employee</h5>
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
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
