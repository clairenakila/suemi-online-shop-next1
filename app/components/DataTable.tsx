"use client";

import React, { ReactNode, useState, useMemo } from "react";

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
  defaultRecordsPerPage?: number;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  selectable = false,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  rowKey,
  defaultRecordsPerPage = 2,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(defaultRecordsPerPage);

  // Compute total pages
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(data.length / recordsPerPage)),
    [data.length, recordsPerPage]
  );

  // Ensure current page is always valid
  if (currentPage > totalPages) setCurrentPage(totalPages);

  const startIdx = (currentPage - 1) * recordsPerPage;
  const paginatedData = useMemo(
    () => data.slice(startIdx, startIdx + recordsPerPage),
    [data, startIdx, recordsPerPage]
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleRecordsPerPageChange = (value: number) => {
    const newTotalPages = Math.max(1, Math.ceil(data.length / value));
    setRecordsPerPage(value);
    setCurrentPage((prev) => Math.min(prev, newTotalPages));
  };

  return (
    <div>
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
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={selectable ? columns.length + 1 : columns.length}
                  className="text-center"
                >
                  No records found.
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
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

      {/* Pagination Controls */}
      <div className="d-flex justify-content-between align-items-center mt-2 flex-wrap gap-2">
        {/* Show entries */}
        <div>
          <label>
            Show{" "}
            <select
              className="form-select d-inline-block w-auto"
              value={recordsPerPage}
              onChange={(e) =>
                handleRecordsPerPageChange(Number(e.target.value))
              }
            >
              {[2, 10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>{" "}
            entries
          </label>
        </div>

        {/* Page buttons (if more than 1 page) */}
        {totalPages > 1 && (
          <div>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`btn btn-sm ${
                  page === currentPage ? "btn-primary" : "btn-outline-secondary"
                } mx-1`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>
        )}

        {/* Always show X to Y of Z entries */}
        <div>
          Showing {data.length === 0 ? 0 : startIdx + 1} to{" "}
          {Math.min(startIdx + recordsPerPage, data.length)} of {data.length}{" "}
          entries
        </div>
      </div>
    </div>
  );
}
