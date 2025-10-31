"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { Category, Supplier, Inventory } from "../types/inventory";
import { calculateInventoryTotal } from "../utils/validator";

interface EditInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  suppliers: Supplier[];
  categories: Category[];
  inventoryIds: string[];
}

export default function EditInventoryModal({
  isOpen,
  onClose,
  onSuccess,
  suppliers,
  categories,
  inventoryIds,
}: EditInventoryModalProps) {
  const [inventory, setInventory] = useState<Partial<Inventory>>({});
  const [date, setDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const fields: {
    key: keyof Inventory;
    label: string;
    type: "text" | "float" | "select";
  }[] = [
    { key: "box_number", label: "Box Number", type: "text" },
    { key: "supplier", label: "Supplier", type: "select" },
    { key: "category", label: "Category", type: "select" },
    { key: "quantity", label: "Quantity", type: "float" },
    { key: "price", label: "Price", type: "float" },
  ];

  // Reset modal state when opened
  useEffect(() => {
    if (!isOpen) return;
    setInventory({});
    setDate(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updates: Partial<Inventory> = {};

      // Collect all non-empty values for bulk update
      fields.forEach((f) => {
        const value = inventory[f.key];
        if (value !== undefined && value !== null && value !== "") {
          updates[f.key] = value as string; // assert as string
        }
      });

      if (date) {
        updates.date_arrived = date.toLocaleDateString("sv-SE");
      }

      if (updates.quantity || updates.price) {
        updates.total = calculateInventoryTotal(
          updates.quantity?.toString() || inventory.quantity || "0",
          updates.price?.toString() || inventory.price || "0"
        );
      }

      const res = await fetch("/api/inventories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: inventoryIds, updates }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update inventory");

      toast.success(data.message || "Inventory updated successfully!");
      setInventory({});
      setDate(null);
      onClose();
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Error updating inventory");
    } finally {
      setLoading(false);
    }
  };

  const renderField = (f: (typeof fields)[0]) => {
    const value = inventory[f.key] ?? "";

    if (f.type === "select") {
      const options =
        f.key === "supplier"
          ? suppliers.map((s) => ({ id: s.id, label: s.name }))
          : categories.map((c) => ({ id: c.id, label: c.description }));

      return (
        <select
          className="form-select"
          value={value}
          onChange={(e) =>
            setInventory({ ...inventory, [f.key]: e.target.value })
          }
        >
          <option value="">— Select —</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.label}>
              {opt.label}
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
        value={value}
        onChange={(e) =>
          setInventory({ ...inventory, [f.key]: e.target.value })
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
            <h5 className="modal-title">Edit Inventory (Bulk)</h5>
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
                    className="form-control"
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select date"
                  />
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
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
