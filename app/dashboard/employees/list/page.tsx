"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import toast, { Toaster } from "react-hot-toast";
import CreateEmployeeModal from "./CreateEmployeeModal";

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
  const [form, setForm] = useState<User>({
    name: "",
    email: "",
    password: "",
    role_id: "",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

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

  async function handleUserDelete(id: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) toast.error(`Failed to delete: ${error.message}`);
    else {
      toast.success("User deleted successfully");
      fetchUsers();
    }
  }

  return (
    <div className="container my-5">
      <Toaster />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Employees Management</h3>
        <button className="btn btn-primary" onClick={openAddModal}>
          Add Employee
        </button>
      </div>

      <div
        className="table-responsive"
        style={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        <table className="table table-bordered table-striped">
          <thead className="table-light sticky-top">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Password</th>
              <th>Role</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
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
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => user.id && handleUserDelete(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center">
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
