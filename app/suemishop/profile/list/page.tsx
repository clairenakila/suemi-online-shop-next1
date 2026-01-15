"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import ProfileCard from "../../../components/profile/Profilecard";
import ProfileSettings from "../../../components/profile/ProfileSettings";
import PasswordSettings from "../../../components/profile/PasswordSettings";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);

useEffect(() => {
  async function getUser() {
    console.log("Pilit na kinukuha ang data ng ID 332...");
    

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", 332)
      .single();

    if (error) {
      console.error("Database Error:", error.message);
    }

    if (data) {
      console.log("Success! Data found:", data);
      setUserData(data);
    }
  }
  getUser();
}, []);

  return (
    <div className="flex w-full gap-6 p-6 bg-[#fff9f9] min-h-screen">
      <ProfileCard user={userData} />
      <div className="flex flex-col gap-6 flex-1">
        <ProfileSettings user={userData} />
        <PasswordSettings user={userData} />
      </div>
    </div>
  );
}