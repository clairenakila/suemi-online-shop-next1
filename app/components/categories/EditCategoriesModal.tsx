"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { validateRequired } from "../../utils/validator";

export interface Category {
  id?: string;
  description: string;
  created_at?: string;
}

interface FieldConfig {
  key: keyof Category;
  label: string;
  type?: "text";
  validate?: (value: string) => string;
  required?: boolean;
}

interface EditCategoriesModalProps {
  isOpen: boolean;
  categoryId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditCategoriesModal({
  isOpen,
  categoryId,
  onClose,
  onSuccess,
}: EditCategoriesModalProps) {
  const [category, setCategory] = useState<Category | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch category by ID
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchCategory = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("id", categoryId)
        .single();
      
      if (error) return toast.error(error.message);
      setCategory(data);
    };
    
    fetchCategory();
  }, [categoryId, isOpen]);

  const allFields: FieldConfig[] = [
    { 
      key: "description", 
      label: "Description", 
      type: "text", 
      required: true,
      validate: (v) => v.trim().length < 1 ? "Description is required" : "",
    },
  ];

  if (!isOpen || !category) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    // Validate required fields
    for (const field of allFields.filter((f) => f.required)) {
      const value = category[field.key] || "";
      const err = validateRequired(value as string, field.label);
      if (err) newErrors[field.key] = err;
    }
    
    // Validate with custom validators
    for (const field of allFields.filter((f) => f.validate)) {
      const value = category[field.key] || "";
      const err = field.validate?.(value as string);
      if (err) newErrors[field.key] = err;
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) return;

    // Update in Supabase
    const { error } = await supabase
      .from("categories")
      .update({ description: category.description })
      .eq("id", category.id!);

    if (error) return toast.error(error.message);

    toast.success("Category updated successfully!");
    onClose();
    onSuccess?.();
  };

  const renderField = (f: FieldConfig) => {
    const hasError = errors[f.key as string];
    const baseClass = `form-control ${hasError ? "is-invalid" : ""}`;

    return (
      <>
        <input
          type="text"
          className={baseClass}
          placeholder={f.label}
          value={category[f.key] || ""}
          onChange={(e) =>
            setCategory({ ...category, [f.key]: e.target.value })
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
            <h5 className="modal-title">Edit Category</h5>
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