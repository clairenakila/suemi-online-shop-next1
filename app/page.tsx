"use client";
import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/app/routes";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Example: redirect if no session
    const user = localStorage.getItem("user"); // or supabase.auth.getSession()
    if (!user) {
      router.push(ROUTES.LOGIN);
    }
  }, [router]);

  // rest of your code...
}
