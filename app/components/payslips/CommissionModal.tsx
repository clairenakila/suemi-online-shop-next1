"use client";

import { useState, useEffect } from "react";

interface CommissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (commission: {
    description: string;
    quantity: number;
    price: number;
    amount: number;
  }) => void;
}

export default function CommissionModal({
  isOpen,
  onClose,
  onSave,
}: CommissionModalProps) {
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setDescription("");
      setQuantity(0);
      setPrice(0);
    }
  }, [isOpen]);

  const totalAmount = quantity * price;

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-3">
          <h5 className="mb-3">Add Commission</h5>
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
            <label className="form-label">Quantity</label>
            <input
              type="number"
              className="form-control"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value))}
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Price</label>
            <input
              type="number"
              className="form-control"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value))}
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Amount</label>
            <input
              type="number"
              className="form-control"
              value={totalAmount}
              disabled
            />
          </div>
          <div className="d-flex justify-content-end gap-2 mt-3">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-success"
              onClick={() => {
                onSave({ description, quantity, price, amount: totalAmount });
                onClose();
              }}
            >
              Add Commission
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
