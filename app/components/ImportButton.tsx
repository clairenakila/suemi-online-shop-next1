"use client";

import { useRef, useState, useEffect } from "react";
import Papa from "papaparse";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export interface ImportButtonProps {
  table: string;
  headersMap: Record<string, string>;
  onSuccess?: () => void;
  transformRow?: (row: Record<string, any>) => Record<string, any>;
  validateRow?: (row: Record<string, any>) => boolean;
}

export default function ImportButton({
  table,
  headersMap,
  onSuccess,
  transformRow,
  validateRow,
}: ImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prevent state update on every render
  const [fileName, setFileName] = useState<string | null>(null);

  // Normalize header names for matching
  const normalize = (str = "") =>
    str
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\u00A0/g, " ")
      .toLowerCase();

  // Parse CSV with PapaParse
  const parseCSV = async (file: File): Promise<Record<string, any>[]> =>
    new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim(),
        complete: (results) => resolve(results.data as Record<string, any>[]),
        error: (err) => reject(err),
      });
    });

  // Parse various date formats safely
  const parseDate = (value: string): string | null => {
    if (!value) return null;
    let parsed = Date.parse(value);

    // fallback for common ambiguous formats
    if (isNaN(parsed)) {
      const parts = value.split(/[-/]/).map((x) => x.trim());
      if (parts.length === 3) {
        const [a, b, c] = parts.map(Number);
        // MM-DD-YYYY
        if (a <= 12 && b <= 31 && c >= 1900)
          parsed = Date.parse(`${c}-${a}-${b}`);
        // DD-MM-YYYY
        else if (b <= 12 && a <= 31 && c >= 1900)
          parsed = Date.parse(`${c}-${b}-${a}`);
      }
    }

    return isNaN(parsed) ? null : new Date(parsed).toISOString();
  };

  // Main import handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setFileName(file.name); // Set the filename once file is selected

      const rows = await parseCSV(file);
      if (!rows.length) throw new Error("No data found in CSV");

      const mappedData: Record<string, any>[] = [];

      for (const row of rows) {
        const mappedRow: Record<string, any> = {};

        // map CSV headers to DB columns
        for (const [csvHeader, dbColumn] of Object.entries(headersMap)) {
          if (!dbColumn) continue;

          const matchedKey = Object.keys(row).find(
            (key) => normalize(key) === normalize(csvHeader)
          );
          if (!matchedKey) continue;

          let value: any = row[matchedKey];

          if (typeof value === "string") {
            value = value.trim();
            if (value === "" || value.toLowerCase() === "null") value = null;
          }

          // Parse timestamps
          if (["timestamp", "created_at"].includes(dbColumn.toLowerCase())) {
            const parsedValue = parseDate(value);
            if (!parsedValue)
              console.warn(`⚠️ Invalid date for ${dbColumn}:`, value);
            value = parsedValue;
          }

          // Convert numeric strings
          else if (
            typeof value === "string" &&
            value.match(/^-?\d+(\.\d+)?$/)
          ) {
            value = Number(value);
          }

          mappedRow[dbColumn] = value;
        }

        if (Object.keys(mappedRow).length === 0) continue;

        // ✅ Skip rows if first two columns (in order) are empty
        const firstTwoValues = Object.values(mappedRow).slice(0, 2);
        const isValidRow = firstTwoValues.every(
          (val) =>
            val !== null && val !== undefined && String(val).trim() !== ""
        );
        if (!isValidRow) continue;

        // Apply optional transform + validation
        if (transformRow) {
          const transformed = transformRow(mappedRow);
          if (!transformed) continue;
          Object.assign(mappedRow, transformed);
        }

        if (validateRow && !validateRow(mappedRow)) continue;

        mappedData.push(mappedRow);
      }

      if (!mappedData.length) throw new Error("No valid rows to import");

      // ✅ Insert in chunks to bypass Supabase 1000-row limit
      const chunkSize = 1000;
      for (let i = 0; i < mappedData.length; i += chunkSize) {
        const chunk = mappedData.slice(i, i + chunkSize);
        const { error } = await supabase.from(table).insert(chunk);
        if (error) throw error;
      }

      toast.success(`${mappedData.length} records imported successfully`);
      onSuccess?.();
    } catch (err: any) {
      console.error("Import error:", err);
      toast.error(err.message || "Failed to import CSV");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="btn btn-primary"
      >
        Import CSV
      </button>
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="d-none"
      />
      {/* {fileName && <div>Selected File: {fileName}</div>} */}
    </>
  );
}
