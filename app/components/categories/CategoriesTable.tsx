"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { DataTable } from "../DataTable";

// Interface for Category
interface Category {
  id: string;
  description: string;
  created_at?: string;
}

export default function CategoriesTable() {
  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);

  // Auto-fetch categories
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

  // Columns specific to categories
  const columns = [
    { 
      header: "Created At", 
      accessor: (row: Category) => {
        if (!row.created_at) return "";
        const date = new Date(row.created_at);
        return date.toLocaleDateString();
      }
    },
    { 
      header: "Description", 
      accessor: (row: Category) => row.description 
    },
  ];

  return (
    <div>
      
      <DataTable 
        data={categories} 
        columns={columns}
        rowKey="id"
        selectable={false}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}