"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
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
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Invalid credentials");
      } else {
        // Safe localStorage use: only in browser
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
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
          <Image
            src="/images/logo2.png"
            alt="Logo"
            width={120}
            height={50} // adjust to your logo
            className="mx-auto d-block"
            style={{ cursor: "pointer" }}
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
        <div className="text-center mt-3">
          <p className="mb-0">
            Doesn't have an account?{" "}
            <Link
              href={ROUTES.REGISTER}
              className="text-danger text-decoration-none fw-semibold"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
