"use client";
import BulkEdit from "../../../components/BulkEdit";
import { Column, DataTable } from "../../../components/DataTable";
import AddInventoryModal from "../../../components/AddInventoryModal";
import ImportButton from "../../../components/ImportButton";
import ExportButton from "../../../components/ExportButton";
import SearchBar from "../../../components/SearchBar";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const Columns: Column<any>[] = [
  {
    header: "Created At",
    accessor: "created_at",
    center: false,
  },
  {
    header: "Date Arrived",
    accessor: "date_arrived",
    center: false,
  },
  {
    header: "Category",
    accessor: "category",
    center: true,
  },
  {
    header: "Supplier",
    accessor: "supplier",
    center: true,
  },
  {
    header: "Box Number",
    accessor: "box_number",
    center: false,
  },
  {
    header: "Quantity",
    accessor: "quantity",
    center: true,
  },

  {
    header: "Total",
    accessor: "total",
    center: true,
  },
];

export default function InventoriesPage() {
  const [arrivalsData, setArrivalsData] = useState<any[]>([]); // Sample data can be set here
  const [selectedIds, setSelectedIds] = useState<string[]>([]); // ← Fixed: added state for selected IDs
  const [openAddModal, setOpenAddModal] = useState(false);

  // useEffect to fetch inventories
  useEffect(() => {
    const fetchInventories = async () => {
      const { data, error } = await supabase
        .from("inventories")
        .select(
          `
          id,
          created_at,
          date_arrived,
          category,
          supplier,
          box_number,
          quantity,
          total
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch error:", error);
        return;
      }

      setArrivalsData(data || []);
    };

    fetchInventories();
  }, []);

  // Handlers for selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIdsOnPage = arrivalsData.map((row) => row.id);
      setSelectedIds(allIdsOnPage);
    } else {
      setSelectedIds([]);
    }
  };

  return (
    <div className="container my-5">
      {/* Header */}
      <div className="mb-4">
        <h2>Inventory List</h2>
      </div>
      {/* Buttons */}
      {/* Add Inventory Button */}
      <div className="d-flex gap-2 mb-3">
        <button
          className="btn btn-success"
          onClick={() => setOpenAddModal(true)}
        >
          Add Inventory
        </button>
        {/* Edit Btn */}
        <BulkEdit
          table="inventories"
          fields={[]}
          selectedIds={selectedIds} // ← Fixed: use state, not empty array
          onSuccess={() => {}}
        />
        {/* Import Button */}
        <ImportButton
          table="inventories"
          headersMap={{
            date_arrived: "Date Arrived",
            category: "Category",
            supplier: "Supplier",
            box_number: "Box Number",
            quantity: "Quantity",
            total: "Total",
          }}
          onSuccess={() => {
            // optional: refetch inventories
          }}
        />
        <ExportButton
          data={arrivalsData}
          headersMap={{
            created_at: "Created At",
            date_arrived: "Date Arrived",
            category_id: "Category ID",
            supplier_id: "Supplier ID",
            box_number: "Box Number",
            quantity: "Quantity",
            amount: "Amount",
            total: "Total",
          }}
        />
          {/* RIGHT: search bar */}
          {/* <SearchBar /> */}
      </div>

      {/* Add Inventory Modal */}
      <AddInventoryModal
        isOpen={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onSuccess={() => {
          setOpenAddModal(false);
          // Refresh data or show success message
        }}
      />

      {/* DataTable */}
      <div className="container mx-auto">
        <DataTable
          data={arrivalsData}
          columns={Columns}
          rowKey="id"
          page={1}
          pageSize={10}
          totalCount={arrivalsData.length}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
          selectable
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
        />
      </div>
    </div>
  );
}
