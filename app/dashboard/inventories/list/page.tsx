"use client";
import AddButton from "../../../components/AddButton";
import BulkEdit from "../../../components/BulkEdit";
import { Column, DataTable } from "../../../components/DataTable";
import { useState } from "react";

// export const Columns: Column<any>[] = [
//   {
//     header: "Select",
//     accessor: "select",
//     center: true,
//     cell: (row) => (
//       <input
//         type="checkbox"
//         checked={false}
//         onChange={() => {}}
//       />
//     ),
//   },
//   {
//     header: "Created At",
//     accessor: "created_at",
//   },
//   {
//     header: "Date Arrived",
//     accessor: "date_arrived",
//   },
//   {
//     header: "Category ID",
//     accessor: "category_id",
//     center: true,
//   },
// ];

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
      amount: 250,
      total: 25000,
    },
    {
      id: "2",
      created_at: "2025-12-05",
      category_id: 102,
      date_arrived: "2025-12-12",
      supplier_id: 502,
      box_number: "BOX-002",
      quantity: 50,
      amount: 400,
      total: 20000,
    },
    {
      id: "3",
      created_at: "2025-13-05",
      category_id: 103,
      date_arrived: "2025-14-12",
      supplier_id: 503,
      box_number: "BOX-003",
      quantity: 51,
      amount: 400,
      total: 20000,
    },
    {
      id: "4",
      created_at: "2025-14-05",
      category_id: 104,
      date_arrived: "2025-16-12",
      supplier_id: 505,
      box_number: "BOX-004",
      quantity: 52,
      amount: 400,
      total: 20000,
    },
    {
      id: "5",
      created_at: "2025-14-05",
      category_id: 105,
      date_arrived: "2025-16-12",
      supplier_id: 505,
      box_number: "BOX-004",
      quantity: 52,
      amount: 400,
      total: 20000,
    },
    {
      id: "6",
      created_at: "2025-14-05",
      category_id: 105,
      date_arrived: "2025-16-12",
      supplier_id: 505,
      box_number: "BOX-004",
      quantity: 52,
      amount: 400,
      total: 20000,
    }, 
      {
      id: "7",
      created_at: "2025-14-05",
      category_id: 105,
      date_arrived: "2025-16-12",
      supplier_id: 505,
      box_number: "BOX-004",
      quantity: 52,
      amount: 400,
      total: 20000,
    }, 
    
    // dagdagan mo pa ng 5-10 rows para may pagination
  ];
  // 2. State at handlers – DAPAT NASA BABA NG ARRAY
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIdsOnPage = arrivalsData.map((row) => row.id);
      setSelectedIds(allIdsOnPage);
    } else {
      setSelectedIds([]);
    }
  };
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
      <div className="container mx-auto ">
        <DataTable
          data={arrivalsData}
          columns={Columns}
          rowKey="id"
          page={1}
          pageSize={10}
          totalCount={arrivalsData.length}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
          selectable
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
        />
      </div>
    </div>
  );
}
