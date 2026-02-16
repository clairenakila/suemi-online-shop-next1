"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ItemTable from "../items/ItemTable";
import ViewCategoriesModal from "./ViewCategoriesModal";
import EditCategoriesModal from "./EditCategoriesModal";

interface Category {
  id: string;
  description: string;
  created_at?: string;
}

export default function CategoriesTable() {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [totalCount, setTotalCount] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState<string>("");

  // ✅ ADD: Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Fetch categories from Supabase
  const fetchCategories = async () => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count } = await supabase
      .from("categories")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    setCategories(data || []);
    setTotalCount(count || 0);
  };

  useEffect(() => {
    fetchCategories();
  }, [page, pageSize]);

  // ✅ ADD: Toggle individual checkbox
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id],
    );
  };

  // ✅ ADD: Toggle select all
const handleToggleSelectAll = (checked: boolean) => {
  if (checked) {
    // Select all VISIBLE items on current page
    setSelectedIds(categories.map((cat) => String(cat.id)));
  } else {
    setSelectedIds([]);
  }
};

  // Define columns
  const columns = [
    {
      header: "Created At",
      accessor: (row: Category) => {
        if (!row.created_at) return "";
        const date = new Date(row.created_at);
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const year = date.getFullYear().toString().slice(-2);
        return `${month}-${day}-${year}`;
      },
    },
    {
      header: "Description",
      accessor: (row: Category) => row.description,
    },
    {
      header: "Action",
      accessor: (row: Category) => (
        <div className="d-flex gap-2 justify-content-center">
          {/* View Button */}
          {/* View Button */}
          <button
            className="btn btn-success"
            onClick={() => {
              setSelectedCategoryId(row.id!);
              setViewModalOpen(true);
            }}
          >
            View
          </button>

          {/* Edit Button */}
          <button
            className="btn btn-warning"
            onClick={() => {
              setEditCategoryId(row.id!);
              setEditModalOpen(true);
            }}
          >
            Edit
          </button>

          {/* Delete Button */}
          <button
            className="btn btn-danger"
            onClick={async () => {
              if (!confirm(`Delete "${row.description}"?`)) return;

              const { error } = await supabase
                .from("categories")
                .delete()
                .eq("id", row.id);

              if (error) {
                alert("Error deleting category");
                return;
              }

              alert("Category deleted!");
              fetchCategories();
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
      <ItemTable
        data={categories}
        columns={columns}
        rowKey="id"
        selectable={true} // ✅ ADD: Enable checkboxes
        selectedIds={selectedIds} // ✅ ADD: Pass selected IDs
        onToggleSelect={handleToggleSelect} // ✅ ADD: Individual toggle
        onToggleSelectAll={handleToggleSelectAll} // ✅ ADD: Select all toggle
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
      <ViewCategoriesModal
        isOpen={viewModalOpen}
        categoryId={selectedCategoryId}
        onClose={() => setViewModalOpen(false)}
      />
      <EditCategoriesModal
        isOpen={editModalOpen}
        categoryId={editCategoryId}
        onClose={() => setEditModalOpen(false)}
        onSuccess={fetchCategories}
      />
    </div>
  );
}
