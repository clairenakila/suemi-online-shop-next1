"use client";

import { usePathname } from "next/navigation";
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
      {/* {!hideHeader && <Header />}  */}
      <main className="grow container py-4">{children}</main>
      <Footer />
    </>
  );
}
