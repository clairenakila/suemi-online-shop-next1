"use client";

import { useRef } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export interface ImportButtonProps {
  table: string; // Supabase table name
  headersMap: Record<string, string>; // { csvHeader: dbColumn }
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

  const parseCSV = async (file: File): Promise<Record<string, any>[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        const lines = text.split(/\r\n|\n/).filter(Boolean);
        if (!lines.length) return reject(new Error("CSV is empty"));

        const headers = lines[0].split(",").map((h) => h.trim());
        const rows = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim());
          const obj: Record<string, any> = {};
          headers.forEach((h, i) => (obj[h] = values[i] ?? ""));
          return obj;
        });

        resolve(rows);
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const rows = await parseCSV(file);
      if (!rows.length) throw new Error("No data found in CSV");

      const mappedData: Record<string, any>[] = [];

      for (const row of rows) {
        const mappedRow: Record<string, any> = {};
        for (const [csvHeader, dbColumn] of Object.entries(headersMap)) {
          mappedRow[dbColumn] = row[csvHeader] ?? null;
        }

        let finalRow = mappedRow;

        if (transformRow) {
          const transformed = transformRow(mappedRow);
          if (!transformed)
            throw new Error("Import failed due to invalid row data");
          finalRow = transformed;
        }

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
        className="d-none"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </>
  );
}
