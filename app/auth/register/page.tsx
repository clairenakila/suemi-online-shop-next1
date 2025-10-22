"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { ROUTES } from "../../routes";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role_id: 0, // default empty, will be selected
  });
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch roles from Supabase
  useEffect(() => {
    const fetchRoles = async () => {
      const { data, error } = await supabase.from("roles").select("*");
      if (error) {
        console.error("Failed to fetch roles:", error.message);
      } else {
        setRoles(data);
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "name") {
      setForm({ ...form, [name]: value.replace(/[^a-zA-Z.-]/g, "") });
    } else if (name === "email") {
      setForm({ ...form, [name]: value.replace(/[^a-zA-Z0-9.@]/g, "") });
    } else if (name === "role_id") {
      setForm({ ...form, [name]: Number(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!form.role_id) {
      toast.error("Please select a role");
      return;
    }

    setLoading(true);
    try {
      // Create Supabase auth user
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      // Insert additional info into your "users" table
      const { data: userData, error: insertError } = await supabase
        .from("users")
        .insert([
          {
            auth_id: data.user?.id,
            name: form.name,
            role_id: form.role_id,
          },
        ]);

      if (insertError) {
        toast.error(insertError.message);
        return;
      }

      toast.success("Registered successfully!");
      router.push(ROUTES.LOGIN);
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-start min-vh-100 bg-white py-5">
      <Toaster position="top-center" />
      <div
        className="card shadow-lg p-4"
        style={{ maxWidth: "400px", width: "100%", borderRadius: "12px" }}
      >
        <h2 className="fw-bold text-center mb-3">Register</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="name" className="form-label fw-semibold">
            Name
          </label>
          <input
            type="text"
            name="name"
            className="form-control mb-3"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            maxLength={50}
          />

          <label htmlFor="email" className="form-label fw-semibold">
            Email address
          </label>
          <input
            type="email"
            name="email"
            className="form-control mb-3"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            maxLength={50}
          />

          <label htmlFor="password" className="form-label fw-semibold">
            Password
          </label>
          <input
            type="password"
            name="password"
            className="form-control mb-3"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            maxLength={50}
          />

          <label htmlFor="confirmPassword" className="form-label fw-semibold">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            className="form-control mb-3"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            maxLength={50}
          />

          <label htmlFor="role_id" className="form-label fw-semibold">
            Role
          </label>
          <select
            name="role_id"
            className="form-control mb-4"
            value={form.role_id}
            onChange={handleChange}
            required
          >
            <option value="">Select role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>

          <button className="btn btn-rose w-100 fw-bold" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="text-center mt-3">
          <p className="mb-0">
            Already have an account?{" "}
            <Link
              href={ROUTES.LOGIN}
              className="text-danger text-decoration-none fw-semibold"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
