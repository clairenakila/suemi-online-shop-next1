"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import { ROUTES } from "../../routes";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call API route to validate credentials
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Invalid credentials");
      } else {
        toast.success("Logged in successfully!");
        router.push(ROUTES.DASHBOARD);
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
        style={{ maxWidth: "400px", borderRadius: "12px", width: "100%" }}
      >
        <Link href={ROUTES.HOME}>
          <img
            src="/images/logo2.png" //logo.png is in public/images
            alt="Logo"
            className="mx-auto"
            style={{ width: "120px", cursor: "pointer" }}
          />
        </Link>
        <h2 className="fw-bold text-center mb-3">Login</h2>
        <form onSubmit={handleSubmit}>
          <label className="form-label fw-semibold">Email address</label>
          <input
            type="email"
            className="form-control mb-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="form-label fw-semibold">Password</label>
          <input
            type="password"
            className="form-control mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="btn btn-rose w-100 fw-bold" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* <div className="text-center mt-3">
          <p className="mb-0">
            Don’t have an account?{" "}
            <Link href={ROUTES.REGISTER}>
              <span className="text-danger fw-semibold  text-decoration-none">
                Register
              </span>
            </Link>
          </p>
        </div> */}
      </div>
    </div>
  );
}
