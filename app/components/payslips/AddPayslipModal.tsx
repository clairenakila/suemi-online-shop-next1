"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface AddPayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Employee {
  id: string;
  name: string;
  daily_rate: string | null;
  hourly_rate: string | null;
  selected: boolean;
}

interface Adjustment {
  type: "Bonus" | "Commission" | "Deduction";
  description: string;
  quantity?: number;
  price?: number;
  amount: number;
}

export default function AddPayslipModal({
  isOpen,
  onClose,
  onSuccess,
}: AddPayslipModalProps) {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const [daysWorked, setDaysWorked] = useState(0);
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [startPeriod, setStartPeriod] = useState<Date | null>(null);
  const [endPeriod, setEndPeriod] = useState<Date | null>(null);

  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);

  // Fetch employees
  useEffect(() => {
    if (!isOpen) return;

    const fetchEmployees = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, daily_rate, hourly_rate")
        .eq("is_employee", "Yes");

      if (error)
        return toast.error(error.message || "Failed to fetch employees");

      setEmployees(
        (data || []).map((u) => ({
          ...u,
          selected: false,
        })),
      );
    };

    fetchEmployees();
  }, [isOpen]);

  if (!isOpen) return null;

  // Toggle employee selection
  const toggleEmployee = (id: string) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, selected: !e.selected } : e)),
    );
  };

  const handleSelectAll = () => {
    const newValue = !selectAll;
    setSelectAll(newValue);
    setEmployees((prev) => prev.map((e) => ({ ...e, selected: newValue })));
  };

  // Add adjustment (Bonus, Commission, Deduction)
  const handleAdjustment = async (
    type: "Bonus" | "Commission" | "Deduction",
  ) => {
    let description = prompt(`Enter ${type} description:`) || "";
    if (!description.trim()) return;

    let amount = 0;
    let quantity = 1;
    let price = 0;

    if (type === "Commission") {
      quantity = parseFloat(prompt("Enter quantity:") || "1");
      price = parseFloat(prompt("Enter price:") || "0");
      amount = quantity * price;
    } else {
      amount = parseFloat(prompt(`Enter ${type} amount:`) || "0");
    }

    if (amount > 0) {
      setAdjustments((prev) => [
        ...prev,
        { type, description, amount, quantity, price },
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startPeriod || !endPeriod)
      return toast.error("Start and End period are required");

    const selectedEmployees = employees.filter((e) => e.selected);
    if (selectedEmployees.length === 0)
      return toast.error("Select at least one employee");

    setLoading(true);

    try {
      for (const emp of selectedEmployees) {
        const dailyRate = parseFloat(emp.daily_rate || "0");
        const hourlyRate = parseFloat(emp.hourly_rate || "0");

        const totalDailyPay = dailyRate * daysWorked;
        const totalOvertimePay = hourlyRate * overtimeHours;

        const grossPay =
          totalDailyPay +
          totalOvertimePay +
          adjustments
            .filter((a) => a.type === "Bonus" || a.type === "Commission")
            .reduce((acc, a) => acc + a.amount, 0);

        const totalDeduction = adjustments
          .filter((a) => a.type === "Deduction")
          .reduce((acc, a) => acc + a.amount, 0);

        const netPay = grossPay - totalDeduction;

        // Insert payroll
        const { data: payroll, error } = await supabase
          .from("payrolls")
          .insert([
            {
              user_id: emp.id,
              days_worked: daysWorked,
              overtime_hours: overtimeHours,
              daily_rate: dailyRate,
              hourly_rate: hourlyRate,
              total_daily_pay: totalDailyPay,
              total_overtime_pay: totalOvertimePay,
              gross_pay: grossPay,
              net_pay: netPay,
              start_period: startPeriod,
              end_period: endPeriod,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        // Save adjustments
        for (const adj of adjustments) {
          const { error: adjError } = await supabase
            .from("payroll_adjustments")
            .insert([
              {
                payroll_id: payroll.id,
                type: adj.type,
                description: adj.description,
                amount: adj.amount,
                quantity: adj.quantity,
                price: adj.price,
              },
            ]);
          if (adjError) throw adjError;
        }
      }

      toast.success("Payslips and adjustments added successfully");
      onSuccess();
      onClose();

      // Reset form
      setEmployees((prev) => prev.map((e) => ({ ...e, selected: false })));
      setSelectAll(false);
      setDaysWorked(0);
      setOvertimeHours(0);
      setAdjustments([]);
      setStartPeriod(null);
      setEndPeriod(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to add payslips");
    } finally {
      setLoading(false);
    }
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
            <h5 className="modal-title">Add Payslip</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div
              className="modal-body"
              style={{ maxHeight: "70vh", overflowY: "auto" }}
            >
              {/* Period */}
              <div className="row mb-3">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Start Period</label>
                  <DatePicker
                    selected={startPeriod}
                    onChange={(date) => setStartPeriod(date)}
                    className="form-control"
                    dateFormat="yyyy-MM-dd"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">End Period</label>
                  <DatePicker
                    selected={endPeriod}
                    onChange={(date) => setEndPeriod(date)}
                    className="form-control"
                    dateFormat="yyyy-MM-dd"
                  />
                </div>
              </div>

              {/* Payroll Fields */}
              <div className="row mb-3">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Days Worked</label>
                  <input
                    type="number"
                    className="form-control"
                    value={daysWorked || ""}
                    onChange={(e) => setDaysWorked(parseFloat(e.target.value))}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Overtime Hours</label>
                  <input
                    type="number"
                    className="form-control"
                    value={overtimeHours || ""}
                    onChange={(e) =>
                      setOvertimeHours(parseFloat(e.target.value))
                    }
                  />
                </div>
              </div>

              {/* Adjustments Buttons */}
              <div className="mb-3 d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={() => handleAdjustment("Bonus")}
                >
                  Add Bonus
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => handleAdjustment("Commission")}
                >
                  Add Commission
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleAdjustment("Deduction")}
                >
                  Add Deduction
                </button>
              </div>

              {/* Employees Table */}
              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "40px" }}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectAll}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Name</th>
                    <th>Daily Rate</th>
                    <th>Hourly Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => {
                    const dailyRate = parseFloat(emp.daily_rate || "0") || 0;
                    const hourlyRate = parseFloat(emp.hourly_rate || "0") || 0;
                    return (
                      <tr key={emp.id}>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={emp.selected}
                            onChange={() => toggleEmployee(emp.id)}
                          />
                        </td>
                        <td>{emp.name}</td>
                        <td>
                          {dailyRate.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td>
                          {hourlyRate.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Payslips"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
