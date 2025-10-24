"use client";

import { FC, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Props {
  type: "shipped-today" | "total-quantity";
  label: string;
  color?: string;
}

const StatWidget: FC<Props> = ({ type, label, color = "purple" }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const fetchAllItems = async () => {
      try {
        let total = 0;
        let from = 0;
        const pageSize = 500;

        while (true) {
          const { data: items, error } = await supabase
            .from("items")
            .select("quantity,date_shipped")
            .range(from, from + pageSize - 1);

          if (error) throw error;
          if (!items || items.length === 0) break;

          const pageTotal = items.reduce((sum, i) => {
            const qty = Number(i.quantity) || 0;

            if (type === "shipped-today") {
              const shipped = i.date_shipped ? new Date(i.date_shipped) : null;
              if (shipped) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                if (shipped >= today && shipped < tomorrow) {
                  return sum + qty;
                }
                return sum;
              }
              return sum;
            }

            // total-quantity
            return sum + qty;
          }, 0);

          total += pageTotal;

          if (items.length < pageSize) break; // last page
          from += pageSize;
        }

        setValue(total);
      } catch (err: any) {
        console.error("StatWidget fetch error:", err);
        setValue(0);
      }
    };

    fetchAllItems();
  }, [type]);

  return (
    <div
      className="p-3 rounded shadow-sm d-flex align-items-center justify-content-between"
      style={{ backgroundColor: color, color: "white" }}
    >
      <div>
        <h6 className="mb-1">{label}</h6>
        <h3 className="mb-0">{value}</h3>
      </div>
    </div>
  );
};

export default StatWidget;
