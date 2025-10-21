"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "../routes"; // adjust path if necessary

export default function Header({ title }: { title?: string }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    // TODO: Add your logout logic (clear auth, cookies, etc.)
    router.push(ROUTES.LOGIN); // redirect to login page
  };

  return (
    <header className="bg-light py-3 px-4 d-flex justify-content-between align-items-center border-bottom">
      {/* Left: Logo + Name */}
      <div className="d-flex align-items-center">
        <Image
          src="/images/logo2.png"
          alt="Logo"
          width={40}
          height={40}
          className="me-2 rounded-circle"
        />
        <span className="fw-bold fs-4">{title || "Suemi Online Shop"}</span>
      </div>

      {/* Right: User + Dropdown */}
      <div className="position-relative">
        <button
          className="btn btn-light d-flex align-items-center"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <Image
            src="/images/user_icon.png"
            alt="User"
            width={40}
            height={40}
            className="rounded-circle me-2"
          />
          <span className="me-1">John Doe</span>
          {/* Inverted V icon */}
          <span
            style={{
              fontSize: "0.7rem",
              transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            ▼
          </span>
        </button>

        {/* Dropdown menu */}
        {dropdownOpen && (
          <div
            className="position-absolute end-0 mt-2 bg-white border shadow"
            style={{
              width: "180px",
              height: "96px",
              zIndex: 1000,
              borderRadius: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-around",
            }}
          >
            <button
              className="dropdown-item d-flex align-items-center dropdown-item-custom ps-2"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </button>

            <button
              className="dropdown-item d-flex align-items-center dropdown-item-custom ps-2"
              onClick={() => alert("Go to profile")}
            >
              <i className="bi bi-person-circle me-2"></i>
              My Profile
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
