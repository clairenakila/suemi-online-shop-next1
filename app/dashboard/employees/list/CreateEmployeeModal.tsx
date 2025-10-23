"use client";

import { FormEvent } from "react";

interface Role {
  id: string;
  name: string;
}

interface User {
  id?: string;
  name: string;
  email: string;
  password: string;
  role_id: string;
  sss_number?: string;
  philhealth_number?: string;
  pagibig_number?: string;
  hourly_rate?: number;
  daily_rate?: number;
  is_employee?: "Yes" | "No";
  is_live_seller?: "Yes" | "No";
}

interface CreateEmployeeModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (user: User) => void;
  userData: User;
  setUserData: (user: User) => void;
  roles: Role[];
  isEdit: boolean;
}

export default function CreateEmployeeModal({
  show,
  onClose,
  onSubmit,
  userData,
  setUserData,
  roles,
  isEdit,
}: CreateEmployeeModalProps) {
  if (!show) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(userData);
  };

  return (
    <>
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        style={{ zIndex: 1050, display: "block" }}
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {isEdit ? "Edit Employee" : "Add Employee"}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={userData.name}
                      onChange={(e) =>
                        setUserData({ ...userData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={userData.email}
                      onChange={(e) =>
                        setUserData({ ...userData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={userData.password}
                      onChange={(e) =>
                        setUserData({ ...userData, password: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Role</label>
                    <select
                      className="form-control"
                      value={userData.role_id}
                      onChange={(e) =>
                        setUserData({ ...userData, role_id: e.target.value })
                      }
                    >
                      <option value="">Select Role</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">SSS Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={userData.sss_number || ""}
                      onChange={(e) =>
                        setUserData({ ...userData, sss_number: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">PhilHealth Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={userData.philhealth_number || ""}
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          philhealth_number: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Pag-IBIG Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={userData.pagibig_number || ""}
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          pagibig_number: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Hourly Rate</label>
                    <input
                      type="number"
                      className="form-control"
                      value={userData.hourly_rate || 0}
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          hourly_rate: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Daily Rate</label>
                    <input
                      type="number"
                      className="form-control"
                      value={userData.daily_rate || 0}
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          daily_rate: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Is Employee?</label>
                    <select
                      className="form-control"
                      value={userData.is_employee || "Yes"}
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          is_employee: e.target.value as "Yes" | "No",
                        })
                      }
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Is Live Seller?</label>
                    <select
                      className="form-control"
                      value={userData.is_live_seller || "No"}
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          is_live_seller: e.target.value as "Yes" | "No",
                        })
                      }
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>

                <div className="d-flex justify-content-end mt-3">
                  <button
                    type="button"
                    className="btn btn-secondary me-2"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-rose">
                    {isEdit ? "Update" : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
    </>
  );
}
