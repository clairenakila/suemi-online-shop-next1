"use client";

import { useRef } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export interface ImportButtonProps {
  table: string; // Supabase table name
  headersMap: Record<string, string>; // { excelHeader: dbColumn }
  onSuccess?: () => void;
  transformRow?: (row: Record<string, any>) => Record<string, any>; // optional transform/validation
  validateRow?: (row: Record<string, any>) => boolean; // optional row validation, return false to cancel
}

export default function ImportButton({
  table,
  headersMap,
  onSuccess,
  transformRow,
  validateRow,
}: ImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet);
      if (!rows.length) throw new Error("No data found in file");

      // Map Excel headers → DB columns
      const mappedData: Record<string, any>[] = [];

      for (const row of rows) {
        const mappedRow: Record<string, any> = {};
        for (const [excelHeader, dbColumn] of Object.entries(headersMap)) {
          mappedRow[dbColumn] = row[excelHeader] ?? null;
        }

        // Apply optional transform
        let finalRow = mappedRow;
        if (transformRow) {
          const transformed = transformRow(mappedRow);
          if (!transformed)
            throw new Error("Import failed due to invalid row data");
          finalRow = transformed;
        }

        // Apply optional validation
        if (validateRow && !validateRow(finalRow)) {
          throw new Error("Import cancelled due to invalid row data");
        }

        mappedData.push(finalRow);
      }

      if (!mappedData.length) throw new Error("No valid rows to import");

      const { error } = await supabase.from(table).insert(mappedData);
      if (error) throw error;

      toast.success(`${mappedData.length} records imported successfully`);
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to import file");
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
        Import
      </button>
      <input
        type="file"
        accept=".xlsx,.csv"
        className="d-none"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </>
  );
}
