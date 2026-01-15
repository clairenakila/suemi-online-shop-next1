interface ProfileSettingsProps {
  user: any;
}

export default function ProfileCard({ user }: { user: any }) {
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
          👧🏻
        </div>

        <h5 className="fw-bold mb-1 fs-4">Claire Nakila</h5>
        <p className="text-muted mb-4">@watashiclang</p>

        <p className="text-muted" style={{ lineHeight: 1.6 }}>
          Block 9 Lot 3 Calliandra 2<br />
          Street Phase 1 Greenwoods<br />
          Village, Dasmariñas Cavite
        </p>
      </div>
    </div>
  );
}
