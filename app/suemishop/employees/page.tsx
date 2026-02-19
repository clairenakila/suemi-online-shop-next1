"use client";

import { Toaster } from "react-hot-toast";
import UsersTable from "../../components/users/UsersTable";

export default function EmployeesListPage() {
  return (
    <div className="container my-5">
      <Toaster />
      <h3 className="mb-4">Users Management</h3>
      <UsersTable />
    </div>
  );
}