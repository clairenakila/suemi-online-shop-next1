"use client";
import ProfileCard from "../../../components/profile/Profilecard";
import ProfileSettings from "../../../components/profile/ProfileSettings";
import PasswordSettings from "../../../components/profile/PasswordSettings";

export default function ProfilePage() {
  return (
    <div className="flex gap-6 p-6 bg-[#fff9f9] min-h-screen">
      <ProfileCard />

      <div className="flex flex-col gap-6 w-full max-w-3xl">
        <ProfileSettings />
        <PasswordSettings />
      </div>
    </div>
  );
}
