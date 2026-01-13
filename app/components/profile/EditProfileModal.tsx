// components/profile/EditProfileModal.tsx
import Modal from "../../components/profile/Modal";

export default function EditProfileModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <p className="text-dark">(Progress)</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-dark">Real Name</label>
          <input type="text" className="border p-2 rounded w-full" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-dark">Username</label>
          <input type="text" className="border p-2 rounded w-full" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-dark">Email</label>
          <input type="email" className="border p-2 rounded w-full" />
        </div>
        <div className="row-span-2 flex flex-col gap-1">
          <label className="text-sm font-medium text-dark  ">Address</label>
          <textarea className="border p-2 rounded w-full h-full" rows={4} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-dark">Phone Number</label>
          <input type="text" className="border p-2 rounded w-full" />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-md">
          Cancel
        </button>
        <button className="bg-pink-300 hover:bg-pink-400 text-white px-6 py-2 rounded-md transition-colors">
          Save
        </button>
      </div>
    </Modal>
  );
}
