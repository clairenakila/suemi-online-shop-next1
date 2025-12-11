"use client";
import AddButton from "../../../components/AddButton";
import BulkEdit from "../../../components/BulkEdit";
import ImportButton from "../../../components/ImportButton";




export default function InventoriesPage() {

    const handleSuccess = () => {  // ← Gawa ng function
    console.log("Success!");
  };

  const headersMap = {  // ← Add headersMap
    "Product Name": "name",
    "Quantity": "quantity",
    "Price": "price"
  };
  return (
    <div className="p-6">
      <p className="text-xl font-bold">Inventory List</p>
      
      <div className="flex gap-4">
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
        <ImportButton 
          table="inventories"
          onSuccess={handleSuccess}
          headersMap={headersMap}
        />
      </div>
    </div>
  );
}