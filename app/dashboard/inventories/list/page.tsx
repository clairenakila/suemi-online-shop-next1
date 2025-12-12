"use client";
import AddButton from "../../../components/AddButton";
import BulkEdit from "../../../components/BulkEdit";

export default function InventoriesPage() {
  return (
    <div className="container my-5 ">
      {/* Header */}
      <div className="mb-6">
        <p className="mb-4 text-3xl ">Inventory List</p>
      </div>
      
      {/* Buttons */}
      <div className="flex gap-3 mb-6">
        <AddButton 
          table="inventories"
          fields={[]}
          onSuccess={() => {}}
        />
        <BulkEdit 
          table="inventories"
          fields={[]}
          selectedIds={[]}
          onSuccess={() => {}}
        />
      </div>
      
      {/* Dito mo ilalagay yung DataTable later */}
    </div>
  );
}