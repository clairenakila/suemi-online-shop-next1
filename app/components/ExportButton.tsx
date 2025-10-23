"use client";

import React from "react";
import toast from "react-hot-toast";

interface ExportButtonProps<T extends Record<string, any>> {
  data: T[];
  selectedIds: string[];
  filename?: string;
  rowKey?: keyof T; // defaults to "id"
}

export default function ExportButton<T extends Record<string, any>>({
  data,
  selectedIds,
  filename = "export.csv",
  rowKey = "id" as keyof T,
}: ExportButtonProps<T>) {
  const handleExport = () => {
    if (!selectedIds.length) {
      toast.error("Please select records to export.");
      return;
    }

    const selectedData = data.filter((row) =>
      selectedIds.includes(String(row[rowKey]))
    );

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
    if (rows.length === 0) return "";

    const headers = Object.keys(rows[0]);
    const csvRows = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((h) => {
            const val = row[h];
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
        backgroundColor: "#e11d48", // rose color
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
