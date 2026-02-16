"use client";

import { Toaster } from "react-hot-toast";
import InventoriesTable from "../../components/inventories/InventoriesTable";

export default function InventoriesPage() {
  return (
    <div className="container my-5">
      <Toaster />
      <h3 className="mb-4">Inventories</h3>
      <InventoriesTable />
    </div>
  );
}