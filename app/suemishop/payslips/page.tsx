"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "@/lib/supabase";

import SearchBar from "../../components/SearchBar";
import ConfirmDelete from "../../components/ConfirmDelete";
import { DataTable, Column } from "../../components/DataTable";
import BulkEdit from "../../components/BulkEdit";
import DateRangePicker from "../../components/DateRangePicker";
import ToggleColumns from "../../components/ToggleColumns";
import ImportButton from "../../components/ImportButton";
import ExportButton from "../../components/ExportButton";
import AddPayrollModal from "../../components/payslips/AddPayslipModal";
import EditRowButton from "../../components/EditRowButton";
import EditPayrollModal from "../../components/payslips/EditPayslipModal";

interface Payslip {
  id?: string;
  created_at?: string;
  user_id?: string;
  user_name?: string;
  days_worked?: number;
  overtime_hours?: number;
  total_daily_pay?: number;
  total_overtime_pay?: number;
  daily_rate?: number;
  hourly_rate?: number;
  total_commission?: number;
  total_bonus?: number;
  total_deduction?: number;
  gross_pay?: number;
  net_pay?: number;
  start_period?: string;
  end_period?: string;
}

interface User {
  id: string;
  name: string;
  role?: { name: string };
}

export default function PayslipsPage() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [selectedPayslips, setSelectedPayslips] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState<{
    startDate: string | null;
    endDate: string | null;
  }>({
    startDate: null,
    endDate: null,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [tableColumns, setTableColumns] = useState<Column<Payslip>[]>([]);

  /** Fetch logged-in user */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me");
        const json = await res.json();
        setUser(json.user);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  /** Fetch payslips */
  useEffect(() => {
    if (user) fetchPayslips();
  }, [user, page, pageSize, searchTerm, dateRange]);

  const fetchPayslips = async () => {
    if (!user) return;

    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("payrolls")
        .select(
          `
          *,
          users(id, name)
        `,
          { count: "exact" },
        )
        .order("created_at", { ascending: false })
        .range(from, to);

      // If not superadmin, filter by their own ID
      if (user.role?.name !== "Superadmin") {
        query = query.eq("user_id", user.id);
      }

      if (dateRange.startDate && dateRange.endDate) {
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        end.setHours(23, 59, 59, 999);
        query = query
          .gte("created_at", start.toISOString())
          .lte("created_at", end.toISOString());
      }

      if (searchTerm.trim()) {
        query = query.ilike("users.name", `%${searchTerm.trim()}%`);
      }

      const { data, error, count } = await query;
      if (error)
        return toast.error(error.message || "Failed to fetch payslips");

      setPayslips(
        (data || []).map((row: any) => ({
          ...row,
          user_name: row.users?.name || "",
        })),
      );
      setTotalCount(count || 0);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch payslips");
    }
  };

  /** Build table columns */
  useEffect(() => {
    if (!user) return;

    const cols: Column<Payslip>[] = [
      { header: "Created At", accessor: (row) => row.created_at?.slice(0, 10) },
      { header: "Employee", accessor: "user_name" },
      { header: "Days Worked", accessor: "days_worked" },
      { header: "Overtime Hours", accessor: "overtime_hours" },
      { header: "Daily Rate", accessor: "daily_rate" },
      { header: "Hourly Rate", accessor: "hourly_rate" },
      { header: "Total Daily Pay", accessor: "total_daily_pay" },
      { header: "Total Overtime Pay", accessor: "total_overtime_pay" },
      { header: "Total Commission", accessor: "total_commission" },
      { header: "Total Bonus", accessor: "total_bonus" },
      { header: "Total Deduction", accessor: "total_deduction" },
      { header: "Gross Pay", accessor: "gross_pay" },
      { header: "Net Pay", accessor: "net_pay" },
    ];

    if (user.role?.name === "Superadmin") {
      cols.push({
        header: "Action",
        accessor: (row) => (
          <div className="flex gap-2 justify-center">
            <EditRowButton
              itemId={row.id!}
              ModalComponent={EditPayrollModal}
              onSuccess={fetchPayslips}
            />
            <ConfirmDelete
              confirmMessage={`Are you sure you want to delete payslip ${row.id}?`}
              onConfirm={async () => {
                const { error } = await supabase
                  .from("payrolls")
                  .delete()
                  .eq("id", row.id!);
                if (error) throw error;
                fetchPayslips();
              }}
            >
              Delete
            </ConfirmDelete>
          </div>
        ),
        center: true,
      });
    }

    setTableColumns(cols);
  }, [user]);

  const toggleSelectPayslip = (id: string) =>
    setSelectedPayslips((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const toggleSelectAll = (checked: boolean) =>
    setSelectedPayslips(checked ? payslips.map((i) => i.id!) : []);

  return (
    <div className="container my-5">
      <Toaster />
      <h3 className="mb-4">Payslips</h3>

      {/* Toolbar */}
      <div className="mb-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <button
            className="btn btn-success"
            onClick={() => setShowAddModal(true)}
          >
            Add Payslip
          </button>
          <AddPayrollModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSuccess={fetchPayslips}
          />

          {user?.role?.name === "Superadmin" && (
            <>
              <BulkEdit
                table="payrolls"
                selectedIds={selectedPayslips}
                onSuccess={fetchPayslips}
                columns={2}
                fields={[
                  { key: "days_worked", label: "Days Worked", type: "number" },
                  {
                    key: "overtime_hours",
                    label: "Overtime Hours",
                    type: "number",
                  },
                  { key: "daily_rate", label: "Daily Rate", type: "number" },
                  { key: "hourly_rate", label: "Hourly Rate", type: "number" },
                  { key: "total_bonus", label: "Bonus", type: "number" },
                  {
                    key: "total_commission",
                    label: "Commission",
                    type: "number",
                  },
                  {
                    key: "total_deduction",
                    label: "Deduction",
                    type: "number",
                  },
                ]}
              />
              <ImportButton
                table="payrolls"
                headersMap={{
                  "Created At": "created_at",
                  Employee: "user_id",
                  "Days Worked": "days_worked",
                  "Overtime Hours": "overtime_hours",
                  "Daily Rate": "daily_rate",
                  "Hourly Rate": "hourly_rate",
                  "Total Daily Pay": "total_daily_pay",
                  "Total Overtime Pay": "total_overtime_pay",
                  "Total Commission": "total_commission",
                  "Total Bonus": "total_bonus",
                  "Total Deduction": "total_deduction",
                  "Gross Pay": "gross_pay",
                  "Net Pay": "net_pay",
                }}
                onSuccess={fetchPayslips}
              />
              <ExportButton
                data={payslips}
                headersMap={{
                  "Created At": (row) => row.created_at || "",
                  Employee: "user_name",
                  "Days Worked": "days_worked",
                  "Overtime Hours": "overtime_hours",
                  "Daily Rate": "daily_rate",
                  "Hourly Rate": "hourly_rate",
                  "Total Daily Pay": "total_daily_pay",
                  "Total Overtime Pay": "total_overtime_pay",
                  "Total Commission": "total_commission",
                  "Total Bonus": "total_bonus",
                  "Total Deduction": "total_deduction",
                  "Gross Pay": "gross_pay",
                  "Net Pay": "net_pay",
                }}
                filename="payslips.csv"
              />
              <ConfirmDelete
                confirmMessage="Are you sure you want to delete selected payslips?"
                onConfirm={async () => {
                  if (!selectedPayslips.length)
                    throw new Error("No payslips selected");
                  const { error } = await supabase
                    .from("payrolls")
                    .delete()
                    .in("id", selectedPayslips);
                  if (error) throw error;
                  setSelectedPayslips([]);
                  fetchPayslips();
                }}
              >
                Delete Selected
              </ConfirmDelete>
            </>
          )}
        </div>

        <div className="d-flex align-items-center gap-2">
          <SearchBar
            placeholder="Search payslips..."
            value={searchTerm}
            onChange={setSearchTerm}
            options={[]}
            storageKey="payslips_search"
          />
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="p-2 bg-light border rounded-3 shadow-sm"
            style={{ borderRadius: "12px", width: "42px", height: "42px" }}
            title="Filter by date created"
          >
            <i className="bi bi-calendar3 fs-5 text-secondary"></i>
          </button>
          <ToggleColumns columns={tableColumns} onChange={setTableColumns} />
        </div>
      </div>

      {showDatePicker && (
        <div className="bg-white p-3 shadow-md rounded-4 mb-3 w-fit">
          <DateRangePicker onChange={setDateRange} />
        </div>
      )}

      <DataTable
        data={payslips}
        columns={tableColumns}
        selectable
        selectedIds={selectedPayslips}
        onToggleSelect={toggleSelectPayslip}
        onToggleSelectAll={toggleSelectAll}
        rowKey="id"
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
