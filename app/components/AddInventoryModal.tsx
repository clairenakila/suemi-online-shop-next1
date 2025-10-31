"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { Category, Supplier, Inventory } from "../types/inventory";
import { calculateInventoryTotal } from "../utils/validator";

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  suppliers: Supplier[];
  categories: Category[];
}

export default function AddInventoryModal({
  isOpen,
  onClose,
  onSuccess,
  suppliers,
  categories,
}: AddInventoryModalProps) {
  const [inventory, setInventory] = useState<Inventory>({
    id: undefined,
    date_arrived: undefined,
    box_number: "",
    supplier: "",
    category: "",
    quantity: "0",
    price: "0",
  });
  const [date, setDate] = useState<Date | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const fields = [
    { key: "box_number", label: "Box Number", required: true, type: "text" },
    { key: "supplier", label: "Supplier", required: true, type: "select" },
    { key: "category", label: "Category", required: true, type: "select" },
    { key: "quantity", label: "Quantity", required: true, type: "float" },
    { key: "price", label: "Price", required: true, type: "float" },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    fields.forEach((f) => {
      const value = inventory[f.key as keyof Inventory];
      if (f.required && (!value || value === "")) {
        newErrors[f.key as string] = `${f.label} is required`;
      } else if (
        f.type === "float" &&
        (isNaN(Number(value)) || Number(value) < 0)
      ) {
        newErrors[f.key as string] = `${f.label} must be a number (0 or more)`;
      }
    });

    if (!date) newErrors.date_arrived = "Date Arrived is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const body: Inventory = {
        ...inventory,
        total: calculateInventoryTotal(
          inventory.quantity || "0",
          inventory.price || "0"
        ),
        date_arrived: date ? date.toLocaleDateString("sv-SE") : undefined,
      };

      const res = await fetch("/api/inventories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add inventory");

      toast.success(data.message || "Inventory added successfully!");

      // Reset form
      setInventory({
        id: undefined,
        date_arrived: undefined,
        box_number: "",
        supplier: "",
        category: "",
        quantity: "0",
        price: "0",
      });
      setDate(null);
      setErrors({});
      onClose();
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Error adding inventory");
    } finally {
      setLoading(false);
    }
  };

  const renderField = (f: (typeof fields)[0]) => {
    const hasError = errors[f.key as string];

    if (f.type === "select") {
      const options =
        f.key === "supplier"
          ? suppliers.map((s) => ({ id: s.id, label: s.name }))
          : categories.map((c) => ({ id: c.id, label: c.description }));

      return (
        <>
          <select
            className={`form-select ${hasError ? "is-invalid" : ""}`}
            value={inventory[f.key as keyof Inventory] || ""}
            onChange={(e) =>
              setInventory({
                ...inventory,
                [f.key]: e.target.value,
              })
            }
          >
            <option value="">— Select —</option>
            {options.map((opt) => (
              <option key={opt.id} value={opt.label}>
                {opt.label}
              </option>
            ))}
          </select>
          {hasError && <div className="invalid-feedback">{hasError}</div>}
        </>
      );
    }

    return (
      <>
        <input
          type="text"
          className={`form-control ${hasError ? "is-invalid" : ""}`}
          placeholder={f.label}
          value={inventory[f.key as keyof Inventory] || ""}
          onChange={(e) =>
            setInventory({
              ...inventory,
              [f.key]: e.target.value,
            })
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
        <div className="modal-content">
          <div className="modal-header bg-light">
            <h5 className="modal-title">Add Inventory</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <form onSubmit={handleSave}>
            <div className="modal-body">
              <div className="row">
                {fields.map((f) => (
                  <div className="col-md-6 mb-3" key={f.key}>
                    <label className="form-label">{f.label}</label>
                    {renderField(f)}
                  </div>
                ))}

                <div className="col-md-6 mb-3">
                  <label className="form-label">Date Arrived</label>
                  <DatePicker
                    selected={date}
                    onChange={(d) => setDate(d)}
                    className={`form-control ${
                      errors.date_arrived ? "is-invalid" : ""
                    }`}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select date"
                  />
                  {errors.date_arrived && (
                    <div className="invalid-feedback">
                      {errors.date_arrived}
                    </div>
                  )}
                </div>
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
