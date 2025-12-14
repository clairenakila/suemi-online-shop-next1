"use client";
import AddButton from "../../../components/AddButton";
import BulkEdit from "../../../components/BulkEdit";



export default function InventoriesPage() {
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

    </div>
  );
}
