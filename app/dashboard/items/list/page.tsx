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
import { formatDateShort, dateNoTimezone } from "../../../utils/validator";
import AddItemModal from "../../../components/AddItemModal";

import {
  formatDate,
  applyDiscount,
  calculateOrderIncome,
  calculateCommissionRate,
  parseExcelDate,
} from "../../../utils/validator";
import { timeStamp } from "console";

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

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [totalCount, setTotalCount] = useState(0);
  const [employees, setEmployees] = useState<string[]>([]);
  // Fetch employees on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("name")
        .eq("is_employee", "Yes");

      if (error) toast.error(error.message);
      else setEmployees(data?.map((u) => u.name) || []);
    };

    fetchEmployees();
  }, []);
  // Fetch items with real pagination + search
  useEffect(() => {
    fetchItems();
  }, [page, pageSize, searchTerm, dateRange]);

  const fetchItems = async () => {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("items")
        .select("*", { count: "exact" })
        .order("timestamp", { ascending: false })
        .range(from, to);

      // --- Date filter ---
      if (dateRange.startDate && dateRange.endDate) {
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        end.setHours(23, 59, 59, 999);
        query = query
          .gte("timestamp", start.toISOString())
          .lte("timestamp", end.toISOString());
      }

      // --- Search filter on text columns only ---
      const searchableColumns = [
        "prepared_by",
        "brand",
        "order_id",
        "live_seller",
        "category",
        "mined_from",
        "shoppee_commission",
        "discount",
        "is_returned",
      ];

      if (searchTerm.trim()) {
        const term = `%${searchTerm.trim().toLowerCase()}%`;
        const orString = searchableColumns
          .map((col) => `${col}.ilike.${term}`)
          .join(",");

        if (orString) {
          query = query.or(orString);
          console.log("Supabase search filter:", orString); // debug log
        }
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("Supabase fetchItems error:", error);
        throw error;
      }

      console.log("Supabase data returned:", data); // debug log

      const mapped = (data || []).map((i) => ({
        ...i,
        timestamp: dateNoTimezone(i.timestamp),
        date_shipped: dateNoTimezone(i.date_shipped),
        date_returned: dateNoTimezone(i.date_returned),
      }));

      setItems(mapped);
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error("fetchItems error caught:", err);
      toast.error(err.message || "Failed to fetch items");
    }
  };

  //////////////

  // Selection
  const toggleSelectItem = (id: string) =>
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleSelectAll = (checked: boolean) =>
    setSelectedItems(checked ? items.map((i) => i.id!) : []);

  // Columns
  const columns: Column<Item>[] = [
    {
      header: "Timestamp",
      accessor: (row) => dateNoTimezone(row.timestamp),
    },
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
    { header: "Is Returned", accessor: "is_returned" },
    {
      header: "Date Returned",
      accessor: (row) => dateNoTimezone(row.date_returned),
    },
    {
      header: "Date Shipped",
      accessor: (row) => dateNoTimezone(row.date_shipped),
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
  //
  const [tableColumns, setTableColumns] = useState(columns);

  //define all bulk edit

  return (
    <div className="container my-5">
      <Toaster />
      <h3 className="mb-4">Sold Items</h3>

      {/* Toolbar */}
      <div className="mb-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <button
            className="btn btn-success"
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
            columns={2}
            fields={[
              {
                key: "mined_from",
                label: "Mined From",
                type: "select",
                options: ["Shoppee", "Facebook"],
              },

              {
                key: "prepared_by",
                label: "Prepared By",
                type: "select",
                options: employees,
              },
              { key: "brand", label: "Brand", type: "text" },
              { key: "category", label: "Category", type: "text" },

              { key: "order_id", label: "Order ID", type: "text" },
              { key: "selling_price", label: "Selling Price", type: "number" },
              { key: "quantity", label: "Quantity", type: "number" },
              { key: "capital", label: "Capital", type: "number" },
              {
                key: "shoppee_commission",
                label: "Shoppee Commission",
                type: "text",
              },
              {
                key: "discount",
                label: "Discount",
                type: "text",
              },
              {
                key: "is_returned",
                label: "Is Returned",
                type: "select",
                options: ["Yes", "No"],
              },
              {
                key: "date_returned",
                label: "Date Returned",
                placeholder: "Write it like this: 10-21-25",
                type: "text",
              },
              {
                key: "date_shipped",
                label: "Date Shipped",
                placeholder: "Write it like this: 10-21-25",
                type: "text",
              },
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
            data={items}
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
            storageKey="sold_items_search"
          />

          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="p-2 bg-light border rounded-3 shadow-sm"
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
        data={items}
        columns={tableColumns}
        selectable
        selectedIds={selectedItems}
        onToggleSelect={toggleSelectItem}
        onToggleSelectAll={toggleSelectAll}
        rowKey="id"
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
