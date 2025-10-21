export default function Footer() {
  return (
    <footer
      className="text-white text-center p-4 mt-auto"
      style={{ backgroundColor: "#e11d48" }} // Tailwind rose-600 hex
    >
      &copy; {new Date().getFullYear()} Suemi Online Shop. All rights reserved.
    </footer>
  );
}
