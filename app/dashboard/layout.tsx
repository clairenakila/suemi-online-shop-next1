"use client";

import { useState } from "react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <div className="d-flex min-vh-100">
      {/* Sidebar */}
      <nav
        className={`bg-dark text-white flex-column p-3`}
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

        <ul className="nav nav-pills flex-column">
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
      <div className="grow">
        {/* Header */}
        <header className="bg-light border-bottom p-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Dashboard Header</h5>
          <button className="btn btn-outline-secondary btn-sm">Logout</button>
        </header>

        {/* Page Content */}
        <div className="grow d-flex flex-column">
          <header>...</header>
          <main className="grow p-4 overflow-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
