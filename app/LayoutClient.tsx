"use client";

import { usePathname } from "next/navigation";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideHeader =
    pathname === "/auth/login" || pathname === "/auth/register";

  return (
    <>
      {!hideHeader && <Header />} {/* hide header only on login */}
      <main className="flex-fill">{children}</main>
      <Footer />
    </>
  );
}
