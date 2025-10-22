"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "./routes";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login automatically
    router.push(ROUTES.LOGIN);
  }, [router]);

  return null; // nothing rendered while redirecting
}
