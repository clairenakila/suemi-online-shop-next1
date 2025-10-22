"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "../../routes";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate login delay
    setTimeout(() => {
      setLoading(false);
      router.push(ROUTES.HOME);
    }, 1000);
  };

  return (
    <div className="login-page d-flex justify-content-center align-items-center min-vh-100 bg-white">
      <div className="login-card card shadow-lg p-4">
        <div className="text-center mb-4">
          <h2 className="fw-bold">Login</h2>
          <p className="text-muted">
            Welcome back! Please login to your account.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">
              Email address
            </label>
            <input
              type="email"
              id="email"
              className="form-control shadow-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              maxLength={50}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label fw-semibold">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-control shadow-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              maxLength={50}
            />
          </div>

          <button
            type="submit"
            className="btn btn-rose w-100 fw-bold"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Optional Register Link */}
        {/* <div className="text-center mt-3">
          <p className="mb-0">
            Don’t have an account?{" "}
            <Link
              href={ROUTES.REGISTER}
              className="text-danger text-decoration-none fw-semibold"
            >
              Register
            </Link>
          </p>
        </div> */}
      </div>
    </div>
  );
}
