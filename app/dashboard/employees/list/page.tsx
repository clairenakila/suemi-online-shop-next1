"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "@/lib/supabase";

import CreateEmployeeModal from "./CreateEmployeeModal";
import SearchBar from "../../../components/SearchBar";
import ConfirmDelete from "../../../components/ConfirmDelete";
import { DataTable, Column } from "../../../components/DataTable";

interface User {
  id?: string;
  name: string;
  email: string;
  password: string;
  role_id: string;
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
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  const openAddModal = () => {
    setForm({ name: "", email: "", password: "", role_id: "" });
    setEditId(null);
    setShowModal(true);
  };

  const handleUserEdit = (user: User) => {
    setForm(user);
    setEditId(user.id || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm({ name: "", email: "", password: "", role_id: "" });
    setEditId(null);
  };

  const handleSubmit = async (userData: User) => {
    if (!userData.role_id) return toast.error("Please select a role");

    if (editId) {
      const { error } = await supabase
        .from("users")
        .update(userData)
        .eq("id", editId);
      if (error) return toast.error(error.message);
      toast.success("User updated successfully");
    } else {
      const { error } = await supabase.from("users").insert([userData]);
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

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const roleName =
      roles.find((r) => r.id === u.role_id)?.name.toLowerCase() || "";
    return (
      [u.name, u.email, u.password].some((val) =>
        val.toLowerCase().includes(term)
      ) || roleName.includes(term)
    );
  });

  const columns: Column<User>[] = [
    { header: "Name", accessor: "name" as keyof User },
    { header: "Email", accessor: "email" as keyof User },
    { header: "Password", accessor: "password" as keyof User },
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
  //pass this to datatable
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(2);

  return (
    <div className="container my-5">
      <Toaster />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Employees Management</h3>
      </div>

      <div className="mb-3 d-flex flex-column flex-md-row align-items-start align-items-md-center gap-2">
        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-rose" onClick={openAddModal}>
            Add
          </button>
          <button className="btn btn-rose">Import</button>
          <button className="btn btn-rose">Export</button>

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

        <div className="search-bar-container position-relative w-100">
          <SearchBar
            placeholder="Search employees..."
            value={searchTerm}
            onChange={setSearchTerm}
            options={users.map((u) => u.name)}
          />
        </div>
      </div>

      <DataTable
        data={filteredUsers}
        columns={columns}
        selectable
        selectedIds={selectedUsers}
        onToggleSelect={toggleSelectUser}
        onToggleSelectAll={toggleSelectAll}
        rowKey="id"
        defaultRecordsPerPage={2} // <--- set default limit here
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
