import Link from "next/link";

export default function NavLinks() {
  return (
    <nav className="flex items-center gap-6 text-sm">
      <Link
        href="/"
        className="transition hover:text-[#A3B18A]"
      >
        Home
      </Link>

      <Link
        href="/projects"
        className="transition hover:text-[#A3B18A]"
      >
        Projects
      </Link>

      <Link
        href="/login"
        className="transition hover:text-[#A3B18A]"
      >
        Log In
      </Link>
    </nav>
  );
}