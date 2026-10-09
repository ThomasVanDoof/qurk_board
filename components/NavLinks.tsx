import Link from "next/link";

export default function NavLinks() {
  return (
    <nav className="flex items-center gap-6 text-sm font-medium">
      <Link
        href="/"
        className="transition hover:text-[#A3B18A]"
      >
        Home
      </Link>

      <Link
        href="/board"
        className="transition hover:text-[#A3B18A]"
      >
        Board
      </Link>

      <Link
        href="/login"
        className="transition hover:text-[#A3B18A]"
      >
        Login
      </Link>

      <details className="relative">
        <summary className="cursor-pointer list-none transition hover:text-[#A3B18A]">
          Profile ▾
        </summary>

        <div className="absolute right-0 z-10 mt-2 w-40 rounded-lg border border-[#A3B18A] bg-white p-2 text-[#344E41] shadow-lg">
          <Link
            href="/profile"
            className="block rounded-md px-3 py-2 transition hover:bg-[#DAD7CD]"
          >
            Profile
          </Link>

          <Link
            href="/projects"
            className="block rounded-md px-3 py-2 transition hover:bg-[#DAD7CD]"
          >
            Projects
          </Link>
        </div>
      </details>
    </nav>
  );
}