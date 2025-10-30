"use client";

import React, { ReactNode, useMemo } from "react";

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

/**
 * DataTable component
 * - Shows server-side paginated data (no frontend slicing)
 * - Keeps pagination controls and size selector
 * - All records come directly from the DB
 */
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
  // Sort data for display
  const sortedData = useMemo(() => {
    if (!data?.length) return [];
    if ("created_at" in data[0]) {
      return [...data].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    if ("timestamp" in data[0]) {
      return [...data].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }
    return data;
  }, [data]);

  // All rows are from DB (no frontend pagination)
  const rowsToRender = sortedData;

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div>
      {/* Selected rows count */}
      {selectable && selectedIds.length > 0 && (
        <div className="mb-2 text-sm text-muted">
          {selectedIds.length} row{selectedIds.length > 1 ? "s" : ""} selected
        </div>
      )}

      {/* Table */}
      <div className="table-responsive" style={{ maxHeight: "70vh" }}>
        <table className="table table-bordered table-striped">
          <thead className="table-light sticky-top">
            <tr>
              {selectable && (
                <th className="text-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === rowsToRender.length &&
                      rowsToRender.length > 0
                    }
                    onChange={(e) => onToggleSelectAll?.(e.target.checked)}
                  />
                </th>
              )}
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`${
                    col.center ? "text-center" : ""
                  } fw-semibold text-nowrap`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rowsToRender.length === 0 ? (
              <tr>
                <td
                  colSpan={selectable ? columns.length + 1 : columns.length}
                  className="text-center py-4 text-secondary"
                >
                  No records found.
                </td>
              </tr>
            ) : (
              rowsToRender.map((row) => (
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
                      <td
                        key={idx}
                        className={col.center ? "text-center" : ""}
                        style={{ verticalAlign: "middle" }}
                      >
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

      {/* Pagination footer */}
      <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
        <div>
          Show{" "}
          <select
            className="form-select d-inline-block w-auto"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {[100, 500, 700, 1000].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>{" "}
          entries
        </div>

        <div className="d-flex flex-wrap align-items-center justify-content-center">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
            .map((p) => (
              <button
                key={p}
                className={`btn btn-sm mx-1 ${
                  p === page ? "btn-primary" : "btn-outline-secondary"
                }`}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            ))}
        </div>

        <div className="text-muted small">
          Showing {(page - 1) * pageSize + 1}–
          {Math.min(page * pageSize, totalCount)} of {totalCount} entries
        </div>
      </div>
    </div>
  );
}
