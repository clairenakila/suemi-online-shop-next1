// import { NextResponse } from "next/server";
// import { supabase } from "@/lib/supabase";
// import bcrypt from "bcryptjs";

// export async function POST(req: Request) {
//   try {
//     const { name, email, password, phone_number, role_id } = await req.json();

//     // check if user already exists
//     const { data: existing } = await supabase
//       .from("users")
//       .select("id")
//       .eq("email", email)
//       .maybeSingle();

//     if (existing) {
//       return NextResponse.json(
//         { error: "Email already registered" },
//         { status: 400 }
//       );
//     }

//     // hash password
//     const hashed = await bcrypt.hash(password, 10);

//     const { error } = await supabase
//       .from("users")
//       .insert([{ name, email, password: hashed, phone_number, role_id }]);

//     if (error) throw error;

//     return NextResponse.json({ message: "User registered successfully" });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }
