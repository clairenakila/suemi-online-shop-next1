import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json();

  if (!email || !password || !name) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  // 1️⃣ Ensure "Shopper" role exists
  let { data: shopperRole, error: roleError } = await supabase
    .from("roles")
    .select("*")
    .eq("name", "Shopper")
    .single();

  if (roleError || !shopperRole) {
    const { data: newRole, error: createRoleError } = await supabase
      .from("roles")
      .insert([{ name: "Shopper" }])
      .select()
      .single();

    if (createRoleError) {
      return NextResponse.json(
        { error: "Failed to create default role" },
        { status: 500 }
      );
    }

    shopperRole = newRole;
  }

  // 2️⃣ Create user in Supabase Auth
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (signUpError) {
    return NextResponse.json({ error: signUpError.message }, { status: 400 });
  }

  const user = signUpData.user;
  if (!user) {
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }

  // 3️⃣ Add to `users` table
  const { error: insertError } = await supabase.from("users").insert([
    {
      id: user.id,
      name,
      email,
      role_id: shopperRole.id,
    },
  ]);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Registration successful", user });
}
