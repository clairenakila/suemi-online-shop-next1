export default function PasswordSettings() {
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title mb-3">Password Settings</h5>

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Old Password"
        />

        <input
          type="password"
          className="form-control"
          placeholder="New Password"
        />

        <div className="text-end mt-3">
          <button className="btn" style={{ backgroundColor: '#FFB6C1', color: '#333' }}>Edit</button>
        </div>
      </div>
    </div>
  );
}
