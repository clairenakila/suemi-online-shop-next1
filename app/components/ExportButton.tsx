"use client";

import React from "react";
import toast from "react-hot-toast";
import { Column } from "./DataTable";

interface ExportButtonProps<T extends Record<string, any>> {
  data: T[];
  selectedIds: string[];
  columns: Column<T>[];
  filename?: string;
  rowKey?: keyof T;
}

export default function ExportButton<T extends Record<string, any>>({
  data,
  selectedIds,
  columns,
  filename = "export.csv",
  rowKey = "id" as keyof T,
}: ExportButtonProps<T>) {
  const handleExport = () => {
    // Use all rows if nothing selected
    const selectedData =
      selectedIds.length > 0
        ? data.filter((row) => selectedIds.includes(String(row[rowKey] ?? "")))
        : data;

    if (!selectedData.length) {
      toast.error("No matching records found.");
      return;
    }

    const csv = convertToCSV(selectedData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Exported successfully!");
  };

  const convertToCSV = (rows: T[]): string => {
    if (!columns.length || !rows.length) return "";

    const headers = columns.map((col) => col.header);

    const csvRows = [
      headers.join(","),
      ...rows.map((row) =>
        columns
          .map((col) => {
            let val: any;
            if (typeof col.accessor === "function") val = col.accessor(row);
            else val = row[col.accessor as keyof T];
            if (val === null || val === undefined) return "";
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ];

    return csvRows.join("\n");
  };

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 text-white shadow-md transition"
      style={{
        backgroundColor: "#e11d48",
        borderRadius: "4px",
        fontWeight: 500,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#be123c")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#e11d48")}
    >
      Export
    </button>
  );
}
