"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "@/lib/supabase";

import SearchBar from "../../../components/SearchBar";
import ConfirmDelete from "../../../components/ConfirmDelete";
import { DataTable, Column } from "../../../components/DataTable";
import BulkEdit from "../../../components/BulkEdit";
import DateRangePicker from "../../../components/DateRangePicker";
import AddButton from "../../../components/AddButton";
import ToggleColumns from "../../../components/ToggleColumns";
import ImportButton from "../../../components/ImportButton";
import ExportButton from "../../../components/ExportButton";
import { mapRoleNameToId, formatNumberForText } from "../../../utils/validator";

interface User {
  id?: string;
  name: string;
  email: string;
  password: string;
  role_id: string;
  role_name?: string;
  contact_number?: string; // ✅ added
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
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [form, setForm] = useState<User>({
    name: "",
    email: "",
    password: "",
    contact_number: "",
    role_id: "",
    sss_number: "",
    philhealth_number: "",
    pagibig_number: "",
    hourly_rate: "",
    daily_rate: "",
    is_employee: "Yes",
    is_live_seller: "No",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState<{
    startDate: string | null;
    endDate: string | null;
  }>({ startDate: null, endDate: null });

  // Fetch roles & users
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

  const handleUserEdit = (user: User) => {
    setForm(user);
    setEditId(user.id || null);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
  };

  const sanitizeUserData = (data: User) => ({
    ...data,
    hourly_rate: data.hourly_rate?.toString() || "0.00",
    daily_rate: data.daily_rate?.toString() || "0.00",
  });

  const handleSubmit = async (userData: User) => {
    if (!userData.role_id) return toast.error("Please select a role");
    const cleanData = sanitizeUserData(userData);

    if (editId) {
      const { error } = await supabase
        .from("users")
        .update(cleanData)
        .eq("id", editId);
      if (error) return toast.error(error.message);
      toast.success("User updated successfully");
    } else {
      const { error } = await supabase.from("users").insert([cleanData]);
      if (error) return toast.error(error.message);
      toast.success("User added successfully");
    }

    fetchUsers();
    closeModal();
  };

  // Selection
  const toggleSelectUser = (id: string) =>
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  const toggleSelectAll = (checked: boolean) =>
    setSelectedUsers(checked ? users.map((u) => u.id!) : []);

  // Filtering
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = [
      u.name,
      u.email,
      u.contact_number, // ✅ included
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
    { header: "Contact Number", accessor: "contact_number" }, // ✅ added
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

  const [tableColumns, setTableColumns] = useState<Column<User>[]>(columns);

  return (
    <div className="container my-5">
      <Toaster />
      <h3 className="mb-4">Employees Management</h3>

      {/* Toolbar */}
      <div className="mb-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <AddButton
            table="users"
            onSuccess={fetchUsers}
            fields={[
              { key: "name", label: "Name", type: "text" },
              { key: "email", label: "Email", type: "text" },
              { key: "contact_number", label: "Contact Number", type: "text" }, // ✅ added
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

          <BulkEdit
            table="users"
            selectedIds={selectedUsers}
            onSuccess={fetchUsers}
            fields={[
              { key: "name", label: "Name", type: "text" },
              { key: "email", label: "Email", type: "text" },
              { key: "contact_number", label: "Contact Number", type: "text" }, // ✅ added
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

          <ImportButton
            table="users"
            headersMap={{
              Name: "name",
              Email: "email",
              "Contact Number": "contact_number", // ✅ added
              Password: "password",
              "SSS Number": "sss_number",
              "PhilHealth Number": "philhealth_number",
              "Pagibig Number": "pagibig_number",
              "Hourly Rate": "hourly_rate",
              "Daily Rate": "daily_rate",
              "Is Employee": "is_employee",
              "Is Live Seller": "is_live_seller",
              Role: "role_id",
            }}
            transformRow={(row) => {
              const roleId = mapRoleNameToId(roles, row.role_id);
              if (!roleId) throw new Error(`Invalid role: ${row.role_id}`);
              return {
                ...row,
                role_id: roleId,
                hourly_rate: formatNumberForText(row.hourly_rate, 3),
                daily_rate: formatNumberForText(row.daily_rate, 3),
              };
            }}
            onSuccess={fetchUsers}
          />

          <ExportButton
            data={filteredUsers}
            headersMap={{
              "Created At": (row) => row.created_at || "",
              Name: "name",
              Email: "email",
              "Contact Number": "contact_number", // ✅ added
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

          <ConfirmDelete
            confirmMessage="Are you sure you want to delete selected users?"
            onConfirm={async () => {
              if (!selectedUsers.length) throw new Error("No users selected");
              const { error } = await supabase
                .from("users")
                .delete()
                .in("id", selectedUsers);
              if (error) throw error;
              setSelectedUsers([]);
              fetchUsers();
            }}
          >
            Delete Selected
          </ConfirmDelete>
        </div>

        {/* Search + Calendar */}
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

      <DataTable
        data={filteredUsers}
        columns={tableColumns}
        selectable
        selectedIds={selectedUsers}
        onToggleSelect={toggleSelectUser}
        onToggleSelectAll={toggleSelectAll}
        rowKey="id"
        defaultRecordsPerPage={50}
      />
    </div>
  );
}
