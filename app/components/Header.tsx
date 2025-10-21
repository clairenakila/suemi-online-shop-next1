export default function Header({ title }: { title?: string }) {
  return (
    <header className="bg-gray-200 p-6 text-center font-semibold text-lg">
      {title || "Header Section"}
    </header>
  );
}
