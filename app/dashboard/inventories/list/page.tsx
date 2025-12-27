"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";

import BulkEdit from "../../../components/BulkEdit";
import { Column, DataTable } from "../../../components/DataTable";
import AddInventoryModal from "../../../components/AddInventoryModal";
import ImportButton from "../../../components/ImportButton";
import ExportButton from "../../../components/ExportButton";
import ConfirmDelete from "../../../components/ConfirmDelete";
import SearchBar from "../../../components/SearchBar";
import ToggleColumns from "../../../components/ToggleColumns";
import DashboardDateRangePicker from "../../../components/DashboardDateRangePicker";

export const Columns: Column<any>[] = [
  { header: "Created At", accessor: "created_at", center: false },
  { header: "Date Arrived", accessor: "date_arrived", center: false },
  { header: "Category", accessor: "category", center: true },
  { header: "Supplier", accessor: "supplier", center: true },
  { header: "Box Number", accessor: "box_number", center: false },
  { header: "Quantity", accessor: "quantity", center: true },
  { header: "Total", accessor: "total", center: true },
];

export default function InventoriesPage() {
  const [arrivalsData, setArrivalsData] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openAddModal, setOpenAddModal] = useState(false);

  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<{
    startDate: string | null;
    endDate: string | null;
  }>({ startDate: null, endDate: null });

  const [visibleColumns, setVisibleColumns] = useState(
    Columns.map((c) => c.accessor)
  );

  // FETCH DATA
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

      if (!error) setArrivalsData(data || []);
    };

    fetchInventories();
  }, []);

  // FILTER LOGIC (SEARCH + DATE)
  const filteredData = useMemo(() => {
    return arrivalsData.filter((item) => {
      const matchesSearch = search
        ? Object.values(item).some((value) =>
            String(value).toLowerCase().includes(search.toLowerCase())
          )
        : true;

      const matchesDate =
        dateRange.startDate && dateRange.endDate
          ? new Date(item.date_arrived) >= new Date(dateRange.startDate) &&
            new Date(item.date_arrived) <= new Date(dateRange.endDate)
          : true;

      return matchesSearch && matchesDate;
    });
  }, [arrivalsData, search, dateRange]);

  // SEARCH OPTIONS
  const searchOptions = useMemo(() => {
    return arrivalsData.flatMap((row) =>
      Object.values(row).map((v) => String(v))
    );
  }, [arrivalsData]);

  // SELECT HANDLERS
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredData.map((r) => r.id) : []);
  };

  // DELETE
  const handleDelete = async () => {
    if (!selectedIds.length) return;

    await supabase.from("inventories").delete().in("id", selectedIds);

    setArrivalsData((prev) =>
      prev.filter((row) => !selectedIds.includes(row.id))
    );
    setSelectedIds([]);
  };

  return (
    <div className="container my-5">
      <h2 className="mb-4">Inventory List</h2>

      {/* ACTION BAR */}
      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <button
          className="btn btn-success"
          onClick={() => setOpenAddModal(true)}
        >
          Add Inventory
        </button>

        <BulkEdit
          table="inventories"
          fields={[]}
          selectedIds={selectedIds}
          onSuccess={() => {}}
        />

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
          onSuccess={() => {}}
        />

        <ExportButton
          data={filteredData}
          headersMap={{
            created_at: "Created At",
            date_arrived: "Date Arrived",
            category: "Category",
            supplier: "Supplier",
            box_number: "Box Number",
            quantity: "Quantity",
            total: "Total",
          }}
        />

        <ConfirmDelete
          onConfirm={handleDelete}
          confirmMessage={`Delete ${selectedIds.length} item(s)?`}
        >
          <span
            className="text-white"
            style={{ pointerEvents: selectedIds.length ? "auto" : "none" }}
          >
            Delete Selected
          </span>
        </ConfirmDelete>

        {/* RIGHT SIDE */}
        <div className="d-flex gap-2 ms-auto align-items-center">
          <SearchBar
            placeholder="Search inventory..."
            value={search}
            onChange={setSearch}
            options={searchOptions}
            storageKey="inventory-search"
          />
          <DashboardDateRangePicker onChange={(range) => setDateRange(range)} />
          <ToggleColumns
            columns={Columns}
            onChange={(cols) => setVisibleColumns(cols.map((c) => c.accessor))}
          />
        </div>
      </div>

      {/* MODAL */}
      <AddInventoryModal
        isOpen={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onSuccess={() => setOpenAddModal(false)}
      />

      {/* TABLE */}
      <DataTable
        data={filteredData}
        columns={Columns.filter((c) => visibleColumns.includes(c.accessor))}
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
  );
}
