"use client";
import BulkEdit from "../../../components/BulkEdit";
import { Column, DataTable } from "../../../components/DataTable";
import AddInventoryModal from "../../../components/AddInventoryModal";
import ImportButton from "../../../components/ImportButton";
import ExportButton from "../../../components/ExportButton";
import ConfirmDelete from "../../../components/ConfirmDelete";
import SearchBar from "../../../components/SearchBar";
import { useState, useEffect, useMemo } from "react";
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
  const [openAddModal, setOpenAddModal] = useState(false); // State for Add Inventory Modal
  const [search, setSearch] = useState(""); // Search state
 

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
      const allIdsOnPage = filteredData.map((row) => row.id);
      setSelectedIds(allIdsOnPage);
    } else {
      setSelectedIds([]);
    }
  };

  // Handler for delete action
  const handleDelete = async () => {
    if (selectedIds.length === 0) return;

    const { error } = await supabase
      .from("inventories")
      .delete()
      .in("id", selectedIds);

    if (error) {
      console.error("Delete error:", error);
      return;
    }

    // Refresh data
    setArrivalsData((prev) =>
      prev.filter((item) => !selectedIds.includes(item.id))
    );
    setSelectedIds([]);
  };
  // Search state and filtering
  const filteredData = arrivalsData.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    )
  );
 // Memoized search options for SearchBar
  const searchOptions = useMemo(() => {
    return arrivalsData.flatMap((row) =>
      Object.values(row).map((v) => String(v))
    );
  }, [arrivalsData]);

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
            date_arrived: "date_arrived",
            category: "category",
            supplier: "supplier",
            box_number: "box_number",
            quantity: "quantity",
            total: "total",
          }}
          onSuccess={() => {
            // optional: refetch inventories
          }}
        />
        {/* Export Button */}
        <ExportButton
          data={filteredData}
          headersMap={{
            created_at: "created At",
            date_arrived: "date_arrived",
            category_id: "category",
            supplier_id: "supplier",
            box_number: "box_number",
            quantity: "quantity",
            total: "total",
          }}
        />

        {/* ConfirmDelete */}
        <ConfirmDelete
          onConfirm={handleDelete}
          confirmMessage={`Are you sure you want to delete ${selectedIds.length} item(s)?`}
        >
          <span
            className="text-white"
            style={{
              pointerEvents: selectedIds.length === 0 ? "none" : "auto",
            }}
          >
            Delete Selected
          </span>
        </ConfirmDelete>

        {/* RIGHT: search bar */}
        {/* <SearchBar /> */}
        <div className="ms-auto">
        <SearchBar
          placeholder="Search inventory..."
          value={search}
          onChange={setSearch}
          options={searchOptions} 
          storageKey="inventory-search"
          />
          </div>
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
          data={filteredData}
          columns={Columns}
          rowKey="id"
          page={1}
          pageSize={10}
          totalCount={filteredData.length}
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
