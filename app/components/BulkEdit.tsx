"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

interface FieldConfig {
  key: string;
  label: string;
  type?: "text" | "number" | "select";
  options?: string[];
  placeholder?: string;
}

interface BulkEditProps {
  table: string;
  selectedIds: string[];
  fields: FieldConfig[];
  onSuccess: () => void;
}

export default function BulkEdit({
  table,
  selectedIds,
  fields,
  onSuccess,
}: BulkEditProps) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedIds.length) {
      toast.error("Please select at least one record.");
      return;
    }

    // Only include fields with values
    const updateData = Object.fromEntries(
      Object.entries(form).filter(([_, v]) => v !== "" && v !== undefined)
    );

    if (Object.keys(updateData).length === 0) {
      toast.error("No fields filled to update.");
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from(table)
      .update(updateData)
      .in("id", selectedIds);

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Bulk update successful!");
    setShow(false);
    setForm({});
    onSuccess();
  };

  return (
    <>
      <button
        className="btn btn-warning"
        onClick={() => {
          if (!selectedIds.length)
            return toast.error("Select records to edit first.");
          setShow(true);
        }}
      >
        Edit
      </button>

      {show && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-light">
                <h5 className="modal-title">Bulk Edit</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShow(false)}
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <p className="text-muted small">
                    Only filled fields will be updated for all selected records.
                  </p>

                  {fields.map((f) => (
                    <div className="mb-3" key={f.key}>
                      <label className="form-label">{f.label}</label>
                      {f.type === "select" ? (
                        <select
                          className="form-select"
                          value={form[f.key] || ""}
                          onChange={(e) =>
                            setForm({ ...form, [f.key]: e.target.value })
                          }
                        >
                          <option value="">— No Change —</option>
                          {f.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={f.type || "text"}
                          className="form-control"
                          placeholder={f.placeholder || ""}
                          value={form[f.key] || ""}
                          onChange={(e) =>
                            setForm({ ...form, [f.key]: e.target.value })
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShow(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-warning"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
