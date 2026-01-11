export default function PasswordSettings() {
  return (
    <div className="container">
      <h5 className="mb-3 text-black fw-bold">Password Settings</h5>
      <div className="card shadow-sm" style={{ width: 1110, height: 310 , borderRadius: 15 , border: 'none' , backgroundColor: '#FFFFFF'}}>
        <div className="card-body p-4">
          <p>Old Password</p>
          <input
            type="password"
            className="form-control mb-3"
            style={{
              borderRadius: 5,
              border: "1px solid #ddd",
              padding: "10px 12px",
              fontSize: "14px",
            }}
          />
          <p>New Password</p>
          <input
            type="password"
            className="form-control"
            style={{
              borderRadius: 5,
              border: "1px solid #ddd",
              padding: "10px 12px",
              fontSize: "14px",
            }}
          />

          <button
            className="btn position-absolute"
            style={{
              backgroundColor: "#FFB6C1",
              color: "#333",
              bottom: 20,
              right: 20,
              padding: "8px 25px",
              borderRadius: 5,
              fontSize: "14px",
              border: "none",
              fontWeight: 500,
            }}
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
