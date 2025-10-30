"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { ROUTES } from "../routes";
import Loader from "./../components/Loader";

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
  const [roleName, setRoleName] = useState<string>("");
  const [loading, setLoading] = useState(false); // 👈 added
  const router = useRouter();

  // Fetch user and role info
  useEffect(() => {
    setMounted(true);

    const fetchUser = async () => {
      let user: any = null;

      const stored = localStorage.getItem("user");
      if (stored) {
        user = JSON.parse(stored);
        if (!user.role) {
          const res = await fetch("/api/me");
          const data = await res.json();
          if (data.user) {
            user = data.user;
            localStorage.setItem("user", JSON.stringify(user));
          }
        }
      } else {
        const res = await fetch("/api/me");
        const data = await res.json();
        if (data.user) {
          user = data.user;
          localStorage.setItem("user", JSON.stringify(user));
        } else {
          router.push(ROUTES.HOME);
          return;
        }
      }

      setUserName(user.name || "Unknown User");
      setRoleName(user.role?.name || "");
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

  // 👇 helper for link clicks
  const handleNavClick = (path: string) => {
    setLoading(true);
    router.push(path);
  };

  if (!mounted) return null;

  return (
    <div className="d-flex vh-100 w-100" style={{ overflow: "hidden" }}>
      {/* Loader shown when navigating */}
      {loading && <Loader />}

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
          {/* Dashboard */}
          <li className="nav-item mb-2">
            <button
              className="nav-link text-white d-flex align-items-center btn btn-dark w-100 text-start"
              onClick={() => handleNavClick("/dashboard")}
            >
              <i className="bi bi-speedometer2 me-2"></i>
              {!collapsed && "Dashboard"}
            </button>
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
                {roleName === "Superadmin" && (
                  <li className="nav-item mb-1">
                    <button
                      className="nav-link text-white btn btn-dark text-start w-100"
                      onClick={() =>
                        handleNavClick("/dashboard/categories/list")
                      }
                    >
                      Categories
                    </button>
                  </li>
                )}

                <li className="nav-item mb-1">
                  <button
                    className="nav-link text-white btn btn-dark text-start w-100"
                    onClick={() => handleNavClick("/dashboard/items/list")}
                  >
                    Sold Items
                  </button>
                </li>
                {roleName === "Superadmin" && (
                  <li className="nav-item mb-1">
                    <button
                      className="nav-link text-white btn btn-dark text-start w-100"
                      onClick={() =>
                        handleNavClick("/dashboard/inventories/list")
                      }
                    >
                      Inventories
                    </button>
                  </li>
                )}
              </ul>
            )}
          </li>

          {/* Users Section */}
          {roleName === "Superadmin" && (
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
                    <button
                      className="nav-link text-white btn btn-dark text-start w-100"
                      onClick={() =>
                        handleNavClick("/dashboard/employees/list")
                      }
                    >
                      Employees
                    </button>
                  </li>
                  <li className="nav-item mb-1">
                    <button
                      className="nav-link text-white btn btn-dark text-start w-100"
                      onClick={() =>
                        handleNavClick("/dashboard/suppliers/list")
                      }
                    >
                      Suppliers
                    </button>
                  </li>
                  <li className="nav-item mb-1">
                    <button
                      className="nav-link text-white btn btn-dark text-start w-100"
                      onClick={() => handleNavClick("/dashboard/roles/list")}
                    >
                      Roles
                    </button>
                  </li>
                </ul>
              )}
            </li>
          )}

          {/* Settings */}
          {["Superadmin"].includes(roleName) && (
            <li className="nav-item mb-2">
              <button
                className="nav-link text-white d-flex align-items-center btn btn-dark w-100 text-start"
                onClick={() => handleNavClick("/dashboard/settings")}
              >
                <i className="bi bi-gear me-2"></i>
                {!collapsed && "Settings"}
              </button>
            </li>
          )}
        </ul>
      </nav>

      {/* Main Content */}
      <div className="d-flex flex-column grow vh-100 overflow-hidden">
        <header className="bg-light border-bottom p-3 d-flex justify-content-between align-items-center shrink-0">
          <span className="fw-semibold text-secondary">
            {userName || "Loading..."}
            {roleName ? ` - ${roleName}` : ""}
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
