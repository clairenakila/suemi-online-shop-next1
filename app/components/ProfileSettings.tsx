export default function ProfileSettings() {
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title mb-3">Profile Settings</h5>

        <div className="row g-3">
          <div className="col-md-6">
            <input className="form-control" placeholder="Real Name" />
          </div>

          <div className="col-md-6">
            <input className="form-control" placeholder="Username" />
          </div>

          <div className="col-md-6">
            <input className="form-control" placeholder="Email" />
          </div>

          <div className="col-md-6">
            <textarea className="form-control" placeholder="Address" />
          </div>

          <div className="col-md-6">
            <input className="form-control" placeholder="Phone Number" />
          </div>
        </div>

        <div className="text-end mt-3">
          <button className="btn btn-sm btn-outline-danger">
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
