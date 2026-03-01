"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ItemTable from "../items/ItemTable";
import ViewSuppliersModal from "./ViewSuppliersModal";
import EditSuppliersModal from "./EditSuppliersModal";
import AddButton from "../AddButton";
import BulkEdit from "../BulkEdit";
import ImportButton from "../ImportButton";
import ExportButton from "../ExportButton";
import ConfirmDelete from "../ConfirmDelete";
import SearchBar from "../SearchBar";
import DateRangePicker from "../DateRangePicker";
import toast from "react-hot-toast";

interface Supplier {
  id?: string;
  created_at?: string;
  name?: string;
  contact_number?: string;
}

export default function SuppliersTable() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [totalCount, setTotalCount] = useState(0);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState<{
    startDate: string | null;
    endDate: string | null;
  }>({ startDate: null, endDate: null });

  // Fetch suppliers
  const fetchSuppliers = async () => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("suppliers")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    // Date filter
    if (dateRange.startDate && dateRange.endDate) {
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      end.setHours(23, 59, 59, 999);
      query = query
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = `%${searchTerm.trim()}%`;
      query = query.or(`name.ilike.${term},contact_number.ilike.${term}`);
    }

    const { data, count, error } = await query;

    if (error) {
      toast.error(error.message);
      return;
    }

    setSuppliers(data || []);
    setTotalCount(count || 0);
  };

  useEffect(() => {
    fetchSuppliers();
  }, [page, pageSize, searchTerm, dateRange]);

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
      setSelectedIds(suppliers.map((sup) => String(sup.id)));
    } else {
      setSelectedIds([]);
    }
  };

  // Define columns
  const columns = [
    {
      header: "Created At",
      accessor: (row: Supplier) => {
        if (!row.created_at) return "";
        const date = new Date(row.created_at);
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
      },
    },
    {
      header: "Name",
      accessor: (row: Supplier) => row.name || "-",
    },
    {
      header: "Contact Number",
      accessor: (row: Supplier) => row.contact_number || "-",
    },
    {
      header: "Action",
      accessor: (row: Supplier) => (
        <div className="d-flex gap-2 justify-content-center">
          {/* View Button */}
          <button
            className="btn btn-success"
            onClick={() => {
              setSelectedSupplierId(row.id!);
              setViewModalOpen(true);
            }}
          >
            View
          </button>

          {/* Edit Button */}
          <button
            className="btn btn-warning"
            onClick={() => {
              setSelectedSupplierId(row.id!);
              setEditModalOpen(true);
            }}
          >
            Edit
          </button>

          {/* Delete Button */}
          <button
            className="btn btn-danger"
            onClick={async () => {
              if (!confirm(`Delete supplier "${row.name}"?`)) return;

              const { error } = await supabase
                .from("suppliers")
                .delete()
                .eq("id", row.id);

              if (error) {
                toast.error("Error deleting supplier");
                return;
              }

              toast.success("Supplier deleted!");
              fetchSuppliers();
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
      {/* TOOLBAR */}
      <div className="mb-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div className="d-flex flex-wrap align-items-center gap-2">
          {/* Add Button */}
          <AddButton
            table="suppliers"
            onSuccess={fetchSuppliers}
            fields={[
              { key: "name", label: "Supplier Name", type: "text" },
              {
                key: "contact_number",
                label: "Contact Number",
                type: "number",
                placeholder: "Must be 11 digits:09918895977",
              },
            ]}
          />

          {/* Bulk Edit */}
          <BulkEdit
            table="suppliers"
            selectedIds={selectedIds}
            onSuccess={fetchSuppliers}
            fields={[
              { key: "name", label: "Supplier Name", type: "text" },
              {
                key: "contact_number",
                label: "Contact Number",
                type: "number",
                placeholder: "Must be 11 digits:09918895977",
              },
            ]}
          />

          {/* Import */}
          <ImportButton
            table="suppliers"
            headersMap={{
              Name: "name",
              "Contact Number": "contact_number",
              "Created At": "created_at",
            }}
            onSuccess={fetchSuppliers}
          />

          {/* Export */}
          <ExportButton
            data={suppliers}
            filename="suppliers.csv"
            headersMap={{
              "Created At": (row) => row.created_at || "",
              Name: "name",
              "Contact Number": "contact_number",
            }}
          />

          {/* Delete Selected */}
          <ConfirmDelete
            confirmMessage="Delete selected suppliers?"
            onConfirm={async () => {
              if (!selectedIds.length) {
                toast.error("No suppliers selected");
                return;
              }
              const { error } = await supabase
                .from("suppliers")
                .delete()
                .in("id", selectedIds);
              if (error) {
                toast.error(error.message);
                return;
              }
              setSelectedIds([]);
              toast.success("Suppliers deleted!");
              fetchSuppliers();
            }}
          >
            Delete Selected
          </ConfirmDelete>
        </div>

        {/* Right side: Search, Date */}
        <div className="d-flex align-items-center gap-2">
          <SearchBar
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={setSearchTerm}
            storageKey="suppliers_search"
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
        data={suppliers}
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
      <ViewSuppliersModal
        isOpen={viewModalOpen}
        supplierId={selectedSupplierId}
        onClose={() => setViewModalOpen(false)}
      />

      {/* Edit Modal */}
      <EditSuppliersModal
        isOpen={editModalOpen}
        supplierId={selectedSupplierId}
        onClose={() => setEditModalOpen(false)}
        onSuccess={fetchSuppliers}
      />
    </div>
  );
}