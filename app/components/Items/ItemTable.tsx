"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { DataTable } from "../DataTable";

// Add interface for Item
interface Item {
  id: string;
  name: string;
  price: number;
  stock: number;
  created_at?: string;
}

export default function ItemTable() {
  // Add type to useState
  const [items, setItems] = useState<Item[]>([]);

  // Auto-fetch items
  const fetchItems = async () => {
    const { data } = await supabase
      .from("items") // ← SPECIFIC to items table
      .select("*")
      .order("created_at", { ascending: false });

    setItems(data || []);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Columns specific to items
  const columns = [
    {
      header: "Name",
      accessor: (row: Item) => row.name,
    },
    {
      header: "Price",
      accessor: (row: Item) => `₱${row.price?.toFixed(2) || "0.00"}`,
    },
    {
      header: "Stock",
      accessor: (row: Item) => row.stock?.toString() || "0",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Items List</h2>
      <DataTable
        data={items}
        columns={columns}
        rowKey="id" 
        page={1} 
        pageSize={10} 
        totalCount={items.length} 
        onPageChange={() => {}} 
        onPageSizeChange={() => {}} 
      />
    </div>
  );
}
