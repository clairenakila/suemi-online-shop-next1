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
import AddButton from "../../../components/AddButton";
import { formatNumberForText } from "../../../utils/validator";

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
  category?: string; // treat as text
  mined_from?: string;
  discount?: string;
  discounted_selling_price?: string;
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
    }));

    setItems(mapped);
  };

  // Selection
  const toggleSelectItem = (id: string) =>
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );

  const toggleSelectAll = (checked: boolean) =>
    setSelectedItems(checked ? items.map((i) => i.id!) : []);

  // Filtering
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

  // Columns
  const columns: Column<Item>[] = [
    {
      header: "Timestamp",
      accessor: (row) =>
        row.timestamp ? new Date(row.timestamp).toLocaleString() : "",
    },
    { header: "Prepared By", accessor: "prepared_by" },
    { header: "Brand", accessor: "brand" },
    { header: "Order ID", accessor: "order_id" },
    { header: "Shoppee Commission", accessor: "shoppee_commission" },
    { header: "Selling Price", accessor: "selling_price" },
    { header: "Quantity", accessor: "quantity" },
    { header: "Capital", accessor: "capital" },
    { header: "Order Income", accessor: "order_income" },
    { header: "Discount", accessor: "discount" },
    {
      header: "Discounted Selling Price",
      accessor: "discounted_selling_price",
    },
    { header: "Live Seller", accessor: "live_seller" },
    { header: "Category", accessor: "category" },
    { header: "Mined From", accessor: "mined_from" },
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
          <AddButton
            table="items"
            onSuccess={fetchItems}
            fields={[
              { key: "timestamp", label: "Timestamp", type: "datetime" },
              { key: "prepared_by", label: "Prepared By", type: "text" },
              { key: "brand", label: "Brand", type: "text" },
              { key: "order_id", label: "Order ID", type: "text" },
              {
                key: "shoppee_commission",
                label: "Shoppee Commission",
                type: "float",
                defaultValue: 0,
              },
              {
                key: "selling_price",
                label: "Selling Price",
                type: "float",
                defaultValue: 0,
              },
              {
                key: "quantity",
                label: "Quantity",
                type: "number",
                defaultValue: 1,
              },
              {
                key: "capital",
                label: "Capital",
                type: "float",
                defaultValue: 0,
              },
              {
                key: "order_income",
                label: "Order Income",
                type: "float",
                defaultValue: 0,
              },
              {
                key: "discount",
                label: "Discount",
                type: "float",
                defaultValue: 0,
              },
              {
                key: "discounted_selling_price",
                label: "Discounted Selling Price",
                type: "float",
                defaultValue: 0,
              },
              { key: "live_seller", label: "Live Seller", type: "text" },
              { key: "category", label: "Category", type: "text" },
              { key: "mined_from", label: "Mined From", type: "text" },
              { key: "date_shipped", label: "Date Shipped", type: "datetime" },
              {
                key: "date_returned",
                label: "Date Returned",
                type: "datetime",
              },
              {
                key: "is_returned",
                label: "Is Returned?",
                type: "select",
                options: ["Yes", "No"],
              },
            ]}
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
              "Discounted Selling Price": "discounted_selling_price",
              "Live Seller": "live_seller",
              Category: "category",
              "Mined From": "mined_from",
            }}
            transformRow={(row) => ({
              ...row,
              selling_price: formatNumberForText(row.selling_price),
              shoppee_commission: formatNumberForText(row.shoppee_commission),
              capital: formatNumberForText(row.capital),
              order_income: formatNumberForText(row.order_income),
              discount: formatNumberForText(row.discount),
              discounted_selling_price: formatNumberForText(
                row.discounted_selling_price
              ),
              category: row.category,
            })}
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
              "Discounted Selling Price": "discounted_selling_price",
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

        {/* Search + Calendar */}
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
