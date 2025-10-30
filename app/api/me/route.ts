import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("user");
  if (!cookie) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  try {
    const user = JSON.parse(cookie.value);

    // Fetch role info from Supabase
    const { data: roleData, error } = await supabase
      .from("roles")
      .select("name")
      .eq("id", user.role_id)
      .single();

    if (error) {
      console.error("Supabase role fetch error:", error.message);
      return NextResponse.json({ user: { ...user, role: null } });
    }

    return NextResponse.json({
      user: { ...user, role: roleData ? { name: roleData.name } : null },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
