"use client";

interface ProfileCardProps {
  user: any;
}

export default function ProfileCard({ user }: ProfileCardProps) {
  const name = user?.name || "Loading...";
  const email = user?.email || ""; 
  const address = user?.address || "No address provided";

  // DYNAMIC AVATAR LOGIC
  const isFemale =
    email === "superadmin@gmail.com" || user?.gender === "female";
  const avatarEmoji = isFemale ? "👧🏻" : "👦🏻";

  return (
    <div
      className="card text-center"
      style={{
        width: 360,
        height: 500,
        borderRadius: 15,
        border: "none",
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
      }}
    >
      <div className="card-body p-4">
        <div
          className="rounded-circle bg-warning d-flex align-items-center justify-content-center mx-auto mb-3"
          style={{ width: 160, height: 160, fontSize: 60 }}
        >
          {avatarEmoji}
        </div>

        <h5 className="fw-bold mb-1 fs-4">{name}</h5>

        <p className="text-muted mb-4" style={{ fontSize: "0.95rem" }}>
          {email || "email@example.com"}
        </p>

        <p
          className="text-muted"
          style={{ lineHeight: 1.6, whiteSpace: "pre-line" }}
        >
          {address}
        </p>
      </div>
    </div>
  );
}
