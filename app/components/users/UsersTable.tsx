"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ItemTable from "../items/ItemTable";
import ViewUsersModal from "./ViewUsersModal";
import EditUsersModal from "./EditUsersModal";
import AddButton from "../AddButton";
import BulkEdit from "../BulkEdit";
import ImportButton from "../ImportButton";
import ExportButton from "../ExportButton";
import ConfirmDelete from "../ConfirmDelete";
import SearchBar from "../SearchBar";
import DateRangePicker from "../DateRangePicker";
import ToggleColumns from "../ToggleColumns";
import toast from "react-hot-toast";
import bcrypt from "bcryptjs";

interface User {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role_id: string;
  role_name?: string;
  phone_number?: string;
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

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [totalCount, setTotalCount] = useState(0);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState<{
    startDate: string | null;
    endDate: string | null;
  }>({ startDate: null, endDate: null });

  // Fetch roles first
  useEffect(() => {
    fetchRoles();
  }, []);

  // Fetch users when roles are loaded or filters change
  useEffect(() => {
    if (roles.length) fetchUsers();
  }, [roles, page, pageSize, searchTerm, dateRange]);

  const fetchRoles = async () => {
    const { data, error } = await supabase.from("roles").select("*");
    if (error) {
      toast.error(error.message);
      return;
    }
    setRoles(data || []);
  };

  const fetchUsers = async () => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("users")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    // Date filter
    if (dateRange.startDate && dateRange.endDate) {
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      end.setHours(23, 59, 59, 999);
      query = query
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = `%${searchTerm.trim()}%`;
      query = query.or(
        `name.ilike.${term},email.ilike.${term},phone_number.ilike.${term},sss_number.ilike.${term},philhealth_number.ilike.${term},pagibig_number.ilike.${term}`,
      );
    }

    const { data, count, error } = await query;

    if (error) {
      toast.error(error.message);
      return;
    }

    // Map role names
    const mapped = (data || []).map((u) => ({
      ...u,
      role_name: roles.find((r) => r.id === u.role_id)?.name || "",
    }));

    setUsers(mapped);
    setTotalCount(count || 0);
  };

  // Toggle individual checkbox
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id],
    );
  };

  // Toggle select all
  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(users.map((user) => String(user.id)));
    } else {
      setSelectedIds([]);
    }
  };

  // Define columns
  const columns = [
    {
      header: "Created At",
      accessor: (row: User) => {
        if (!row.created_at) return "";
        const date = new Date(row.created_at);
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
      },
    },
    {
      header: "Name",
      accessor: (row: User) => row.name || "-",
    },
    {
      header: "Email",
      accessor: (row: User) => row.email || "-",
    },
    {
      header: "Phone Number",
      accessor: (row: User) => row.phone_number || "-",
    },
    {
      header: "SSS Number",
      accessor: (row: User) => row.sss_number || "-",
    },
    {
      header: "PhilHealth Number",
      accessor: (row: User) => row.philhealth_number || "-",
    },
    {
      header: "Pagibig Number",
      accessor: (row: User) => row.pagibig_number || "-",
    },
    {
      header: "Hourly Rate",
      accessor: (row: User) => row.hourly_rate || "0",
    },
    {
      header: "Daily Rate",
      accessor: (row: User) => row.daily_rate || "0",
    },
    {
      header: "Is Employee",
      accessor: (row: User) => row.is_employee || "No",
    },
    {
      header: "Is Live Seller",
      accessor: (row: User) => row.is_live_seller || "No",
    },
    {
      header: "Role",
      accessor: (row: User) => row.role_name || "-",
    },
    {
      header: "Action",
      accessor: (row: User) => (
        <div className="d-flex gap-2 justify-content-center">
          {/* View Button */}
          <button
            className="btn btn-success"
            onClick={() => {
              setSelectedUserId(row.id!);
              setViewModalOpen(true);
            }}
          >
            View
          </button>

          {/* Edit Button */}
          <button
            className="btn btn-warning"
            onClick={() => {
              setSelectedUserId(row.id!);
              setEditModalOpen(true);
            }}
          >
            Edit
          </button>

          {/* Delete Button */}
          <button
            className="btn btn-danger"
            onClick={async () => {
              if (!confirm(`Delete user "${row.name}"?`)) return;

              const { error } = await supabase
                .from("users")
                .delete()
                .eq("id", row.id);

              if (error) {
                toast.error("Error deleting user");
                return;
              }

              toast.success("User deleted!");
              fetchUsers();
            }}
          >
            Delete
          </button>
        </div>
      ),
      center: true,
    },
  ];

  return (
    <div>
      {/* TOOLBAR */}
      <div className="mb-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div className="d-flex flex-wrap align-items-center gap-2">
          {/* Add Button */}
          <AddButton
            table="users"
            onSuccess={fetchUsers}
            fields={[
              { key: "name", label: "Name", type: "text" },
              { key: "email", label: "Email", type: "text" },
              { key: "phone_number", label: "Contact Number", type: "text" },
              { key: "password", label: "Password", type: "text" },
              { key: "sss_number", label: "SSS Number", type: "text" },
              {
                key: "philhealth_number",
                label: "PhilHealth Number",
                type: "text",
              },
              { key: "pagibig_number", label: "Pagibig Number", type: "text" },
              {
                key: "hourly_rate",
                label: "Hourly Rate",
                type: "float",
                defaultValue: 0,
              },
              {
                key: "daily_rate",
                label: "Daily Rate",
                type: "float",
                defaultValue: 0,
              },
              {
                key: "is_employee",
                label: "Is Employee?",
                type: "select",
                options: ["Yes", "No"],
              },
              {
                key: "is_live_seller",
                label: "Is Live Seller?",
                type: "select",
                options: ["Yes", "No"],
              },
              {
                key: "role_id",
                label: "Role",
                type: "select",
                options: roles.map((r) => ({ label: r.name, value: r.id })),
              },
            ]}
          />

          {/* Bulk Edit */}
          <BulkEdit
            table="users"
            selectedIds={selectedIds}
            onSuccess={fetchUsers}
            fields={[
              { key: "name", label: "Name", type: "text" },
              { key: "email", label: "Email", type: "text" },
              { key: "phone_number", label: "Contact Number", type: "text" },
              { key: "password", label: "Password", type: "text" },
              { key: "sss_number", label: "SSS Number", type: "text" },
              {
                key: "philhealth_number",
                label: "PhilHealth Number",
                type: "text",
              },
              { key: "pagibig_number", label: "Pagibig Number", type: "text" },
              { key: "hourly_rate", label: "Hourly Rate", type: "number" },
              { key: "daily_rate", label: "Daily Rate", type: "number" },
              {
                key: "is_employee",
                label: "Is Employee?",
                type: "select",
                options: ["Yes", "No"],
              },
              {
                key: "is_live_seller",
                label: "Is Live Seller?",
                type: "select",
                options: ["Yes", "No"],
              },
              {
                key: "role_id",
                label: "Role",
                type: "select",
                options: roles.map((r) => ({ label: r.name, value: r.id })),
              },
            ]}
          />
          {/* Import CSV */}
          <ImportButton
            table="users"
            headersMap={{
              Name: "name",
              Email: "email",
              "Phone Number": "phone_number",
              Password: "password",
              "SSS Number": "sss_number",
              "PhilHealth Number": "philhealth_number",
              "Pagibig Number": "pagibig_number",
              "Hourly Rate": "hourly_rate",
              "Daily Rate": "daily_rate",
              "Is Employee": "is_employee",
              "Is Live Seller": "is_live_seller",
            }}
            onSuccess={fetchUsers}
          />

          {/* Export */}
          <ExportButton
            data={users}
            filename="users.csv"
            headersMap={{
              "Created At": (row) => row.created_at || "",
              Name: "name",
              Email: "email",
              "Phone Number": "phone_number",
              "SSS Number": "sss_number",
              "PhilHealth Number": "philhealth_number",
              "Pagibig Number": "pagibig_number",
              "Hourly Rate": "hourly_rate",
              "Daily Rate": "daily_rate",
              "Is Employee": "is_employee",
              "Is Live Seller": "is_live_seller",
              Role: "role_name",
            }}
          />

          {/* Delete Selected */}
          <ConfirmDelete
            confirmMessage="Delete selected users?"
            onConfirm={async () => {
              if (!selectedIds.length) {
                toast.error("No users selected");
                return;
              }
              const { error } = await supabase
                .from("users")
                .delete()
                .in("id", selectedIds);
              if (error) {
                toast.error(error.message);
                return;
              }
              setSelectedIds([]);
              toast.success("Users deleted!");
              fetchUsers();
            }}
          >
            Delete Selected
          </ConfirmDelete>
        </div>

        {/* Right side: Search, Date, Toggle */}
        <div className="d-flex align-items-center gap-2">
          <SearchBar
            placeholder="Search users..."
            value={searchTerm}
            onChange={setSearchTerm}
            storageKey="users_search"
          />

          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="p-2 bg-light border rounded-3 shadow-sm"
            style={{ width: "42px", height: "42px" }}
            title="Filter by date"
          >
            <i className="bi bi-calendar3 fs-5 text-secondary"></i>
          </button>
        </div>
      </div>

      {/* Date Picker */}
      {showDatePicker && (
        <div className="bg-white p-3 shadow-md rounded-4 mb-3 w-fit">
          <DateRangePicker onChange={setDateRange} />
        </div>
      )}

      {/* Table */}
      <ItemTable
        data={users}
        columns={columns}
        rowKey="id"
        selectable={true}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {/* ✅ Uncomment these */}
      <ViewUsersModal
        isOpen={viewModalOpen}
        userId={selectedUserId}
        onClose={() => setViewModalOpen(false)}
      />

      <EditUsersModal
        isOpen={editModalOpen}
        userId={selectedUserId}
        onClose={() => setEditModalOpen(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
}
