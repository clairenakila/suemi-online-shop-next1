"use client";

import { useState } from "react";

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <nav className="bg-white shadow flex items-center justify-between p-4">
      <div className="flex items-center">
        <button
          className="md:hidden px-2 py-1 bg-gray-200 rounded mr-2"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? "Close" : "Menu"}
        </button>
        <span className="font-bold text-xl">Navbar</span>
      </div>
      <div>User</div>
    </nav>
  );
}
