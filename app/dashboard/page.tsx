"use client";

import StatWidget from "../components/widgets/StatWidget";

export default function DashboardHome() {
  return (
    <div className="container my-4">
      <h2>Dashboard</h2>

      <div className="row g-3">
        <div className="col-md-3">
          <StatWidget
            type="shipped-today"
            label="Shipped Today"
            color="#6f42c1"
          />
        </div>

        <div className="col-md-3">
          <StatWidget
            type="total-quantity"
            label="Total Quantity"
            color="#0d6efd"
          />
        </div>
      </div>
    </div>
  );
}
