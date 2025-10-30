// import { NextRequest, NextResponse } from "next/server";
// import { supabase } from "@/lib/supabase";

// export async function GET(req: NextRequest) {
//   const cookie = req.cookies.get("user");
//   if (!cookie) {
//     return NextResponse.json({ user: null }, { status: 200 });
//   }

//   try {
//     const user = JSON.parse(cookie.value);

//     // Fetch role info from Supabase
//     const { data: roleData, error } = await supabase
//       .from("roles")
//       .select("name")
//       .eq("id", user.role_id)
//       .single();

//     if (error) {
//       console.error("Supabase role fetch error:", error.message);
//       return NextResponse.json({ user: { ...user, role: null } });
//     }

//     return NextResponse.json({
//       user: { ...user, role: roleData ? { name: roleData.name } : null },
//     });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ user: null }, { status: 200 });
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

const COOKIE_SECRET = process.env.COOKIE_SECRET || "supersecretkey";

function verifyData(signed: string) {
  try {
    const [b64, signature] = signed.split(".");
    const payload = Buffer.from(b64, "base64").toString("utf8");
    const expectedSig = crypto
      .createHmac("sha256", COOKIE_SECRET)
      .update(payload)
      .digest("hex");
    if (signature !== expectedSig) return null;
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("user");
  if (!cookie) return NextResponse.json({ user: null }, { status: 200 });

  const user = verifyData(cookie.value);
  if (!user) return NextResponse.json({ user: null }, { status: 200 });

  // Get role info
  const { data: roleData, error } = await supabase
    .from("roles")
    .select("name")
    .eq("id", user.role_id)
    .single();

  return NextResponse.json({
    user: { ...user, role: roleData ? { name: roleData.name } : null },
  });
}
