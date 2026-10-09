import NavLinks from "./NavLinks";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-[#344E41] text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
      <Link
        href="/"
        className="text-lg font-bold transition hover:text-[#A3B18A]"
  >
        Qurk Board
      </Link>

        <NavLinks />
      </div>
    </header>
  );
}