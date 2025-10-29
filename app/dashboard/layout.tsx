"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { ROUTES } from "../routes";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [usersMenuOpen, setUsersMenuOpen] = useState(false);
  const [itemsMenuOpen, setItemsMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    const fetchUser = async () => {
      const stored = localStorage.getItem("user");
      if (stored) {
        const user = JSON.parse(stored);
        setUserName(user.name || "Unknown User");
      } else {
        const res = await fetch("/api/me");
        const data = await res.json();
        if (data.user) {
          setUserName(data.user.name || "Unknown User");
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          router.push(ROUTES.HOME);
        }
      }
    };

    fetchUser();
  }, [router]);

  const toggleSidebar = () => setCollapsed((prev) => !prev);
  const toggleUsersMenu = () => setUsersMenuOpen((prev) => !prev);
  const toggleItemsMenu = () => setItemsMenuOpen((prev) => !prev);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    router.push(ROUTES.HOME);
  };

  if (!mounted) return null;

  return (
    <div className="d-flex vh-100 w-100" style={{ overflow: "hidden" }}>
      {/* Sidebar */}
      <nav
        className="bg-dark text-white d-flex flex-column p-3"
        style={{
          width: collapsed ? "60px" : "220px",
          transition: "width 0.3s ease",
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

          {/* Items Section */}
          <li className="nav-item mb-2">
            <button
              className="nav-link text-white d-flex align-items-center justify-content-between w-100 btn btn-dark"
              onClick={toggleItemsMenu}
            >
              <span className="d-flex align-items-center">
                <i className="bi bi-handbag me-2"></i>
                {!collapsed && "Items"}
              </span>
              {!collapsed && (
                <i
                  className={`bi ${
                    itemsMenuOpen ? "bi-chevron-up" : "bi-chevron-down"
                  }`}
                ></i>
              )}
            </button>
            {itemsMenuOpen && !collapsed && (
              <ul className="nav flex-column ms-3 mt-2">
                <li className="nav-item mb-1">
                  <Link
                    href="/dashboard/items/list"
                    className="nav-link text-white"
                  >
                    Sold Items
                  </Link>
                </li>
                <li className="nav-item mb-1">
                  <Link
                    href="/dashboard/items/inventories"
                    className="nav-link text-white"
                  >
                    Inventories
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Users Section */}
          <li className="nav-item mb-2">
            <button
              className="nav-link text-white d-flex align-items-center justify-content-between w-100 btn btn-dark"
              onClick={toggleUsersMenu}
            >
              <span className="d-flex align-items-center">
                <i className="bi bi-people me-2"></i>
                {!collapsed && "Users"}
              </span>
              {!collapsed && (
                <i
                  className={`bi ${
                    usersMenuOpen ? "bi-chevron-up" : "bi-chevron-down"
                  }`}
                ></i>
              )}
            </button>
            {usersMenuOpen && !collapsed && (
              <ul className="nav flex-column ms-3 mt-2">
                <li className="nav-item mb-1">
                  <Link
                    href="/dashboard/employees/list"
                    className="nav-link text-white"
                  >
                    Employees
                  </Link>
                </li>
                <li className="nav-item mb-1">
                  <Link
                    href="/dashboard/suppliers/list"
                    className="nav-link text-white"
                  >
                    Suppliers
                  </Link>
                </li>
                <li className="nav-item mb-1">
                  <Link
                    href="/dashboard/users/create"
                    className="nav-link text-white"
                  >
                    Roles
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Settings */}
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
        {/* Header: name left, logout right */}
        <header className="bg-light border-bottom p-3 d-flex justify-content-between align-items-center shrink-0">
          <span className="fw-semibold text-secondary">
            {userName || "Loading..."}
          </span>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        </header>

        <main className="grow p-4 overflow-auto">{children}</main>
      </div>

      <Toaster />
    </div>
  );
}
