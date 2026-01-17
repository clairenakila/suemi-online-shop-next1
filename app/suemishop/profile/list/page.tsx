"use client";
import { useEffect, useState } from "react";
// Inalis ang createClient dito dahil gagamitin ang nasa lib
import ProfileCard from "../../../components/profile/Profilecard"; 
import ProfileSettings from "../../../components/profile/ProfileSettings";
import PasswordSettings from "../../../components/profile/PasswordSettings";
import { supabase } from "@/lib/supabase"; // Ito ang official na gagamitin

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    async function loadProfile() {
      // 1. Check muna natin kung may tunay na session (Automatic Login)
      const { data: { user } } = await supabase.auth.getUser();
      
      // 2. Kunin ang email mula sa URL kung wala sa session
      const params = new URLSearchParams(window.location.search);
      const emailFromUrl = params.get("email");

      // 3. Logic: Session Email > URL Email > Default Email
      const activeEmail = user?.email || emailFromUrl || "baronjhomhar@gmail.com"; 

      console.log("Loading profile for:", activeEmail);

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", activeEmail)
        .single();

      if (error) {
        console.error("Error fetching profile:", error.message);
      }

      if (data) {
        setUserData(data);
      }
    }
    loadProfile();
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