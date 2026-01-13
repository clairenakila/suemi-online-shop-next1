export default function PasswordSettings() {
  return (
    <div>
      <h5 className="fw-bold mb-3 text-dark">Password Settings</h5>

      <div
        className="card position-relative"
        style={{
          borderRadius: 15,
          border: "none",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
          paddingBottom: "80px"
        }}
      >
        <div className="card-body p-4">
          <label className="form-label">Old Password</label>
          <input type="password" className="form-control mb-3" />

          <label className="form-label">New Password</label>
          <input type="password" className="form-control" />

          <button
            className="btn position-absolute"
            style={{
              bottom: 20,
              right: 20,
              backgroundColor: "#FFB6C1",
              border: "none",
              padding: "8px 24px",
            }}
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
