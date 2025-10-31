import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      role_id,
      contact_number,
      sss_number,
      philhealth_number,
      pagibig_number,
      hourly_rate,
      daily_rate,
      is_employee,
      is_live_seller,
    } = body;

    if (!name || !email || !password || !role_id) {
      return NextResponse.json(
        { error: "Name, email, password and role are required" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { error } = await supabase.from("users").insert([
      {
        name,
        email,
        password: hashedPassword,
        role_id,
        contact_number,
        sss_number,
        philhealth_number,
        pagibig_number,
        hourly_rate: parseFloat(hourly_rate || "0"),
        daily_rate: parseFloat(daily_rate || "0"),
        is_employee,
        is_live_seller,
      },
    ]);

    if (error) throw error;

    return NextResponse.json({ message: "Employee added successfully!" });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to add employee" },
      { status: 500 }
    );
  }
}

// PATCH: Update users without touching password
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids, updates } = body; // ids: string[], updates: Partial<User>

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No user IDs provided" },
        { status: 400 }
      );
    }

    // Remove password if present to prevent accidental updates
    const sanitizedUpdates = { ...updates };
    delete sanitizedUpdates.password;

    const { error } = await supabase
      .from("users")
      .update(sanitizedUpdates)
      .in("id", ids);

    if (error) throw error;

    return NextResponse.json({ message: "Employeees updated successfully" });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update users" },
      { status: 500 }
    );
  }
}
