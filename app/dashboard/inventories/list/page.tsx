"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "@/lib/supabase";

import SearchBar from "../../../components/SearchBar";
import ConfirmDelete from "../../../components/ConfirmDelete";
import { DataTable, Column } from "../../../components/DataTable";
import DateRangePicker from "../../../components/DateRangePicker";
import AddInventoryModal from "../../../components/AddInventoryModal";
import EditInventoryModal from "../../../components/EditInventoryModal";
import ExportButton from "../../../components/ExportButton";
import ToggleColumns from "../../../components/ToggleColumns";
import ImportButton from "../../../components/ImportButton";
import type { Category, Supplier, Inventory } from "../../../types/inventory";
import { parseNumber, dateNoTimezone } from "../../../utils/validator";

interface User {
  name: string;
  role?: { name: string };
}

export default function InventoriesPage() {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedInventoryIds, setSelectedInventoryIds] = useState<string[]>(
    []
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState<{
    startDate: string | null;
    endDate: string | null;
  }>({ startDate: null, endDate: null });
  const [tableColumns, setTableColumns] = useState<Column<Inventory>[]>([]);
  const [user, setUser] = useState<User | null>(null);

  // Fetch suppliers and categories on mount
  useEffect(() => {
    fetchSuppliers();
    fetchCategories();
  }, []);

  // Fetch inventories after suppliers and categories are loaded
  useEffect(() => {
    if (suppliers.length && categories.length) fetchInventories();
  }, [suppliers, categories]);

  const fetchSuppliers = async () => {
    const { data, error } = await supabase.from("suppliers").select("*");
    if (error) return toast.error(error.message);
    setSuppliers(data || []);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) return toast.error(error.message);
    setCategories(data || []);
  };

  const fetchInventories = async () => {
    const { data, error } = await supabase.from("inventories").select("*");
    if (error) return toast.error(error.message);

    // Normalize quantities, prices, totals, and dates
    const mapped = (data || []).map((inv) => {
      const quantity = parseNumber(inv.quantity).toFixed(2);
      const price = parseNumber(inv.price).toFixed(2);
      const total = (
        parseNumber(inv.quantity) * parseNumber(inv.price)
      ).toFixed(2);

      return {
        ...inv,
        quantity,
        price,
        total,
        date_arrived: dateNoTimezone(inv.date_arrived),
      };
    });

    setInventories(mapped);
  };

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me");
        const json = await res.json();
        setUser(json.user);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const toggleSelectInventory = (id: string) =>
    setSelectedInventoryIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const toggleSelectAll = (checked: boolean) =>
    setSelectedInventoryIds(checked ? inventories.map((i) => i.id!) : []);

  const filteredInventories = inventories.filter((inv) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = [inv.box_number, inv.supplier, inv.category].some(
      (val) => val?.toLowerCase().includes(term)
    );

    let matchesDateRange = true;
    if (dateRange.startDate && dateRange.endDate && inv.date_arrived) {
      const arrived = new Date(inv.date_arrived);
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      matchesDateRange = arrived >= start && arrived <= end;
    }

    return matchesSearch && matchesDateRange;
  });

  const columns: Column<Inventory>[] = [
    { header: "Date Arrived", accessor: (row) => row.date_arrived || "" },
    { header: "Box Number", accessor: "box_number" },
    { header: "Supplier", accessor: "supplier" },
    { header: "Category", accessor: "category" },
    { header: "Quantity", accessor: "quantity" },
    { header: "Price", accessor: "price" },
    { header: "Total", accessor: "total" },
    {
      header: "Action",
      accessor: (row) => (
        <ConfirmDelete
          confirmMessage={`Delete box ${row.box_number}?`}
          onConfirm={async () => {
            const res = await fetch("/api/inventories", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ids: [row.id] }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to delete");
            fetchInventories();
          }}
        >
          Delete
        </ConfirmDelete>
      ),
      center: true,
    },
  ];

  useEffect(() => setTableColumns(columns), [inventories]);

  return (
    <div className="container my-5">
      <Toaster />
      <h3 className="mb-4">Inventories Management</h3>

      <div className="mb-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <button
            className="btn btn-success"
            onClick={() => setShowAddModal(true)}
          >
            Add Inventory
          </button>
          {showAddModal && (
            <AddInventoryModal
              isOpen={showAddModal}
              onClose={() => setShowAddModal(false)}
              onSuccess={fetchInventories}
              suppliers={suppliers}
              categories={categories}
            />
          )}

          <button
            className="btn btn-warning"
            onClick={() => {
              if (!selectedInventoryIds.length)
                return toast.error("Select at least one inventory");
              setShowEditModal(true);
            }}
          >
            Edit
          </button>
          {showEditModal && (
            <EditInventoryModal
              isOpen={showEditModal}
              onClose={() => setShowEditModal(false)}
              onSuccess={fetchInventories}
              suppliers={suppliers}
              categories={categories}
              inventoryIds={selectedInventoryIds}
            />
          )}

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
              }}
              onSuccess={fetchInventories}
            />
          )}

          <ExportButton
            data={filteredInventories}
            headersMap={{
              "Date Arrived": "date_arrived",
              "Box Number": "box_number",
              Supplier: "supplier",
              Category: "category",
              Quantity: "quantity",
              Price: (row) => parseNumber(row.price).toFixed(2),
              Total: (row) =>
                (parseNumber(row.quantity) * parseNumber(row.price)).toFixed(2),
            }}
            filename="inventories.csv"
          />

          <ConfirmDelete
            confirmMessage="Delete selected inventories?"
            onConfirm={async () => {
              if (!selectedInventoryIds.length)
                throw new Error("No inventories selected");
              const res = await fetch("/api/inventories", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: selectedInventoryIds }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "Failed to delete");
              setSelectedInventoryIds([]);
              fetchInventories();
            }}
          >
            Delete Selected
          </ConfirmDelete>
        </div>

        <div className="d-flex align-items-center gap-2">
          <SearchBar
            placeholder="Search inventories..."
            value={searchTerm}
            onChange={setSearchTerm}
            options={inventories.map((i) => i.box_number || "")}
          />
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="p-2 bg-light border rounded-3 d-flex align-items-center justify-content-center shadow-sm"
            style={{ width: "42px", height: "42px" }}
            title="Filter by date arrived"
          >
            <i className="bi bi-calendar3 fs-5 text-secondary"></i>
          </button>
          <ToggleColumns columns={columns} onChange={setTableColumns} />
        </div>
      </div>

      {showDatePicker && (
        <div className="bg-white p-3 shadow-md rounded-4 mb-3 w-fit">
          <DateRangePicker onChange={setDateRange} />
        </div>
      )}

      <DataTable<Inventory>
        data={filteredInventories}
        columns={tableColumns}
        selectable
        selectedIds={selectedInventoryIds}
        onToggleSelect={toggleSelectInventory}
        onToggleSelectAll={toggleSelectAll}
        rowKey="id"
        page={1}
        pageSize={50}
        totalCount={filteredInventories.length}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
      />
    </div>
  );
}
