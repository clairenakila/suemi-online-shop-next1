import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password required" },
      { status: 400 }
    );
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .eq("password", password) // WARNING: plain text for simplicity
    .single();

  if (error || !user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // ✅ Logged in
  return NextResponse.json({ message: "Login successful", user });
}
