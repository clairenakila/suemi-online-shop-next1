"use client";
import ProfileCard from "../../../components/Profilecard";
import ProfileSettings from "../../../components/ProfileSettings";
import PasswordSettings from "../../../components/PasswordSettings";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#fdf6f6] p-8">
      <div className="flex gap-8 max-w-[1400px] mx-auto">
        <ProfileCard />

        <div className="flex flex-col gap-8 flex-1">
          <ProfileSettings />
          <PasswordSettings />
        </div>
      </div>
    </div>
  );
}
