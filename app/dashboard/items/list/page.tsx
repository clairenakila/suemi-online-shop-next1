"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "@/lib/supabase";

import SearchBar from "../../../components/SearchBar";
import ConfirmDelete from "../../../components/ConfirmDelete";
import { DataTable, Column } from "../../../components/DataTable";
import BulkEdit from "../../../components/BulkEdit";
import DateRangePicker from "../../../components/DateRangePicker";
import ToggleColumns from "../../../components/ToggleColumns";
import ImportButton from "../../../components/ImportButton";
import ExportButton from "../../../components/ExportButton";
import AddItemModal from "../../../components/AddItemModal";

import {
  formatDate,
  applyDiscount,
  calculateOrderIncome,
  calculateCommissionRate,
  parseExcelDate,
} from "../../../utils/validator";

interface Item {
  id?: string;
  timestamp?: string;
  prepared_by?: string;
  brand?: string;
  order_id?: string;
  shoppee_commission?: string;
  selling_price?: string;
  is_returned?: string;
  quantity?: string;
  live_seller?: string;
  capital?: string;
  order_income?: string;
  category?: string;
  mined_from?: string;
  discount?: string;
  date_shipped?: string;
  date_returned?: string;
}

export default function SoldItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState<{
    startDate: string | null;
    endDate: string | null;
  }>({ startDate: null, endDate: null });
  const [showAddModal, setShowAddModal] = useState(false);

  const [newItem, setNewItem] = useState<Item>({
    timestamp: new Date().toISOString(),
    prepared_by: "",
    brand: "",
    order_id: "",
    shoppee_commission: "0",
    selling_price: "0",
    quantity: "1",
    capital: "0",
    order_income: "0",
    discount: "0",
    live_seller: "",
    category: "",
    mined_from: "",
    date_shipped: "",
    date_returned: "",
    is_returned: "No",
  });

  // Fetch items
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase.from("items").select("*");
    if (error) return toast.error(error.message);

    const mapped = (data || []).map((i) => ({
      ...i,
      category: i.category?.toString() || "",
      timestamp: parseExcelDate(i.timestamp),
      date_shipped: parseExcelDate(i.date_shipped),
      date_returned: parseExcelDate(i.date_returned),
    }));

    setItems(mapped);
  };

  // Selection
  const toggleSelectItem = (id: string) =>
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleSelectAll = (checked: boolean) =>
    setSelectedItems(checked ? items.map((i) => i.id!) : []);

  // Filter by search & date
  const filteredItems = items.filter((i) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = [
      i.brand,
      i.order_id,
      i.prepared_by,
      i.live_seller,
      i.mined_from,
      i.category,
    ].some((val) => val?.toLowerCase().includes(term));

    let matchesDateRange = true;
    if (dateRange.startDate && dateRange.endDate && i.timestamp) {
      const ts = new Date(i.timestamp);
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      matchesDateRange = ts >= start && ts <= end;
    }

    return matchesSearch && matchesDateRange;
  });

  // Table columns
  const columns: Column<Item>[] = [
    { header: "Timestamp", accessor: (row) => formatDate(row.timestamp) },
    { header: "Mined From", accessor: "mined_from" },
    { header: "Prepared By", accessor: "prepared_by" },
    { header: "Category", accessor: "category" },
    { header: "Brand", accessor: "brand" },
    { header: "Quantity", accessor: "quantity" },
    { header: "Live Seller", accessor: "live_seller" },
    { header: "Order ID", accessor: "order_id" },
    { header: "Capital", accessor: "capital" },
    {
      header: "Selling Price",
      accessor: (row) =>
        applyDiscount(row.selling_price || "0", row.discount || "0"),
    },
    { header: "Discount", accessor: "discount" },
    { header: "Shoppee Commission", accessor: "shoppee_commission" },
    {
      header: "Order Income",
      accessor: (row) =>
        calculateOrderIncome(
          applyDiscount(row.selling_price || "0", row.discount || "0"),
          row.shoppee_commission || "0"
        ),
    },
    {
      header: "Commission Rate (%)",
      accessor: (row) =>
        calculateCommissionRate(
          applyDiscount(row.selling_price || "0", row.discount || "0"),
          row.shoppee_commission || "0"
        ),
    },
    {
      header: "Action",
      accessor: (row) => (
        <ConfirmDelete
          confirmMessage={`Are you sure you want to delete item ${row.id}?`}
          onConfirm={async () => {
            const { error } = await supabase
              .from("items")
              .delete()
              .eq("id", row.id!);
            if (error) throw error;
            fetchItems();
          }}
        >
          Delete
        </ConfirmDelete>
      ),
      center: true,
    },
  ];

  const [tableColumns, setTableColumns] = useState<Column<Item>[]>(columns);

  return (
    <div className="container my-5">
      <Toaster />
      <h3 className="mb-4">Sold Items</h3>

      {/* Toolbar */}
      <div className="mb-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            Add Item
          </button>
          <AddItemModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSuccess={fetchItems}
          />

          <BulkEdit
            table="items"
            selectedIds={selectedItems}
            onSuccess={fetchItems}
            fields={[
              { key: "brand", label: "Brand", type: "text" },
              { key: "order_id", label: "Order ID", type: "text" },
              { key: "selling_price", label: "Selling Price", type: "number" },
              { key: "quantity", label: "Quantity", type: "number" },
              { key: "capital", label: "Capital", type: "number" },
              { key: "category", label: "Category", type: "text" },
            ]}
          />

          <ImportButton
            table="items"
            headersMap={{
              Timestamp: "timestamp",
              "Prepared By": "prepared_by",
              Brand: "brand",
              "Order ID": "order_id",
              "Shoppee Commission": "shoppee_commission",
              "Selling Price": "selling_price",
              Quantity: "quantity",
              Capital: "capital",
              "Order Income": "order_income",
              Discount: "discount",
              "Live Seller": "live_seller",
              Category: "category",
              "Mined From": "mined_from",
            }}
            onSuccess={fetchItems}
          />

          <ExportButton
            data={filteredItems}
            headersMap={{
              Timestamp: (row) => row.timestamp || "",
              "Prepared By": "prepared_by",
              Brand: "brand",
              "Order ID": "order_id",
              "Shoppee Commission": "shoppee_commission",
              "Selling Price": "selling_price",
              Quantity: "quantity",
              Capital: "capital",
              "Order Income": "order_income",
              Discount: "discount",
              "Live Seller": "live_seller",
              Category: "category",
              "Mined From": "mined_from",
            }}
            filename="sold_items.xlsx"
          />

          <ConfirmDelete
            confirmMessage="Are you sure you want to delete selected items?"
            onConfirm={async () => {
              if (!selectedItems.length) throw new Error("No items selected");
              const { error } = await supabase
                .from("items")
                .delete()
                .in("id", selectedItems);
              if (error) throw error;
              setSelectedItems([]);
              fetchItems();
            }}
          >
            Delete Selected
          </ConfirmDelete>
        </div>

        <div className="d-flex align-items-center gap-2">
          <SearchBar
            placeholder="Search items..."
            value={searchTerm}
            onChange={setSearchTerm}
            options={items.map((i) => i.brand || "")}
          />
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="p-2 bg-light border rounded-3 d-flex align-items-center justify-content-center shadow-sm"
            style={{ borderRadius: "12px", width: "42px", height: "42px" }}
            title="Filter by date created"
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

      <DataTable
        data={filteredItems}
        columns={tableColumns}
        selectable
        selectedIds={selectedItems}
        onToggleSelect={toggleSelectItem}
        onToggleSelectAll={toggleSelectAll}
        rowKey="id"
        defaultRecordsPerPage={50}
      />
    </div>
  );
}
