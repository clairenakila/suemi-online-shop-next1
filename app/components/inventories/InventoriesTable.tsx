"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ItemTable from "../items/ItemTable";
import ViewInventoriesModal from "./ViewInventoriesModal";
import EditInventoriesModal from "./EditInventoriesModal";
import AddInventoryModal from "../AddInventoryModal";
import BulkEdit from "../BulkEdit";
import ImportButton from "../ImportButton";
import ExportButton from "../ExportButton";
import ConfirmDelete from "../ConfirmDelete";
import SearchBar from "../SearchBar";
import DateRangePicker from "../DateRangePicker";
import ToggleColumns from "../ToggleColumns";
import toast from "react-hot-toast";

interface Inventory {
  id: string;
  created_at?: string;
  date_arrived?: string;
  box_number?: string;
  supplier?: string;
  category?: string;
  quantity?: string;
  price?: string;
  total?: string;
  quantity_left?: string;
  total_left?: string;
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedInventoryId, setSelectedInventoryId] = useState<string>("");

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState<{
    startDate: string | null;
    endDate: string | null;
  }>({ startDate: null, endDate: null });

  // User state (for permissions)
  const [user, setUser] = useState<any>(null);

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me");
        const json = await res.json();
        setUser(json.user);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // Fetch inventories from Supabase
  const fetchInventories = async () => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("inventories")
      .select("*", { count: "exact" })
      .order("date_arrived", { ascending: false })
      .range(from, to);

    // Date filter
    if (dateRange.startDate && dateRange.endDate) {
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      end.setHours(23, 59, 59, 999);
      query = query
        .gte("date_arrived", start.toISOString())
        .lte("date_arrived", end.toISOString());
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = `%${searchTerm.trim()}%`;
      query = query.or(
        `box_number.ilike.${term},supplier.ilike.${term},category.ilike.${term}`
      );
    }

    const { data, count, error } = await query;

    if (error) {
      toast.error(error.message);
      return;
    }

    setInventories(data || []);
    setTotalCount(count || 0);
  };

  useEffect(() => {
    if (user) fetchInventories();
  }, [page, pageSize, searchTerm, dateRange, user]);

  // Toggle individual checkbox
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

const handleToggleSelectAll = (checked: boolean) => {
  if (checked) {
    // Select all VISIBLE items on current page
    setSelectedIds(inventories.map((inv) => String(inv.id)));
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
                toast.error("Error deleting inventory");
                return;
              }

              toast.success("Inventory deleted!");
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
      {/* ✅ TOOLBAR */}
      <div className="mb-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div className="d-flex flex-wrap align-items-center gap-2">
          {/* Add Item */}
          <button
            className="btn btn-success"
            onClick={() => setShowAddModal(true)}
          >
            Add Item
          </button>

          {/* Bulk Edit */}
          {user?.role?.name === "Superadmin" && (
            <BulkEdit
              table="inventories"
              selectedIds={selectedIds}
              onSuccess={fetchInventories}
              columns={2}
              fields={[
                { key: "box_number", label: "Box Number", type: "text" },
                { key: "supplier", label: "Supplier", type: "text" },
                { key: "category", label: "Category", type: "text" },
                { key: "quantity", label: "Quantity", type: "number" },
                { key: "price", label: "Price", type: "number" },
                { key: "total", label: "Total", type: "number" },
                { key: "quantity_left", label: "Quantity Left", type: "number" },
                { key: "total_left", label: "Total Left", type: "number" },
              ]}
            />
          )}

          {/* Import */}
          {user?.role?.name === "Superadmin" && (
            <ImportButton
              table="inventories"
              headersMap={{
                "Date Arrived": "date_arrived",
                "Box Number": "box_number",
                Supplier: "supplier",
                Category: "category",
                Quantity: "quantity",
                Price: "price",
                Total: "total",
                "Quantity Left": "quantity_left",
                "Total Left": "total_left",
              }}
              onSuccess={fetchInventories}
            />
          )}

          {/* Export */}
          {user?.role?.name === "Superadmin" && (
            <ExportButton
              data={inventories}
              filename="inventories.csv"
              headersMap={{
                "Date Arrived": (row) => {
                  if (!row.date_arrived) return "";
                  const date = new Date(row.date_arrived);
                  const month = (date.getMonth() + 1).toString().padStart(2, "0");
                  const day = date.getDate().toString().padStart(2, "0");
                  const year = date.getFullYear().toString().slice(-2);
                  return `${month}-${day}-${year}`;
                },
                "Box Number": "box_number",
                Supplier: "supplier",
                Quantity: "quantity",
              }}
            />
          )}

          {/* Delete Selected */}
          {user?.role?.name === "Superadmin" && (
            <ConfirmDelete
              confirmMessage="Delete selected inventories?"
              onConfirm={async () => {
                if (!selectedIds.length) {
                  toast.error("No items selected");
                  return;
                }
                const { error } = await supabase
                  .from("inventories")
                  .delete()
                  .in("id", selectedIds);
                if (error) {
                  toast.error(error.message);
                  return;
                }
                setSelectedIds([]);
                toast.success("Deleted successfully!");
                fetchInventories();
              }}
            >
              Delete Selected
            </ConfirmDelete>
          )}
        </div>

        {/* Right side: Search, Date, Toggle */}
        <div className="d-flex align-items-center gap-2">
          <SearchBar
            placeholder="Search inventories..."
            value={searchTerm}
            onChange={setSearchTerm}
            storageKey="inventories_search"
          />

          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="p-2 bg-light border rounded-3 shadow-sm"
            style={{ width: "42px", height: "42px" }}
            title="Filter by date"
          >
            <i className="bi bi-calendar3 fs-5 text-secondary"></i>
          </button>
        </div>
      </div>

      {/* Date Picker */}
      {showDatePicker && (
        <div className="bg-white p-3 shadow-md rounded-4 mb-3 w-fit">
          <DateRangePicker onChange={setDateRange} />
        </div>
      )}

      {/* Table */}
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

      {/* Add Modal */}
      <AddInventoryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchInventories}
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