"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export interface Item {
  id?: string;
  timestamp?: string | null;
  prepared_by?: string;
  brand?: string;
  order_id?: string;
  shoppee_commission?: string;
  selling_price?: string;
  is_returned?: string;
  quantity?: string;
  live_seller?: string;
  capital?: string;
  order_income?: string;
  category?: string;
  mined_from?: string;
  discount?: string;
  commission_rate?: string; // new hidden field
  date_shipped?: string | null;
  date_returned?: string | null;
}

interface FieldConfig {
  key: keyof Item;
  label: string;
  type?: "text" | "number" | "float" | "select" | "date";
  options?: string[];
  validate?: (value: string) => string;
  required?: boolean;
}

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddItemModal({
  isOpen,
  onClose,
  onSuccess,
}: AddItemModalProps) {
  const [item, setItem] = useState<Item>({
    timestamp: new Date().toISOString(),
    mined_from: "",
    prepared_by: "",
    brand: "",
    quantity: "1",
    order_id: "",
    selling_price: "0",
    capital: "0",
    shoppee_commission: "0",
    discount: "0",
    order_income: "0",
    commission_rate: "0", // default 0
    live_seller: "",
    category: "",
    is_returned: "No",
    date_shipped: null,
    date_returned: null,
  });

  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>(
    []
  );
  const [liveSellers, setLiveSellers] = useState<
    { id: string; name: string }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: empData, error: empError } = await supabase
        .from("users")
        .select("id, name")
        .eq("is_employee", "Yes");
      if (empError) toast.error(empError.message);
      else setEmployees(empData || []);

      const { data: liveData, error: liveError } = await supabase
        .from("users")
        .select("id, name")
        .eq("is_live_seller", "Yes");
      if (liveError) toast.error(liveError.message);
      else setLiveSellers(liveData || []);
    };

    fetchData();
  }, []);

  const allFields: FieldConfig[] = [
    { key: "timestamp", label: "Timestamp*", type: "date" },
    {
      key: "mined_from",
      label: "Mined From",
      type: "select",
      options: ["Facebook", "Shoppee"],
      required: true,
    },
    {
      key: "prepared_by",
      label: "Prepared By",
      type: "select",
      options: employees.map((u) => u.name),
    },
    {
      key: "category",
      label: "Category",
      type: "select",
      options: ["Bag", "Shoes", "Watch", "Clothing", "Other"],
    },
    { key: "brand", label: "Brand", type: "text" },
    {
      key: "live_seller",
      label: "Live Seller",
      type: "select",
      options: liveSellers.map((u) => u.name),
    },
    {
      key: "order_id",
      label: "Order ID",
      type: "text",
      validate: (v) =>
        v.length === 4 ? "" : "Order ID must be exactly 4 characters",
    },
    { key: "quantity", label: "Quantity", type: "number" },
    { key: "selling_price", label: "Selling Price", type: "float" },
    { key: "capital", label: "Capital", type: "float" },
    { key: "shoppee_commission", label: "Shoppee Commission", type: "float" },
    { key: "discount", label: "Discount", type: "text" },
    {
      key: "is_returned",
      label: "Is Returned?",
      type: "select",
      options: ["No", "Yes"],
    },
    { key: "date_shipped", label: "Date Shipped", type: "date" },
    { key: "date_returned", label: "Date Returned", type: "date" },
    { key: "order_income", label: "Order Income", type: "text" },

    { key: "commission_rate", label: "Commission Rate", type: "text" }, // hidden
  ];

  const hiddenKeys: (keyof Item)[] = ["order_income", "commission_rate"];
  const visibleFields = allFields.filter((f) => !hiddenKeys.includes(f.key));
  const hiddenFields = allFields.filter((f) => hiddenKeys.includes(f.key));

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("items").insert([item]);
    setLoading(false);

    if (error) return toast.error(error.message);

    toast.success("Item added successfully!");
    setItem({
      timestamp: new Date().toISOString(),
      mined_from: "",
      prepared_by: "",
      brand: "",
      quantity: "1",
      order_id: "",
      selling_price: "0",
      capital: "0",
      shoppee_commission: "0",
      discount: "0",
      order_income: "0",
      commission_rate: "0",
      live_seller: "",
      category: "",
      is_returned: "No",
      date_shipped: null,
      date_returned: null,
    });
    onClose();
    onSuccess();
  };

  const renderField = (f: FieldConfig, readOnly = false) => {
    if (f.type === "select")
      return (
        <select
          className="form-select"
          value={item[f.key] || ""}
          onChange={(e) =>
            !readOnly && setItem({ ...item, [f.key]: e.target.value })
          }
          disabled={readOnly}
        >
          <option value="">— Select —</option>
          {f.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    if (f.type === "date")
      return (
        <DatePicker
          selected={item[f.key] ? new Date(item[f.key]!) : null}
          onChange={(date) =>
            !readOnly &&
            setItem({ ...item, [f.key]: date ? date.toISOString() : null })
          }
          showTimeSelect
          dateFormat="yyyy-MM-dd HH:mm"
          placeholderText={f.label}
          className="form-control"
          wrapperClassName="w-100"
          popperClassName="react-datepicker-popper"
          disabled={readOnly}
        />
      );
    return (
      <input
        type="text"
        className="form-control"
        placeholder={f.label}
        value={item[f.key] || ""}
        onChange={(e) =>
          !readOnly && setItem({ ...item, [f.key]: e.target.value })
        }
        readOnly={readOnly}
      />
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
            <h5 className="modal-title">Add New Item</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <form onSubmit={handleSave}>
            <div
              className="modal-body"
              style={{ maxHeight: "70vh", overflowY: "auto" }}
            >
              <div className="row">
                {visibleFields.map((f) => (
                  <div className="col-md-6 mb-3" key={f.key}>
                    <label className="form-label">{f.label}</label>
                    {renderField(f)}
                  </div>
                ))}

                {hiddenFields.length > 0 && (
                  <div className="col-12 mt-4">
                    <h6 className="text-muted mb-2">
                      Hidden Fields (Read-Only)
                    </h6>
                    <div className="row">
                      {hiddenFields.map((f) => (
                        <div className="col-md-6 mb-3" key={f.key}>
                          <label className="form-label">{f.label}</label>
                          {renderField(f, true)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                className="text-white shadow-md"
                style={{
                  backgroundColor: "#f59e0b",
                  borderRadius: "4px",
                  padding: "8px 16px",
                  fontWeight: 500,
                }}
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
