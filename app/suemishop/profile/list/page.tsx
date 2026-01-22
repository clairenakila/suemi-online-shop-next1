"use client";

import { useEffect, useState } from "react";
import ProfileCard from "../../../components/profile/Profilecard";
import ProfileSettings from "../../../components/profile/ProfileSettings";
import PasswordSettings from "../../../components/profile/PasswordSettings";

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    async function loadProfile() {
      // Get user from localStorage
      const stored = localStorage.getItem("user");

      if (!stored) {
        console.log("No user logged in");
        return; // leave userData as null
      }

      const user = JSON.parse(stored);

      // Optionally fetch fresh data from API
      try {
        const res = await fetch("/api/me");
        const data = await res.json();

        if (res.ok && data.user) {
          setUserData(data.user);
        } else {
          setUserData(user); // fallback to localStorage
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setUserData(user); // fallback
      }
    }

    loadProfile();
  }, []);

  return (
    <div className="flex w-full gap-6 p-6 bg-[#fff9f9] min-h-screen">
      {userData ? (
        <>
          <ProfileCard user={userData} />
          <div className="flex flex-col gap-6 flex-1">
            <ProfileSettings user={userData} />
            <PasswordSettings user={userData} />
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500">
          You are not logged in. Profile information is unavailable.
        </div>
      )}
    </div>
  );
}
