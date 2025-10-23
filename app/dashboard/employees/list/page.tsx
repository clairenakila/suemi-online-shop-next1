"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "@/lib/supabase";

import CreateEmployeeModal from "./CreateEmployeeModal";
import SearchBar from "../../../components/SearchBar";
import ConfirmDelete from "../../../components/ConfirmDelete";
import { DataTable, Column } from "../../../components/DataTable";
import BulkEdit from "../../../components/BulkEdit";
import ExportButton from "../../../components/ExportButton";
import DateRangePicker from "../../../components/DateRangePicker";

interface User {
  id?: string;
  name: string;
  email: string;
  password: string;
  role_id: string;
  sss_number?: string;
  philhealth_number?: string;
  pagibig_number?: string;
  hourly_rate?: number;
  daily_rate?: number;
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
    role_id: "",
    sss_number: "",
    philhealth_number: "",
    pagibig_number: "",
    hourly_rate: 0,
    daily_rate: 0,
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
  }>({
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("users").select("*");
    if (error) return toast.error(error.message);
    setUsers(data || []);
  };

  const fetchRoles = async () => {
    const { data, error } = await supabase.from("roles").select("*");
    if (error) return toast.error(error.message);
    setRoles(data || []);
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

  // ✅ Converts numeric fields safely before insert/update
  const sanitizeUserData = (data: User) => {
    return {
      ...data,
      hourly_rate: data.hourly_rate ? Number(data.hourly_rate) : 0,
      daily_rate: data.daily_rate ? Number(data.daily_rate) : 0,
    };
  };

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

  const toggleSelectUser = (id: string) =>
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );

  const toggleSelectAll = (checked: boolean) =>
    setSelectedUsers(checked ? users.map((u) => u.id!) : []);

  // ✅ Filter logic
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const roleName =
      roles.find((r) => r.id === u.role_id)?.name.toLowerCase() || "";
    const matchesSearch =
      [
        u.name,
        u.email,
        u.sss_number,
        u.philhealth_number,
        u.pagibig_number,
      ].some((val) => val?.toLowerCase().includes(term)) ||
      roleName.includes(term);

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

  const columns: Column<User>[] = [
    {
      header: "Created At",
      accessor: (row: User) => {
        if (!row.created_at) return "";
        const date = new Date(row.created_at);
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const year = date.getFullYear();
        return `${month}-${day}-${year}`;
      },
    },
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "SSS Number", accessor: "sss_number" },
    { header: "PhilHealth Number", accessor: "philhealth_number" },
    { header: "Pagibig Number", accessor: "pagibig_number" },
    { header: "Hourly Rate", accessor: "hourly_rate" },
    { header: "Daily Rate", accessor: "daily_rate" },
    { header: "Employee?", accessor: "is_employee" },
    { header: "Live Seller?", accessor: "is_live_seller" },
    {
      header: "Role",
      accessor: (row: User) =>
        roles.find((r) => r.id === row.role_id)?.name || "",
    },
    {
      header: "Action",
      accessor: (row: User) => (
        <>
          <button
            className="btn btn-warning btn-sm me-2"
            onClick={() => handleUserEdit(row)}
          >
            Edit
          </button>
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
        </>
      ),
      center: true,
    },
  ];

  return (
    <div className="container my-5">
      <Toaster />
      <h3 className="mb-4">Employees Management</h3>

      {/* ✅ Unified Toolbar */}
      <div className="mb-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <button className="btn btn-rose" onClick={() => setShowModal(true)}>
            Add
          </button>

          <BulkEdit
            table="users"
            selectedIds={selectedUsers}
            onSuccess={fetchUsers}
            fields={[
              { key: "role_id", label: "Role ID" },
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
            ]}
          />

          <button className="btn btn-success">Import</button>

          <ExportButton
            data={filteredUsers}
            selectedIds={selectedUsers}
            filename="employees.csv"
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

        {/* 🔍 Search + Calendar aligned */}
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
        </div>
      </div>

      {/* 📅 Date Picker */}
      {showDatePicker && (
        <div className="bg-white p-3 shadow-md rounded-4 mb-3 w-fit">
          <DateRangePicker onChange={setDateRange} />
        </div>
      )}

      <DataTable
        data={filteredUsers}
        columns={columns}
        selectable
        selectedIds={selectedUsers}
        onToggleSelect={toggleSelectUser}
        onToggleSelectAll={toggleSelectAll}
        rowKey="id"
        defaultRecordsPerPage={50}
      />

      <CreateEmployeeModal
        show={showModal}
        onClose={closeModal}
        onSubmit={handleSubmit}
        userData={form}
        setUserData={setForm}
        roles={roles}
        isEdit={!!editId}
      />
    </div>
  );
}
