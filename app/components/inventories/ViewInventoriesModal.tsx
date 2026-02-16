"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export interface Inventory {
  id?: string;
  created_at?: string;
  date_arrived?: string;
  box_number?: string;
  supplier?: string;
  quantity?: string;
}

interface ViewInventoriesModalProps {
  isOpen: boolean;
  inventoryId: string;
  onClose: () => void;
}

export default function ViewInventoriesModal({ 
  isOpen, 
  inventoryId, 
  onClose 
}: ViewInventoriesModalProps) {
  const [inventory, setInventory] = useState<Inventory | null>(null);

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

  if (!isOpen || !inventory) return null;

  const displayFields: { label: string; value: any }[] = [
    { label: "Date Arrived", value: inventory.date_arrived },
    { label: "Box Number", value: inventory.box_number },
    { label: "Supplier", value: inventory.supplier },
    { label: "Quantity", value: inventory.quantity },
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
            <h5 className="modal-title">View Inventory</h5>
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