"use client";

import Link from "next/link";

export default function EmployeesList() {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Employees</h3>
        <Link href="/dashboard/employees/create" className="btn btn-primary">
          Create Employee
        </Link>
      </div>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {/* Example data */}
          <tr>
            <td>1</td>
            <td>John Doe</td>
            <td>john@example.com</td>
            <td>Admin</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
