import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { box_number, supplier, category, quantity, price, date_arrived } =
      body;

    const { data, error } = await supabase
      .from("inventories")
      .insert([
        { box_number, supplier, category, quantity, price, date_arrived },
      ]);

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ message: "Inventory added", data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids, updates } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No inventory IDs provided" },
        { status: 400 }
      );
    }

    // Perform bulk update
    const { data, error } = await supabase
      .from("inventories")
      .update(updates)
      .in("id", ids);

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      message: "Inventories updated successfully",
      data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
