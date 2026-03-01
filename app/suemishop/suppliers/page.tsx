"use client";

import { Toaster } from "react-hot-toast";
import SuppliersTable from "../../components/suppliers/SuppliersTable";

export default function SuppliersPage() {
  return (
    <div className="container my-5">
      <Toaster />
      <h3 className="mb-4">Suppliers Management</h3>
      <SuppliersTable />
    </div>
  );
}