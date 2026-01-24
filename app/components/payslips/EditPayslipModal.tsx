"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

interface EditPayslipModalProps {
  isOpen?: boolean; // optional
  itemId: string;
  onClose: () => void;
  onSuccess?: () => void; // optional now
}

export default function EditPayslipModal({
  isOpen = true,
  itemId,
  onClose,
  onSuccess = () => {}, // default no-op
}: EditPayslipModalProps) {
  const [payslip, setPayslip] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPayslip = async () => {
      const { data, error } = await supabase
        .from("payrolls")
        .select("*")
        .eq("id", itemId)
        .single();
      if (error) return toast.error(error.message || "Failed to load payslip");
      setPayslip(data);
    };
    if (itemId) fetchPayslip();
  }, [itemId]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const totalDailyPay = payslip.daily_rate * payslip.days_worked;
      const totalOvertimePay = payslip.hourly_rate * payslip.overtime_hours;
      const grossPay =
        totalDailyPay +
        totalOvertimePay +
        (payslip.total_bonus || 0) +
        (payslip.total_commission || 0);
      const netPay = grossPay - (payslip.total_deduction || 0);

      const { error } = await supabase
        .from("payrolls")
        .update({
          user_id: payslip.user_id,
          days_worked: payslip.days_worked,
          overtime_hours: payslip.overtime_hours,
          daily_rate: payslip.daily_rate,
          hourly_rate: payslip.hourly_rate,
          total_daily_pay: totalDailyPay,
          total_overtime_pay: totalOvertimePay,
          total_bonus: payslip.total_bonus,
          total_commission: payslip.total_commission,
          total_deduction: payslip.total_deduction,
          gross_pay: grossPay,
          net_pay: netPay,
        })
        .eq("id", itemId);
      if (error) throw error;
      toast.success("Payslip updated successfully");
      onSuccess(); // safe to call now
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to update payslip");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white rounded-3 p-5 w-full max-w-md">
        <h3 className="mb-4">Edit Payslip</h3>
        <div className="flex flex-col gap-3">
          <input
            className="form-control"
            placeholder="User ID"
            value={payslip.user_id || ""}
            onChange={(e) =>
              setPayslip({ ...payslip, user_id: e.target.value })
            }
          />
          <input
            type="number"
            className="form-control"
            placeholder="Days Worked"
            value={payslip.days_worked || 0}
            onChange={(e) =>
              setPayslip({
                ...payslip,
                days_worked: parseFloat(e.target.value),
              })
            }
          />
          <input
            type="number"
            className="form-control"
            placeholder="Overtime Hours"
            value={payslip.overtime_hours || 0}
            onChange={(e) =>
              setPayslip({
                ...payslip,
                overtime_hours: parseFloat(e.target.value),
              })
            }
          />
          <input
            type="number"
            className="form-control"
            placeholder="Daily Rate"
            value={payslip.daily_rate || 0}
            onChange={(e) =>
              setPayslip({ ...payslip, daily_rate: parseFloat(e.target.value) })
            }
          />
          <input
            type="number"
            className="form-control"
            placeholder="Hourly Rate"
            value={payslip.hourly_rate || 0}
            onChange={(e) =>
              setPayslip({
                ...payslip,
                hourly_rate: parseFloat(e.target.value),
              })
            }
          />
          <input
            type="number"
            className="form-control"
            placeholder="Bonus"
            value={payslip.total_bonus || 0}
            onChange={(e) =>
              setPayslip({
                ...payslip,
                total_bonus: parseFloat(e.target.value),
              })
            }
          />
          <input
            type="number"
            className="form-control"
            placeholder="Commission"
            value={payslip.total_commission || 0}
            onChange={(e) =>
              setPayslip({
                ...payslip,
                total_commission: parseFloat(e.target.value),
              })
            }
          />
          <input
            type="number"
            className="form-control"
            placeholder="Deduction"
            value={payslip.total_deduction || 0}
            onChange={(e) =>
              setPayslip({
                ...payslip,
                total_deduction: parseFloat(e.target.value),
              })
            }
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
