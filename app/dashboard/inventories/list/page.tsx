"use client";
import AddButton from "../../../components/AddButton";
import BulkEdit from "../../../components/BulkEdit";
import { Column, DataTable } from "../../../components/DataTable";


export const Columns: Column<any>[] = [
  {
    header: "Created At",
    accessor: "created_at",
    center: false,
  },
  {
    header: "Date Arrived",
    accessor: "date_arrived",
    center: false,
  },
  {
    header: "Category ID",
    accessor: "category_id",
    center: true,
  },
  {
    header: "Supplier ID",
    accessor: "supplier_id",
    center: true,
  },
  {
    header: "Box Number",
    accessor: "box_number",
    center: false,
  },
  {
    header: "Quantity",
    accessor: "quantity",
    center: true,
  },
  {
    header: "Amount",
    accessor: "amount",
    center: true,
  },
  {
    header: "Total",
    accessor: "total",
    center: true,
  },
];
export default function InventoriesPage() {
  // Fake data muna – palitan mamaya ng totoong from DB
  const arrivalsData = [
    {
      id: "1", // importante may "id" kasi rowKey="id"
      created_at: "2025-12-01",
      category_id: 101,
      date_arrived: "2025-12-10",
      supplier_id: 501,
      box_number: "BOX-001",
      quantity: 100,
      amount: 250.0,
      total: 25000.0,
    },
    {
      id: "2",
      created_at: "2025-12-05",
      category_id: 102,
      date_arrived: "2025-12-12",
      supplier_id: 502,
      box_number: "BOX-002",
      quantity: 50,
      amount: 400.0,
      total: 20000.0,
    },
    {
      id: "3",
      created_at: "2025-13-05",
      category_id: 103,
      date_arrived: "2025-14-12",
      supplier_id: 503,
      box_number: "BOX-003",
      quantity: 51,
      amount: 400.0,
      total: 20000.0,
    },
    {
      id: "4",
      created_at: "2025-14-05",
      category_id: 104,
      date_arrived: "2025-16-12",
      supplier_id: 505,
      box_number: "BOX-004",
      quantity: 52,
      amount: 400.0,
      total: 20000.0,
    },
    // dagdagan mo pa ng 5-10 rows para may pagination
  ];
  return (
    <div className="container my-5">
      {/* Header */}
      <div className="mb-4">
        <p className="text-3xl text-blue-50">Inventory List</p>
      </div>

      {/* Buttons */}
      <div className="d-flex gap-2 mb-3">
        <div className="Addbtn">
          <AddButton
            table="inventories"
            fields={[]}
            onSuccess={() => {}}
            className="btn btn-success"
            buttonText="Add Item"
          />
        </div>
        <div className="BulkEditbtn">
          <BulkEdit
            table="inventories"
            fields={[]}
            selectedIds={[]}
            onSuccess={() => {}}
            // className="btn btn-warning"
            // buttonText="Bulk Edit"
          />
        </div>
      </div>
      
      {/* Dito mo ilalagay yung DataTable later */}
      <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Stock Arrivals</h1>

      <DataTable
        data={arrivalsData}
        columns={Columns}
        rowKey="id"                  // importante: "id" kasi yun yung unique
        page={1}
        pageSize={10}
        totalCount={arrivalsData.length}
        onPageChange={() => { }}
        onPageSizeChange={() => {}}
      />
    </div>
    </div>
  );
}
