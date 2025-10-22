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
        <div className="modal-dialog">
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
                <div className="mb-3">
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
                <div className="mb-3">
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
                <div className="mb-3">
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
                <div className="mb-3">
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
                <div className="d-flex justify-content-end">
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
