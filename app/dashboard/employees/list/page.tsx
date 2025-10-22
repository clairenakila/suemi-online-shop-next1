"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import toast, { Toaster } from "react-hot-toast";
import CreateEmployeeModal from "./CreateEmployeeModal";
import SearchBar from "../../../components/SearchBar";
import ConfirmDelete from "../../../components/ConfirmDelete";

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

  async function fetchUsers() {
    const { data, error } = await supabase.from("users").select("*");
    if (error) toast.error(`Failed to load users: ${error.message}`);
    else setUsers(data || []);
  }

  async function fetchRoles() {
    const { data, error } = await supabase.from("roles").select("*");
    if (error) toast.error(`Failed to load roles: ${error.message}`);
    else setRoles(data || []);
  }

  function openAddModal() {
    setForm({ name: "", email: "", password: "", role_id: "" });
    setEditId(null);
    setShowModal(true);
  }

  function handleUserEdit(user: User) {
    setForm(user);
    if (user.id) setEditId(user.id);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setForm({ name: "", email: "", password: "", role_id: "" });
    setEditId(null);
  }

  async function handleSubmit(userData: User) {
    if (!userData.role_id) return toast.error("Please select a role");

    if (editId) {
      const { error } = await supabase
        .from("users")
        .update(userData)
        .eq("id", editId);
      if (error) toast.error(`Failed to update: ${error.message}`);
      else {
        toast.success("User updated successfully");
        fetchUsers();
        closeModal();
      }
    } else {
      const { error } = await supabase.from("users").insert([userData]);
      if (error) toast.error(`Failed to create: ${error.message}`);
      else {
        toast.success("User added successfully");
        fetchUsers();
        closeModal();
      }
    }
  }

  function toggleSelectUser(id: string) {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        <div className="ms-md-auto mt-2 mt-md-0" style={{ minWidth: "200px" }}>
          <SearchBar
            placeholder="Search employees..."
            value={searchTerm}
            onChange={setSearchTerm}
            options={users.map((u) => u.name)}
          />
        </div>
      </div>

      <div
        className="table-responsive"
        style={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        <table className="table table-bordered table-striped">
          <thead className="table-light sticky-top">
            <tr>
              <th className="text-center">
                <input
                  type="checkbox"
                  checked={
                    selectedUsers.length === users.length && users.length > 0
                  }
                  onChange={(e) =>
                    setSelectedUsers(
                      e.target.checked ? users.map((u) => u.id!) : []
                    )
                  }
                />
              </th>
              <th>Name</th>
              <th>Email</th>
              <th>Password</th>
              <th>Role</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="align-middle">
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id!)}
                    onChange={() => toggleSelectUser(user.id!)}
                  />
                </td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.password}</td>
                <td>{roles.find((r) => r.id === user.role_id)?.name || ""}</td>
                <td className="text-center">
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => handleUserEdit(user)}
                  >
                    Edit
                  </button>

                  <ConfirmDelete
                    confirmMessage={`Are you sure you want to delete ${user.name}?`}
                    onConfirm={async () => {
                      const { error } = await supabase
                        .from("users")
                        .delete()
                        .eq("id", user.id!);
                      if (error) throw error;
                      fetchUsers();
                    }}
                  >
                    Delete
                  </ConfirmDelete>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center">
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
