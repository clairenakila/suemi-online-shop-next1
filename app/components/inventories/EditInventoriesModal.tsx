"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { validateRequired } from "../../utils/validator";

export interface Inventory {
  id?: string;
  created_at?: string;
  date_arrived?: string;
  box_number?: string;
  supplier?: string;
  quantity?: string;
}

interface FieldConfig {
  key: keyof Inventory;
  label: string;
  type?: "text" | "number" | "date";
  validate?: (value: string) => string;
  required?: boolean;
}

interface EditInventoriesModalProps {
  isOpen: boolean;
  inventoryId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditInventoriesModal({
  isOpen,
  inventoryId,
  onClose,
  onSuccess,
}: EditInventoriesModalProps) {
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch inventory by ID
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchInventory = async () => {
      const { data, error } = await supabase
        .from("inventories")
        .select("*")
        .eq("id", inventoryId)
        .single();
      
      if (error) return toast.error(error.message);
      setInventory(data);
    };
    
    fetchInventory();
  }, [inventoryId, isOpen]);

  const allFields: FieldConfig[] = [
    { 
      key: "date_arrived", 
      label: "Date Arrived", 
      type: "date", 
      required: true 
    },
    { 
      key: "box_number", 
      label: "Box Number", 
      type: "text", 
      required: true,
      validate: (v) => v.trim().length < 1 ? "Box Number is required" : "",
    },
    { 
      key: "supplier", 
      label: "Supplier", 
      type: "text", 
      required: true,
      validate: (v) => v.trim().length < 1 ? "Supplier is required" : "",
    },
    { 
      key: "quantity", 
      label: "Quantity", 
      type: "number", 
      required: true,
      validate: (v) => !v || isNaN(Number(v)) || Number(v) < 1 ? "Quantity must be a number (1 or more)" : "",
    },
  ];

  if (!isOpen || !inventory) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    // Validate
    for (const field of allFields.filter((f) => f.required)) {
      const value = inventory[field.key] || "";
      const err = validateRequired(value as string, field.label);
      if (err) newErrors[field.key] = err;
    }
    
    for (const field of allFields.filter((f) => f.validate)) {
      const value = inventory[field.key] || "";
      const err = field.validate?.(value as string);
      if (err) newErrors[field.key] = err;
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) return;

    // Update
    const { error } = await supabase
      .from("inventories")
      .update({
        date_arrived: inventory.date_arrived,
        box_number: inventory.box_number,
        supplier: inventory.supplier,
        quantity: inventory.quantity,
      })
      .eq("id", inventory.id!);

    if (error) return toast.error(error.message);

    toast.success("Inventory updated successfully!");
    onClose();
    onSuccess?.();
  };

  const renderField = (f: FieldConfig) => {
    const hasError = errors[f.key as string];
    const baseClass = `form-control ${hasError ? "is-invalid" : ""}`;

    if (f.type === "date") {
      return (
        <>
          <DatePicker
            selected={inventory[f.key] ? new Date(inventory[f.key]!) : null}
            onChange={(date) =>
              setInventory({ ...inventory, [f.key]: date ? date.toISOString() : null })
            }
            dateFormat="yyyy-MM-dd"
            placeholderText={f.label}
            className={baseClass}
            wrapperClassName="w-100"
          />
          {hasError && <div className="invalid-feedback">{hasError}</div>}
        </>
      );
    }

    return (
      <>
        <input
          type={f.type === "number" ? "number" : "text"}
          className={baseClass}
          placeholder={f.label}
          value={inventory[f.key] || ""}
          onChange={(e) =>
            setInventory({ ...inventory, [f.key]: e.target.value })
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
            <h5 className="modal-title">Edit Inventory</h5>
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