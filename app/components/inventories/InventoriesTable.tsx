"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ItemTable from "../items/ItemTable";
import ViewInventoriesModal from "./ViewInventoriesModal";
import EditInventoriesModal from "./EditInventoriesModal";

interface Inventory {
  id: string;
  created_at?: string;
  date_arrived?: string;
  box_number?: string;
  supplier?: string;
  quantity?: string;
}

export default function InventoriesTable() {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [totalCount, setTotalCount] = useState(0);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedInventoryId, setSelectedInventoryId] = useState<string>("");

  // Fetch inventories from Supabase
  const fetchInventories = async () => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count } = await supabase
      .from("inventories")
      .select("*", { count: "exact" })
      .order("date_arrived", { ascending: false })
      .range(from, to);

    setInventories(data || []);
    setTotalCount(count || 0);
  };

  useEffect(() => {
    fetchInventories();
  }, [page, pageSize]);

  // Toggle individual checkbox
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  // Toggle select all
  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(inventories.map((inv) => inv.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Define columns
  const columns = [
    {
      header: "Date Arrived",
      accessor: (row: Inventory) => {
        if (!row.date_arrived) return "";
        const date = new Date(row.date_arrived);
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const year = date.getFullYear().toString().slice(-2);
        return `${month}-${day}-${year}`;
      },
    },
    {
      header: "Box Number",
      accessor: (row: Inventory) => row.box_number || "-",
    },
    {
      header: "Supplier",
      accessor: (row: Inventory) => row.supplier || "-",
    },
    {
      header: "Quantity",
      accessor: (row: Inventory) => row.quantity || "0",
    },
    {
      header: "Action",
      accessor: (row: Inventory) => (
        <div className="d-flex gap-2 justify-content-center">
          {/* View Button */}
          <button
            className="btn btn-success"
            onClick={() => {
              setSelectedInventoryId(row.id);
              setViewModalOpen(true);
            }}
          >
            View
          </button>

          {/* Edit Button */}
          <button
            className="btn btn-warning"
            onClick={() => {
              setSelectedInventoryId(row.id);
              setEditModalOpen(true);
            }}
          >
            Edit
          </button>

          {/* Delete Button */}
          <button
            className="btn btn-danger"
            onClick={async () => {
              if (!confirm(`Delete box number "${row.box_number}"?`)) return;

              const { error } = await supabase
                .from("inventories")
                .delete()
                .eq("id", row.id);

              if (error) {
                alert("Error deleting inventory");
                return;
              }

              alert("Inventory deleted!");
              fetchInventories();
            }}
          >
            Delete
          </button>
        </div>
      ),
      center: true,
    },
  ];

  return (
    <div>
      <ItemTable
        data={inventories}
        columns={columns}
        rowKey="id"
        selectable={true}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {/* View Modal */}
      <ViewInventoriesModal
        isOpen={viewModalOpen}
        inventoryId={selectedInventoryId}
        onClose={() => setViewModalOpen(false)}
      />

      {/* Edit Modal */}
      <EditInventoriesModal
        isOpen={editModalOpen}
        inventoryId={selectedInventoryId}
        onClose={() => setEditModalOpen(false)}
        onSuccess={fetchInventories}
      />
    </div>
  );
}