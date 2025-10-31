// app/types/inventory.ts
export interface Category {
  id: string;
  description: string; // unified field
}

export interface Supplier {
  id: string;
  name: string;
}

export interface Inventory {
  id?: string;
  date_arrived?: string | null; // ✅ allow null
  box_number?: string;
  supplier?: string;
  category?: string;
  quantity?: string;
  price?: string;
  total?: string;
  created_at?: string;
  quantity_left?: string;
  total_left?: string;
}
