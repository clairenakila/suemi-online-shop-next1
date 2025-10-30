"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "@/lib/supabase";

import SearchBar from "../../../components/SearchBar";
import ConfirmDelete from "../../../components/ConfirmDelete";
import { DataTable, Column } from "../../../components/DataTable";
import AddButton from "../../../components/AddButton";
import BulkEdit from "../../../components/BulkEdit";
import ExportButton from "../../../components/ExportButton";
import ImportButton from "../../../components/ImportButton";
import ToggleColumns from "../../../components/ToggleColumns";

interface Category {
  id?: string;
  description: string;
  created_at?: string;
}

export default function CategoriesListPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tableColumns, setTableColumns] = useState<Column<Category>[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) return toast.error(error.message);
    setCategories(data || []);
  };

  // Selection
  const toggleSelectCategory = (id: string) =>
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  const toggleSelectAll = (checked: boolean) =>
    setSelectedCategories(checked ? categories.map((c) => c.id!) : []);

  // Filtering
  const filteredCategories = categories.filter((c) =>
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Columns
  const columns: Column<Category>[] = [
    {
      header: "Created At",
      accessor: (row) =>
        row.created_at ? new Date(row.created_at).toLocaleDateString() : "",
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

  useEffect(() => {
    setTableColumns(columns);
  }, []);

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

          {/* Import with safe transform */}
          <ImportButton
            table="categories"
            headersMap={{
              "Created At": "created_at", // optional
              Description: "description",
            }}
            transformRow={async (row) => {
              const description = row.Description?.toString().trim();
              if (!description) return null; // skip empty rows

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
              "Created At": (row) => row.created_at || "",
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

        {/* Search + Toggle Columns */}
        <div className="d-flex align-items-center gap-2">
          <SearchBar
            placeholder="Search categories..."
            value={searchTerm}
            onChange={setSearchTerm}
            options={categories.map((c) => c.description)}
          />

          <ToggleColumns columns={columns} onChange={setTableColumns} />
        </div>
      </div>

      <DataTable<Category>
        data={filteredCategories}
        columns={tableColumns}
        selectable
        selectedIds={selectedCategories}
        onToggleSelect={toggleSelectCategory}
        onToggleSelectAll={toggleSelectAll}
        rowKey="id"
        page={1}
        pageSize={50}
        totalCount={filteredCategories.length}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
      />
    </div>
  );
}
