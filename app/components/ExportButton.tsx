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
    link.href = URL.createObjectURL(blob);
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
            let val: any =
              typeof col.accessor === "function"
                ? col.accessor(row)
                : row[col.accessor as keyof T];

            if (val === null || val === undefined) return "";

            // If it’s a rate column (number), force 2 decimals
            if (col.header === "Hourly Rate" || col.header === "Daily Rate") {
              if (typeof val === "number") val = val.toFixed(2);
            }

            return `"${val.toString().replace(/"/g, '""')}"`;
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
