"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "@/lib/supabase";

import SearchBar from "../../../components/SearchBar";
import ConfirmDelete from "../../../components/ConfirmDelete";
import { DataTable, Column } from "../../../components/DataTable";
import DateRangePicker from "../../../components/DateRangePicker";
import AddEmployeeModal from "../../../components/AddEmployeeModal";
import EditEmployeeModal from "../../../components/EditEmployeeModal";
import ImportButton from "../../../components/ImportButton";
import ExportButton from "../../../components/ExportButton";
import ToggleColumns from "../../../components/ToggleColumns";

import bcrypt from "bcryptjs";

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role_id: string;
  role_name?: string;
  contact_number?: string;
  sss_number?: string;
  philhealth_number?: string;
  pagibig_number?: string;
  hourly_rate?: string;
  daily_rate?: string;
  is_employee?: "Yes" | "No";
  is_live_seller?: "Yes" | "No";
  created_at?: string;
}

interface Role {
  id: string;
  name: string;
}

export default function EmployeesListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState<{
    startDate: string | null;
    endDate: string | null;
  }>({ startDate: null, endDate: null });
  const [tableColumns, setTableColumns] = useState<Column<User>[]>([]);

  // Fetch roles and users
  useEffect(() => {
    fetchRoles();
  }, []);
  useEffect(() => {
    if (roles.length) fetchUsers();
  }, [roles]);

  const fetchRoles = async () => {
    const { data, error } = await supabase.from("roles").select("*");
    if (error) return toast.error(error.message);
    setRoles(data || []);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("users").select("*");
    if (error) return toast.error(error.message);
    const mapped = (data || []).map((u) => ({
      ...u,
      role_name: roles.find((r) => r.id === u.role_id)?.name || "",
    }));
    setUsers(mapped);
  };

  // Selected user objects for bulk edit
  const selectedUsers = users.filter((u) => selectedUserIds.includes(u.id!));

  // Table selection
  const toggleSelectUser = (id: string) =>
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );

  const toggleSelectAll = (checked: boolean) =>
    setSelectedUserIds(checked ? users.map((u) => u.id!) : []);

  // Filtering
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = [
      u.name,
      u.email,
      u.contact_number,
      u.sss_number,
      u.philhealth_number,
      u.pagibig_number,
      u.role_name,
    ].some((val) => val?.toLowerCase().includes(term));

    let matchesDateRange = true;
    if (dateRange.startDate && dateRange.endDate && u.created_at) {
      const created = new Date(u.created_at);
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      matchesDateRange = created >= start && created <= end;
    }

    return matchesSearch && matchesDateRange;
  });

  // Columns
  const columns: Column<User>[] = [
    {
      header: "Created At",
      accessor: (row) =>
        row.created_at ? new Date(row.created_at).toLocaleDateString() : "",
    },
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Contact Number", accessor: "contact_number" },
    { header: "SSS Number", accessor: "sss_number" },
    { header: "PhilHealth Number", accessor: "philhealth_number" },
    { header: "Pagibig Number", accessor: "pagibig_number" },
    { header: "Hourly Rate", accessor: "hourly_rate" },
    { header: "Daily Rate", accessor: "daily_rate" },
    { header: "Is Employee", accessor: "is_employee" },
    { header: "Is Live Seller", accessor: "is_live_seller" },
    { header: "Role", accessor: "role_name" },
    {
      header: "Action",
      accessor: (row) => (
        <ConfirmDelete
          confirmMessage={`Are you sure you want to delete ${row.name}?`}
          onConfirm={async () => {
            const { error } = await supabase
              .from("users")
              .delete()
              .eq("id", row.id!);
            if (error) throw error;
            fetchUsers();
          }}
        >
          Delete
        </ConfirmDelete>
      ),
      center: true,
    },
  ];

  useEffect(() => {
    setTableColumns(columns);
  }, [users]);

  return (
    <div className="container my-5">
      <Toaster />
      <h3 className="mb-4">Employees Management</h3>

      {/* Toolbar */}
      <div className="mb-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div className="d-flex flex-wrap align-items-center gap-2">
          {/* Add Employee */}
          <button
            className="btn btn-success"
            onClick={() => setShowAddModal(true)}
          >
            Add Employee
          </button>
          {showAddModal && (
            <AddEmployeeModal
              isOpen={showAddModal}
              onClose={() => setShowAddModal(false)}
              onSuccess={fetchUsers}
              roles={roles}
            />
          )}

          {/* Edit Employees */}
          <button
            className="btn btn-warning"
            onClick={() => {
              if (!selectedUserIds.length)
                return toast.error("Select at least one user");
              setShowEditModal(true);
            }}
          >
            Edit
          </button>
          {showEditModal && (
            <EditEmployeeModal
              isOpen={showEditModal}
              onClose={() => setShowEditModal(false)}
              onSuccess={fetchUsers}
              roles={roles}
              selectedUsers={selectedUsers} // bulk edit
            />
          )}

          {/* Import / Export
          <ImportButton
            table="users"
            headersMap={{
              Name: "name",
              Email: "email",
              "Contact Number": "contact_number",
              Password: "password",
              "Hourly Rate": "hourly_rate",
              "Daily Rate": "daily_rate",
              "SSS Number": "sss_number",
              "Pagibig Number": "pagibig_number",
              "Philhealth Number": "philhealth_number",
              "Is Live Seller": "is_live_seller",
              "Is Employee": "is_employee",
            }}
            transformRow={async (row) => {
              const get = (key: string) =>
                key in row && row[key] != null ? String(row[key]).trim() : "";
              const hourly = get("hourly_rate").replace(/,/g, "");
              const daily = get("daily_rate").replace(/,/g, "");
              const hashedPassword = await bcrypt.hash(
                get("password") || "default123",
                10
              );

              return {
                name: get("name") || undefined,
                email: get("email") || undefined,
                contact_number: get("contact_number") || undefined,
                sss_number: get("sss_number") || undefined,
                philhealth_number: get("philhealth_number") || undefined,
                pagibig_number: get("pagibig_number") || undefined,
                is_employee: get("is_employee") || undefined,
                is_live_seller: get("is_live_seller") || undefined,
                password: hashedPassword,
                hourly_rate:
                  hourly && !isNaN(Number(hourly))
                    ? Number(hourly).toFixed(2)
                    : "0.00",
                daily_rate:
                  daily && !isNaN(Number(daily))
                    ? Number(daily).toFixed(2)
                    : "0.00",
              };
            }}
            onSuccess={async () => {
              await fetchUsers();
              toast.success("✅ Users imported successfully");
            }}
          /> */}

          <ExportButton
            data={filteredUsers}
            headersMap={{
              "Created At": (row) => row.created_at || "",
              Name: "name",
              Email: "email",
              "Contact Number": "contact_number",
              "SSS Number": "sss_number",
              "PhilHealth Number": "philhealth_number",
              "Pagibig Number": "pagibig_number",
              "Hourly Rate": "hourly_rate",
              "Daily Rate": "daily_rate",
              "Is Employee": "is_employee",
              "Is Live Seller": "is_live_seller",
              Role: "role_name",
            }}
            filename="employees.xlsx"
          />

          {/* Delete Selected */}
          <ConfirmDelete
            confirmMessage="Are you sure you want to delete selected users?"
            onConfirm={async () => {
              if (!selectedUserIds.length) throw new Error("No users selected");
              const { error } = await supabase
                .from("users")
                .delete()
                .in("id", selectedUserIds);
              if (error) throw error;
              setSelectedUserIds([]);
              fetchUsers();
            }}
          >
            Delete Selected
          </ConfirmDelete>
        </div>

        {/* Search + Date filter + Columns toggle */}
        <div className="d-flex align-items-center gap-2">
          <SearchBar
            placeholder="Search employees..."
            value={searchTerm}
            onChange={setSearchTerm}
            options={users.map((u) => u.name)}
          />
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="p-2 bg-light border rounded-3 d-flex align-items-center justify-content-center shadow-sm"
            style={{ borderRadius: "12px", width: "42px", height: "42px" }}
            title="Filter by date created"
          >
            <i className="bi bi-calendar3 fs-5 text-secondary"></i>
          </button>
          <ToggleColumns columns={columns} onChange={setTableColumns} />
        </div>
      </div>

      {showDatePicker && (
        <div className="bg-white p-3 shadow-md rounded-4 mb-3 w-fit">
          <DateRangePicker onChange={setDateRange} />
        </div>
      )}

      <DataTable<User>
        data={filteredUsers}
        columns={tableColumns}
        selectable
        selectedIds={selectedUserIds}
        onToggleSelect={toggleSelectUser}
        onToggleSelectAll={toggleSelectAll}
        rowKey="id"
        page={1}
        pageSize={50}
        totalCount={filteredUsers.length}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
      />
    </div>
  );
}
