"use client";
import BulkEdit from "../../../components/BulkEdit";
import { Column, DataTable } from "../../../components/DataTable";
import AddInventoryModal from "../../../components/AddInventoryModal";
import { useState } from "react";

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
    header: "Category ID",
    accessor: "category_id",
    center: true,
  },
  {
    header: "Supplier ID",
    accessor: "supplier_id",
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
    header: "Amount",
    accessor: "amount",
    center: true,
  },
  {
    header: "Total",
    accessor: "total",
    center: true,
  },
];

export default function InventoriesPage() {
  const arrivalsData = [
    {
      id: "1",
      created_at: "2025-12-01",
      category_id: 101,
      date_arrived: "2025-12-10",
      supplier_id: 501,
      box_number: "BOX-001",
      quantity: 100,
      amount: 250,
      total: 25000,
    },
    {
      id: "2",
      created_at: "2025-12-05",
      category_id: 102,
      date_arrived: "2025-12-12",
      supplier_id: 502,
      box_number: "BOX-002",
      quantity: 50,
      amount: 400,
      total: 20000,
    },
    {
      id: "3",
      created_at: "2025-13-05",
      category_id: 103,
      date_arrived: "2025-14-12",
      supplier_id: 503,
      box_number: "BOX-003",
      quantity: 51,
      amount: 400,
      total: 20000,
    },
    {
      id: "4",
      created_at: "2025-14-05",
      category_id: 104,
      date_arrived: "2025-16-12",
      supplier_id: 505,
      box_number: "BOX-004",
      quantity: 52,
      amount: 400,
      total: 20000,
    },
    {
      id: "5",
      created_at: "2025-14-05",
      category_id: 105,
      date_arrived: "2025-16-12",
      supplier_id: 505,
      box_number: "BOX-004",
      quantity: 52,
      amount: 400,
      total: 20000,
    },
    {
      id: "6",
      created_at: "2025-14-05",
      category_id: 105,
      date_arrived: "2025-16-12",
      supplier_id: 505,
      box_number: "BOX-004",
      quantity: 52,
      amount: 400,
      total: 20000,
    },
    {
      id: "7",
      created_at: "2025-14-05",
      category_id: 105,
      date_arrived: "2025-16-12",
      supplier_id: 505,
      box_number: "BOX-004",
      quantity: 52,
      amount: 400,
      total: 20000,
    },
  ];

  const [selectedIds, setSelectedIds] = useState<string[]>([]); // ← Fixed: added state for selected IDs
  const [openAddModal, setOpenAddModal] = useState(false);

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
      <div className="mb-3">
        <h2>Inventory List</h2>
      </div>

      {/* Buttons */}
      <div className="d-flex gap-2 mb-3">
        <button
          className="btn btn-success"
          onClick={() => setOpenAddModal(true)}
        >
          Add Inventory
        </button>

        <BulkEdit
          table="inventories"
          fields={[]}
          selectedIds={selectedIds} // ← Fixed: use state, not empty array
          onSuccess={() => {}}
        />
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