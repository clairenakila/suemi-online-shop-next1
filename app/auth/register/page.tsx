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
    phone_number: "",
    role_id: 0, // default empty, will be selected
  });
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch roles from Supabase on mount
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

  // Handle input changes with validation
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "name") {
      const filtered = value.replace(/[^a-zA-Z.-]/g, "");
      setForm({ ...form, [name]: filtered });
    } else if (name === "email") {
      const filtered = value.replace(/[^a-zA-Z0-9.@]/g, "");
      setForm({ ...form, [name]: filtered });
    } else if (name === "role_id") {
      setForm({ ...form, [name]: Number(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Submit handler
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
      // Send registration data to your API
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Registration failed");
      } else {
        toast.success("Registered successfully!");
        router.push(ROUTES.LOGIN);
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 bg-white">
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
