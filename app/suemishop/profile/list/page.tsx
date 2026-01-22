"use client";

import { useEffect, useState } from "react";
import ProfileCard from "../../../components/profile/Profilecard";
import ProfileSettings from "../../../components/profile/ProfileSettings";
import PasswordSettings from "../../../components/profile/PasswordSettings";

export default function ProfilePage() {
  // Use null = loading, false = not logged in, object = user
  const [userData, setUserData] = useState<any | null>(null);

  useEffect(() => {
    async function loadProfile() {
      // Try to get user from localStorage first
      const stored = localStorage.getItem("user");

      if (!stored) {
        console.log("No user logged in in localStorage");
        setUserData(false); // explicitly mark as logged out
        return;
      }

      const user = JSON.parse(stored);

      // Fetch fresh data from API
      try {
        const res = await fetch("/api/me");
        const data = await res.json();

        if (res.ok && data.user) {
          setUserData(data.user);
        } else {
          setUserData(user); // fallback
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setUserData(user); // fallback
      }
    }

    loadProfile();
  }, []);

  if (userData === null) {
    // Still loading
    return (
      <div className="text-center text-gray-500 mt-10">
        Loading profile...
      </div>
    );
  }

  if (userData === false) {
    // Explicitly not logged in
    return (
      <div className="text-center text-gray-500 mt-10">
        You are not logged in. Profile information is unavailable.
      </div>
    );
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
