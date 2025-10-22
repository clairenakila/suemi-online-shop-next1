"use client";

import { useState } from "react";
import Link from "next/link";
import { ROUTES } from "../routes";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = () => setCollapsed(!collapsed);

  //redirect logout to home
  const router = useRouter(); // ✅ initialize router

  const handleLogout = () => {
    toast.success("Logged out successfully");
    router.push(ROUTES.HOME); // ✅ use router to navigate
  };

  return (
    <div className="d-flex vh-100 w-100" style={{ overflow: "hidden" }}>
      {/* Sidebar */}
      <nav
        className="bg-dark text-white d-flex flex-column p-3"
        style={{
          width: collapsed ? "60px" : "220px",
          transition: "width 0.3s",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          {!collapsed && <h4 className="mb-0">Panel</h4>}
          <button
            className="btn btn-outline-light btn-sm"
            onClick={toggleSidebar}
          >
            <i className="bi bi-list"></i>
          </button>
        </div>

        <ul className="nav nav-pills flex-column grow">
          <li className="nav-item mb-2">
            <Link
              href="/dashboard"
              className="nav-link text-white d-flex align-items-center"
            >
              <i className="bi bi-speedometer2 me-2"></i>
              {!collapsed && "Dashboard"}
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link
              href="/dashboard/users"
              className="nav-link text-white d-flex align-items-center"
            >
              <i className="bi bi-people me-2"></i>
              {!collapsed && "Users"}
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link
              href="/dashboard/settings"
              className="nav-link text-white d-flex align-items-center"
            >
              <i className="bi bi-gear me-2"></i>
              {!collapsed && "Settings"}
            </Link>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="d-flex flex-column grow vh-100 overflow-hidden">
        {/* Header */}
        <header className="bg-light border-bottom p-3 d-flex justify-content-between align-items-center shrink-0">
          <h5 className="mb-0">Dashboard Header</h5>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        </header>

        {/* Page Content */}
        <main className="grow p-4 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
