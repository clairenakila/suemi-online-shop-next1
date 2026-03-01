"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { validateRequired } from "../../utils/validator";

export interface Supplier {
  id?: string;
  created_at?: string;
  name?: string;
  phone_number?: string;
}

interface FieldConfig {
  key: keyof Supplier;
  label: string;
  type?: "text" | "number";
  validate?: (value: string) => string;
  required?: boolean;
}

interface EditSuppliersModalProps {
  isOpen: boolean;
  supplierId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditSuppliersModal({
  isOpen,
  supplierId,
  onClose,
  onSuccess,
}: EditSuppliersModalProps) {
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch supplier by ID
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchSupplier = async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("id", supplierId)
        .single();
      
      if (error) return toast.error(error.message);
      setSupplier(data);
    };
    
    fetchSupplier();
  }, [supplierId, isOpen]);

  const allFields: FieldConfig[] = [
    { 
      key: "name", 
      label: "Supplier Name", 
      type: "text", 
      required: true,
      validate: (v) => v.trim().length < 1 ? "Name is required" : "",
    },
    { 
      key: "phone_number", 
      label: "Contact Number", 
      type: "number", 
      required: true,
      validate: (v) => {
        if (!v) return "Contact number is required";
        if (v.length !== 11) return "Must be 11 digits";
        return "";
      },
    },
  ];

  if (!isOpen || !supplier) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    // Validate
    for (const field of allFields.filter((f) => f.required)) {
      const value = supplier[field.key] || "";
      const err = validateRequired(value as string, field.label);
      if (err) newErrors[field.key] = err;
    }
    
    for (const field of allFields.filter((f) => f.validate)) {
      const value = supplier[field.key] || "";
      const err = field.validate?.(value as string);
      if (err) newErrors[field.key] = err;
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) return;

    // Update
    const { error } = await supabase
      .from("suppliers")
      .update({
        name: supplier.name,
        phone_number: supplier.phone_number,
      })
      .eq("id", supplier.id!);

    if (error) return toast.error(error.message);

    toast.success("Supplier updated successfully!");
    onClose();
    onSuccess?.();
  };

  const renderField = (f: FieldConfig) => {
    const hasError = errors[f.key as string];
    const baseClass = `form-control ${hasError ? "is-invalid" : ""}`;

    return (
      <>
        <input
          type={f.type === "number" ? "number" : "text"}
          className={baseClass}
          placeholder={f.label}
          value={supplier[f.key] || ""}
          onChange={(e) =>
            setSupplier({ ...supplier, [f.key]: e.target.value })
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
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div
          className="modal-content overflow-hidden"
          style={{ borderRadius: "8px" }}
        >
          <div className="modal-header bg-light">
            <h5 className="modal-title">Edit Supplier</h5>
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
                  <div className="col-12 mb-3 d-flex flex-column" key={f.key}>
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