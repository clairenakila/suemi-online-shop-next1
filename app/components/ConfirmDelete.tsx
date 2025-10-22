"use client";

import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import toast from "react-hot-toast";

interface ConfirmDeleteProps {
  onConfirm: () => Promise<void> | void;
  children: React.ReactNode;
  confirmMessage?: string;
  className?: string;
}

export default function ConfirmDelete({
  onConfirm,
  children,
  confirmMessage = "Are you sure you want to delete this item?",
  className = "btn btn-danger btn-sm",
}: ConfirmDeleteProps) {
  const handleClick = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: confirmMessage,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await onConfirm();
        toast.success("Deleted successfully");
      } catch (error: any) {
        toast.error(error?.message || "Failed to delete");
      }
    }
  };

  return (
    <button className={className} onClick={handleClick}>
      {children}
    </button>
  );
}
