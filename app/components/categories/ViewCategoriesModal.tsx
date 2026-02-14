"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export interface Category {
  id?: string;
  description: string;
  created_at?: string;
}

interface ViewCategoriesModalProps {
  isOpen: boolean;
  categoryId: string;
  onClose: () => void;
}

export default function ViewCategoriesModal({ 
  isOpen, 
  categoryId, 
  onClose 
}: ViewCategoriesModalProps) {
  const [category, setCategory] = useState<Category | null>(null);

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

  if (!isOpen || !category) return null;

  const displayFields: { label: string; value: any }[] = [
    { label: "Description", value: category.description },
    { label: "Created At", value: category.created_at },
  ];

  const formatValue = (val: any) => {
    if (!val) return "-";
    if (!isNaN(Date.parse(val))) {
      const date = new Date(val);
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const year = date.getFullYear().toString().slice(-2);
      return `${month}-${day}-${year}`;
    }
    return val;
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div
          className="modal-content"
          style={{ borderRadius: "8px" }}
        >
          <div className="modal-header bg-light">
            <h5 className="modal-title">View Category</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
            ></button>
          </div>

          <div
            className="modal-body"
            style={{ maxHeight: "70vh", overflowY: "auto" }}
          >
            <table className="table table-bordered mb-0">
              <tbody>
                {displayFields.map((field, idx) => (
                  <tr key={idx}>
                    {/* Label */}
                    <td
                      style={{
                        backgroundColor: "#f0f0f0",
                        fontWeight: 500,
                        width: "30%",
                        textAlign: "left",
                      }}
                    >
                      {field.label}
                    </td>
                    {/* Value */}
                    <td style={{ width: "70%", textAlign: "left" }}>
                      {formatValue(field.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}