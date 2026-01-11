export default function ProfileSettings() {
  return (
    <div className="container">
      <h5 className="card-title mb-3 text-black fw-bold">Profile Settings</h5>
      <div className="card shadow-sm" style={{ width: 1110, height: 390, borderRadius: 15 }}>
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-md-6">
              <p className="mb-2" style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>Real Name</p>
              <input 
                className="form-control" 
                style={{
                  borderRadius: 5,
                  border: "1px solid #ddd",
                  padding: "10px 12px",
                  fontSize: "14px",
                }}
              />
            </div>

            <div className="col-md-6">
              <p className="mb-2" style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>Username</p>
              <input 
                className="form-control"
                style={{
                  borderRadius: 5,
                  border: "1px solid #ddd",
                  padding: "10px 12px",
                  fontSize: "14px",
                }}
              />
            </div>

            <div className="col-md-6">
              <p className="mb-2" style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>Email</p>
              <input 
                className="form-control"
                style={{
                  borderRadius: 5,
                  border: "1px solid #ddd",
                  padding: "10px 12px",
                  fontSize: "14px",
                }}
              />
            </div>

            <div className="col-md-6">
              <p className="mb-2" style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>Address</p>
              <textarea 
                className="form-control"
                rows={3}
                style={{
                  borderRadius: 5,
                  border: "1px solid #ddd",
                  padding: "10px 12px",
                  fontSize: "14px",
                  resize: 'none'
                }}
              />
            </div>

            <div className="col-md-6">
              <p className="mb-2" style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>Phone Number</p>
              <input 
                className="form-control"
                style={{
                  borderRadius: 5,
                  border: "1px solid #ddd",
                  padding: "10px 12px",
                  fontSize: "14px",
                }}  
              />
            </div>
          </div>

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