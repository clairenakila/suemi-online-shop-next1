"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ROUTES } from "../routes";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace(ROUTES.LOGIN);
        return;
      }

      setUser(data.session.user);
      setLoading(false);
    };

    checkSession();
  }, [router]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h1 className="fw-bold">Welcome, {user?.email} 👋</h1>
      <p className="text-muted">You are now logged in to your dashboard.</p>

      <button
        className="btn btn-outline-danger mt-4"
        onClick={async () => {
          await supabase.auth.signOut();
          router.push(ROUTES.LOGIN);
        }}
      >
        Logout
      </button>
    </div>
  );
}
