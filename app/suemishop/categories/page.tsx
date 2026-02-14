"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "@/lib/supabase";

import SearchBar from "../../components/SearchBar";
import ConfirmDelete from "../../components/ConfirmDelete";
import { DataTable, Column } from "../../components/DataTable";
import AddButton from "../../components/AddButton";
import BulkEdit from "../../components/BulkEdit";
import ImportButton from "../../components/ImportButton";
import ExportButton from "../../components/ExportButton";
import ToggleColumns from "../../components/ToggleColumns";
import CategoriesTable from "../../components/categories/CategoriesTable";
import DateRangePicker from "../../components/DateRangePicker";

interface Category {
  id?: string;
  description: string;
  created_at?: string;
}

export default function CategoriesListPage() {
  // ✅ All states INSIDE component
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tableColumns, setTableColumns] = useState<Column<Category>[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  
  // ✅ Date picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState<{
    startDate: string | null;
    endDate: string | null;
  }>({
    startDate: null,
    endDate: null,
  });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("categories")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      // ✅ ADD: Date range filter
      if (dateRange.startDate && dateRange.endDate) {
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        end.setHours(23, 59, 59, 999);
        query = query
          .gte("created_at", start.toISOString())
          .lte("created_at", end.toISOString());
      }

      if (searchTerm.trim()) {
        query = query.ilike("description", `%${searchTerm.trim()}%`);
      }

      const { data, error, count } = await query;
      if (error) {
        toast.error(error.message);
        return;
      }

      setCategories(data || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, pageSize, searchTerm, dateRange]); // ✅ Add dateRange

  // Column definitions
  useEffect(() => {
    const cols: Column<Category>[] = [
      {
        header: "Created At",
        accessor: (row) => {
          if (!row.created_at) return "";
          const date = new Date(row.created_at);
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const day = date.getDate().toString().padStart(2, "0");
          const year = date.getFullYear().toString().slice(-2);
          return `${month}-${day}-${year}`;
        },
      },
      { header: "Description", accessor: "description" },
      {
        header: "Action",
        accessor: (row) => (
          <ConfirmDelete
            confirmMessage={`Are you sure you want to delete "${row.description}"?`}
            onConfirm={async () => {
              const { error } = await supabase
                .from("categories")
                .delete()
                .eq("id", row.id!);
              if (error) {
                toast.error(error.message);
                return;
              }
              toast.success("Category deleted successfully");
              fetchCategories();
            }}
          >
            Delete
          </ConfirmDelete>
        ),
        center: true,
      },
    ];
    setTableColumns(cols);
  }, []);

  // Selection handlers
  const toggleSelectCategory = (id: string) =>
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id],
    );

  const toggleSelectAll = (checked: boolean) =>
    setSelectedCategories(checked ? categories.map((c) => c.id!) : []);

  const filteredCategories = categories.filter((c) =>
    c.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="container my-5">
      <Toaster />
      <h3 className="mb-4">Categories Management</h3>

      {/* Toolbar */}
      <div className="mb-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <AddButton
            table="categories"
            onSuccess={fetchCategories}
            fields={[
              { key: "description", label: "Description", type: "text" },
            ]}
          />

          <BulkEdit
            table="categories"
            selectedIds={selectedCategories}
            onSuccess={fetchCategories}
            fields={[
              { key: "description", label: "Description", type: "text" },
            ]}
          />

          <ImportButton
            table="categories"
            headersMap={{
              "Created At": "created_at",
              Description: "description",
            }}
            transformRow={async (row) => {
              const description = row.Description?.toString().trim();
              if (!description) return null;

              let created_at: string | undefined;
              if (row["Created At"]) {
                const date = new Date(row["Created At"]);
                if (!isNaN(date.getTime())) created_at = date.toISOString();
              }
              return { description, ...(created_at ? { created_at } : {}) };
            }}
            onSuccess={async () => {
              await fetchCategories();
              toast.success("✅ Categories imported successfully");
            }}
          />

          <ExportButton
            data={filteredCategories}
            headersMap={{
              "Created At": (row) => {
                if (!row.created_at) return "";
                const date = new Date(row.created_at);
                const month = (date.getMonth() + 1).toString().padStart(2, "0");
                const day = date.getDate().toString().padStart(2, "0");
                const year = date.getFullYear().toString().slice(-2);
                return `${month}-${day}-${year}`;
              },
              Description: "description",
            }}
            filename="categories.csv"
          />

          <ConfirmDelete
            confirmMessage="Are you sure you want to delete selected categories?"
            onConfirm={async () => {
              if (!selectedCategories.length)
                throw new Error("No categories selected");
              const { error } = await supabase
                .from("categories")
                .delete()
                .in("id", selectedCategories);
              if (error) {
                toast.error(error.message);
                return;
              }
              setSelectedCategories([]);
              fetchCategories();
            }}
          >
            Delete Selected
          </ConfirmDelete>
        </div>

        {/* Search + Date Toggle + Toggle Columns */}
        <div className="d-flex align-items-center gap-2">
          <SearchBar
            placeholder="Search categories..."
            value={searchTerm}
            onChange={setSearchTerm}
            options={categories.map((c) => c.description)}
          />
          
          {/* ✅ Date Toggle Button */}
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="p-2 bg-light border rounded-3 shadow-sm"
            style={{ borderRadius: "12px", width: "42px", height: "42px" }}
            title="Filter by date created"
          >
            <i className="bi bi-calendar3 fs-5 text-secondary"></i>
          </button>
          
          
        </div>
      </div>

      {/* ✅ Date Range Picker (collapsible) */}
      {showDatePicker && (
        <div className="bg-white p-3 shadow-md rounded-4 mb-3 w-fit">
          <DateRangePicker onChange={setDateRange} />
        </div>
      )}

      <CategoriesTable />
    </div>
  );
}