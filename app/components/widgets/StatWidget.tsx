"use client";

import { FC, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { sumQuantity } from "../../utils/validator";

interface Props {
  label: string;
  color?: string;
}

const StatWidget: FC<Props> = ({ label, color = "purple" }) => {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchTotalQuantity = async () => {
      try {
        let from = 0;
        const pageSize = 500;
        let allItems: any[] = [];

        while (true) {
          const { data: items, error } = await supabase
            .from("items")
            .select("quantity")
            .range(from, from + pageSize - 1);

          if (error) throw error;
          if (!items || items.length === 0) break;

          allItems = allItems.concat(items);
          if (items.length < pageSize) break;
          from += pageSize;
        }

        const totalQty = sumQuantity(allItems);
        setTotal(totalQty);
      } catch (err: any) {
        console.error("StatWidget fetch error:", err);
        setTotal(0);
      }
    };

    fetchTotalQuantity();
  }, []);

  return (
    <div
      className="p-3 rounded shadow-sm d-flex align-items-center justify-content-between"
      style={{ backgroundColor: color, color: "white" }}
    >
      <div>
        <h6 className="mb-1">{label}</h6>
        <h3 className="mb-0">{total}</h3>
      </div>
    </div>
  );
};

export default StatWidget;
