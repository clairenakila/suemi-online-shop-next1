"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { ROUTES } from "../../routes";
import Link from "next/link";
import bcrypt from "bcryptjs";

export default function RegisterPage() {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "name"
          ? value.replace(/[^a-zA-Z .-]/g, "")
          : name === "email"
          ? value.replace(/[^a-zA-Z0-9.@]/g, "")
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("id")
        .eq("email", form.email)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        toast.error(fetchError.message);
        setLoading(false);
        return;
      }

      if (existingUser) {
        toast.error("Email already registered");
        setLoading(false);
        return;
      }

      const hashedPassword = await bcrypt.hash(form.password, 10);

      let guestRoleId: number;
      const { data: guestRole } = await supabase
        .from("roles")
        .select("id")
        .eq("name", "Guest")
        .single();

      if (guestRole) {
        guestRoleId = guestRole.id;
      } else {
        const { data: newRole, error: insertRoleError } = await supabase
          .from("roles")
          .insert([{ name: "Guest" }])
          .select()
          .single();

        if (!newRole || insertRoleError) {
          toast.error(
            insertRoleError?.message || "Failed to create Guest role"
          );
          setLoading(false);
          return;
        }

        guestRoleId = newRole.id;
      }

      const { error: insertError } = await supabase.from("users").insert([
        {
          name: form.name,
          email: form.email,
          password: hashedPassword,
          role_id: guestRoleId,
        },
      ]);

      if (insertError) {
        toast.error(insertError.message);
        setLoading(false);
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

  if (!mounted) return null;

  return (
    <div className="container d-flex justify-content-center align-items-start min-vh-100 bg-white py-5">
      <Toaster position="top-center" />
      <div
        className="card shadow-lg p-4"
        style={{ maxWidth: "400px", width: "100%", borderRadius: "12px" }}
      >
        <Link href={ROUTES.HOME}>
          <img
            src="/images/logo2.png"
            alt="Logo"
            className="mx-auto"
            style={{ width: "120px", cursor: "pointer" }}
          />
        </Link>

        <h2 className="fw-bold text-center mb-3">Register</h2>

        <form onSubmit={handleSubmit}>
          <label className="form-label fw-semibold">Name</label>
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

          <label className="form-label fw-semibold">Email address</label>
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

          <label className="form-label fw-semibold">Password</label>
          <div className="input-group mb-3">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="form-control"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              maxLength={50}
            />
            <span
              className="input-group-text"
              style={{ cursor: "pointer" }}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              <i
                className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
              ></i>
            </span>
          </div>

          <label className="form-label fw-semibold">Confirm Password</label>
          <div className="input-group mb-4">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              className="form-control"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              maxLength={50}
            />
            <span
              className="input-group-text"
              style={{ cursor: "pointer" }}
              onClick={() => setShowConfirm((prev) => !prev)}
            >
              <i
                className={`bi ${showConfirm ? "bi-eye-slash" : "bi-eye"}`}
              ></i>
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-rose w-100 fw-bold"
            disabled={loading}
          >
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
