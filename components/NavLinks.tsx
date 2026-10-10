"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NavLinks() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => {
        if (active) setIsAuthenticated(response.ok);
      })
      .catch(() => {
        if (active) setIsAuthenticated(false);
      });
    return () => {
      active = false;
    };
  }, [pathname]);

  async function signOut() {
    setLogoutError("");
    try {
      const response = await fetch("/api/auth/session", { method: "DELETE" });
      if (!response.ok) throw new Error("Could not sign out. Please try again.");
      setIsAuthenticated(false);
      router.replace("/login");
      router.refresh();
    } catch (error) {
      setLogoutError(
        error instanceof Error ? error.message : "Could not sign out. Please try again.",
      );
    }
  }

  return (
    <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm font-medium sm:gap-x-6">
      <Link href="/" className="transition hover:text-[#A3B18A]">
        Home
      </Link>

      <Link href="/board" className="transition hover:text-[#A3B18A]">
        Board
      </Link>

      <Link href="/projects" className="transition hover:text-[#A3B18A]">
        Projects
      </Link>

      {isAuthenticated ? (
        <>
          <Link href="/profile" className="transition hover:text-[#A3B18A]">
            Profile
          </Link>
          <button
            type="button"
            onClick={() => {
              void signOut();
            }}
            className="transition hover:text-[#A3B18A]"
          >
            Sign out
          </button>
        </>
      ) : (
        <Link href="/login" className="transition hover:text-[#A3B18A]">
          Login
        </Link>
      )}
      {logoutError && (
        <span role="alert" className="text-xs text-[#ffd0a8]">
          {logoutError}
        </span>
      )}
    </nav>
  );
}
