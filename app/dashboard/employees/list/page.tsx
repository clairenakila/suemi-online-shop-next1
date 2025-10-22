"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import toast, { Toaster } from "react-hot-toast";

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

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.role_id) return toast.error("Please select a role");

    if (editId) {
      const { error } = await supabase
        .from("users")
        .update(form)
        .eq("id", editId);
      if (error) toast.error(`Failed to update: ${error.message}`);
      else {
        toast.success("User updated successfully");
        fetchUsers();
        setEditId(null);
        setForm({ name: "", email: "", password: "", role_id: "" });
      }
    } else {
      const { error } = await supabase.from("users").insert([form]);
      if (error) toast.error(`Failed to create: ${error.message}`);
      else {
        toast.success("User added successfully");
        fetchUsers();
        setForm({ name: "", email: "", password: "", role_id: "" });
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

  function handleUserEdit(user: User) {
    setForm(user);
    if (user.id) setEditId(user.id);
  }

  return (
    <div className="container my-5">
      <Toaster />
      <h3 className="mb-4">Employees Management</h3>

      <div className="row">
        {/* Form */}
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <form onSubmit={handleFormSubmit}>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <select
                    className="form-control"
                    value={form.role_id}
                    onChange={(e) =>
                      setForm({ ...form, role_id: e.target.value })
                    }
                  >
                    <option value="">Select Role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-rose w-100">
                  {editId ? "Update" : "Add"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="col-md-8">
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Password</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.password}</td>
                    <td>
                      {roles.find((r) => r.id === user.role_id)?.name || ""}
                    </td>
                    <td>
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
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
