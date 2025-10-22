// import { NextResponse } from "next/server";
// import { supabase } from "@/lib/supabase";
// import bcrypt from "bcryptjs";

// export async function POST(req: Request) {
//   try {
//     const { email, password } = await req.json();

//     // get user by email
//     const { data: user, error } = await supabase
//       .from("users")
//       .select("*")
//       .eq("email", email)
//       .single();

//     if (error || !user) {
//       return NextResponse.json({ error: "User not found" }, { status: 400 });
//     }

//     // compare hashed passwords
//     const valid = await bcrypt.compare(password, user.password);
//     if (!valid) {
//       return NextResponse.json(
//         { error: "Invalid credentials" },
//         { status: 401 }
//       );
//     }

//     // ✅ success - never return the password
//     return NextResponse.json({
//       message: "Login successful",
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         phone_number: user.phone_number,
//         role_id: user.role_id,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }
