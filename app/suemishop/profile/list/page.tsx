"use client";
import { useEffect, useState } from "react";
import ProfileCard from "../../../components/profile/Profilecard"; // Siguraduhin ang "C" sa Card
import ProfileSettings from "../../../components/profile/ProfileSettings";
import PasswordSettings from "../../../components/profile/PasswordSettings";
import { supabase } from "@/lib/supabase"; 

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);

useEffect(() => {
  async function loadProfile() {
    // 1. Kunin ang logged-in user mula sa Local Storage
    const storageUser = localStorage.getItem("user");
    let loggedInEmail = null;

    if (storageUser) {
      const parsedUser = JSON.parse(storageUser);
      loggedInEmail = parsedUser.email; // Kinukuha natin yung "superadmin@gmail.com"
    }

    // 2. Fallback sa URL parameter
    const params = new URLSearchParams(window.location.search);
    const emailFromUrl = params.get("email");

    // 3. PRIORITY: Storage > URL > Default Email
    const activeEmail = loggedInEmail || emailFromUrl || "baronjhomhar@gmail.com"; 

    console.log("Automatically fetching for:", activeEmail);

    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, address, phone_number") // Sinama na ang ID para safe na ang Save Changes
      .eq("email", activeEmail)
      .single();

    if (data) {
      setUserData(data);
    }
  }
  loadProfile();
}, []);

  // Display "Loading..." lang kung wala talagang email at data
  if (!userData) {
    return <div className="p-6">Loading Profile Data...</div>;
  }

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