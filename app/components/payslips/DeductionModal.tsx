"use client";

import { useState, useEffect } from "react";

interface DeductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (deduction: { description: string; amount: number }) => void;
}

export default function DeductionModal({
  isOpen,
  onClose,
  onSave,
}: DeductionModalProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setDescription("");
      setAmount(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-3">
          <h5 className="mb-3">Add Deduction</h5>
          <div className="mb-2">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Amount</label>
            <input
              type="number"
              className="form-control"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
            />
          </div>
          <div className="d-flex justify-content-end gap-2 mt-3">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={() => {
                onSave({ description, amount });
                onClose();
              }}
            >
              Add Deduction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
