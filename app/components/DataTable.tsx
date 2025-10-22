"use client";

import React, { ReactNode } from "react";

export type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string;
  center?: boolean;
};

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  selectable?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: (checked: boolean) => void;
  rowKey: keyof T;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  selectable = false,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  rowKey,
}: DataTableProps<T>) {
  return (
    <div
      className="table-responsive"
      style={{ maxHeight: "70vh", overflowY: "auto" }}
    >
      <table className="table table-bordered table-striped">
        <thead className="table-light sticky-top">
          <tr>
            {selectable && (
              <th className="text-center">
                <input
                  type="checkbox"
                  checked={
                    selectedIds.length === data.length && data.length > 0
                  }
                  onChange={(e) => onToggleSelectAll?.(e.target.checked)}
                />
              </th>
            )}
            {columns.map((col, idx) => (
              <th key={idx} className={col.center ? "text-center" : ""}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={selectable ? columns.length + 1 : columns.length}
                className="text-center"
              >
                No records found.
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row[rowKey]}>
                {selectable && (
                  <td className="text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row[rowKey])}
                      onChange={() => onToggleSelect?.(row[rowKey])}
                    />
                  </td>
                )}
                {columns.map((col, idx) => {
                  const value =
                    typeof col.accessor === "function"
                      ? col.accessor(row)
                      : row[col.accessor];
                  return (
                    <td key={idx} className={col.center ? "text-center" : ""}>
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
