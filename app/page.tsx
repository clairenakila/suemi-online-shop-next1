export default function Home() {
  return (
    <div className="container my-5">
      <h3 className="mb-4">Suemi Online Shop</h3>

      <div className="row">
        {/* Left side: User Form */}
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter name"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter email"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter password"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter phone number"
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  Add User
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right side: Users Table */}
        <div className="col-md-8">
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Password</th>
                  <th>Phone Number</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Claire</td>
                  <td>claire@gmail.com</td>
                  <td>manila</td>
                  <td>099188973</td>
                  <td>
                    <button className="btn btn-warning btn-sm me-2">
                      Edit
                    </button>
                    <button className="btn btn-danger btn-sm">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
