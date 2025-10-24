"use client";

import React, { ReactNode } from "react";

export type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
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
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  selectable = false,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  rowKey,
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div>
      <div className="table-responsive" style={{ maxHeight: "70vh" }}>
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

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-2 flex-wrap gap-2">
        <div>
          Show{" "}
          <select
            className="form-select d-inline-block w-auto"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {[50, 100, 200, 500].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>{" "}
          entries
        </div>

        <div>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
            .map((p) => (
              <button
                key={p}
                className={`btn btn-sm ${
                  p === page ? "btn-primary" : "btn-outline-secondary"
                } mx-1`}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            ))}
        </div>

        <div>
          Showing {(page - 1) * pageSize + 1}–
          {Math.min(page * pageSize, totalCount)} of {totalCount} entries
        </div>
      </div>
    </div>
  );
}
