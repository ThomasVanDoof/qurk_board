
import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function NavLinks() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);

  return (
    <nav className="ml-auto flex w-full items-center justify-end gap-6 text-sm font-medium">
      <Link
        href="/"
        className="transition hover:text-[#A3B18A]"
      >
        Home
      </Link>

      {isLoggedIn && (
        <Link
          href="/board"
          className="transition hover:text-[#A3B18A]"
        >
          Board
        </Link>
      )}

      {isLoggedIn && (
        <details className="relative">
          <summary className="cursor-pointer list-none transition hover:text-[#A3B18A]">
            Profile ▾
          </summary>

          <div className="absolute right-0 z-10 mt-2 w-40 rounded-lg border border-[#A3B18A] bg-white p-2 text-[#344E41] shadow-lg">
            <Link
              href="/profile"
              className="block rounded-md px-3 py-2 transition hover:bg-[#DAD7CD]"
            >
              My Profile
            </Link>

            <Link
              href="/projects"
              className="block rounded-md px-3 py-2 transition hover:bg-[#DAD7CD]"
            >
              My Projects
            </Link>
          </div>
        </details>
      )}

      {isLoggedIn ? (
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="transition hover:text-[#A3B18A]"
          >
            Log Out
          </button>
        </form>
      ) : (
        <Link
          href="/login"
          className="transition hover:text-[#A3B18A]"
        >
          Login
        </Link>
      )}
    </nav>
  );
}
