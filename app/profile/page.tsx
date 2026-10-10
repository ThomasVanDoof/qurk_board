"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/profile", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Please sign in to view your profile.");
          }

          throw new Error("Could not load your profile.");
        }

        const data: UserProfile = await response.json();

        setUser(data);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred."
        );
      } finally {
        setLoading(false);
      }
    }

    void fetchProfile();
  }, []);

  const displayName = user?.username || "User";

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not available";

  return (
    <main className="min-h-screen bg-sand px-4 py-6 text-dark sm:px-8 sm:py-8">
      <div className="mx-auto max-w-6xl">
        {/* Page layout */}
        <div className="grid gap-6 md:grid-cols-[240px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="h-fit rounded-2xl border border-dark/10 bg-white/80 p-4 shadow-sm">
            <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-forest/60">Workspace</p>
            <nav className="space-y-2">
              <Link href="/profile" aria-current="page" className="flex items-center gap-3 rounded-xl bg-forest px-4 py-3 text-sm font-medium text-sand" >
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true" >
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                My Profile
              </Link>
              <Link href="/projects" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-dark/75 transition hover:bg-sage/30" >
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true" >
                  <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M3 9h18M9 9v11" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                My Projects
              </Link>
              <Link href="/" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-dark/75 transition hover:bg-sage/30" >
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true" >
                  <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                </svg>
                Home
              </Link>
            </nav>

            <div className="mt-6 rounded-xl bg-sand p-4">
              <p className="text-sm font-semibold text-forest">Your account</p>
              <p className="mt-1 text-xs leading-5 text-forest/70">View your account information and registration date.</p>
            </div>
          </aside>
          {/* Main content */}
          <section className="min-w-0">
            <div className="mb-6">
              <p className="text-sm font-medium text-green">Account</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">My Profile</h1>
              <p className="mt-2 text-sm text-forest/75">View your personal account information.</p>
            </div>
            {/* Loading state */}
            {loading && (
              <div
                role="status"
                className="rounded-2xl border border-dark/10 bg-white/80 p-10 text-center shadow-sm"
              >
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-sage border-t-forest" />
                <p className="text-sm text-forest/70">Loading your profile...</p>
              </div>
            )}

            {/* Error state */}
            {!loading && error && (
              <div role="alert" className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm" >
                <h2 className="font-semibold text-red-700">Unable to load profile</h2>
                <p className="mt-2 text-sm text-red-600">
                  {error}
                </p>
                <button type="button"
                  onClick={() => window.location.reload()}
                  className="mt-5 rounded-lg bg-forest px-5 py-3 text-sm font-semibold text-sand transition hover:bg-green"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Profile information */}
            {!loading && !error && user && (
              <>
                <div className="mb-6 rounded-2xl border border-dark/10 bg-white/80 p-6 shadow-sm sm:p-8">
                  <div className="flex flex-col items-center gap-5 sm:flex-row">
                    {/* Avatar */}
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-forest text-3xl font-semibold text-sand shadow-md ring-4 ring-sage/40">
                      {displayName.charAt(0).toUpperCase()}
                    </div>

                    {/* Username and email */}
                    <div className="min-w-0 flex-1 text-center sm:text-left">
                      <h2 className="wrap-break-word text-2xl font-semibold tracking-tight">
                        {displayName}
                      </h2>

                      <p className="mt-1 wrap-break-word text-sm text-forest/70">
                        {user.email}
                      </p>

                      <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-sage/30 px-3 py-1 text-xs font-medium text-forest">
                        <span className="h-2 w-2 rounded-full bg-green" />
                        Qurk Board member
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-dark/10 bg-white/80 p-6 shadow-sm sm:p-8">
                  <div className="mb-5">
                    <h2 className="text-xl font-semibold">Personal information</h2>
                    <p className="mt-1 text-sm text-forest/70">Your account details.</p>
                  </div>
                  <div className="divide-y divide-sage/70">
                    <div className="grid gap-1 py-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4">
                      <p className="text-sm text-forest/70">Username</p>
                      <p className="wrap-break-word text-sm font-medium">
                        {user.username}
                      </p>
                    </div>

                    <div className="grid gap-1 py-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4">
                      <p className="text-sm text-forest/70">Email address</p>
                      <p className="wrap-break-word text-sm font-medium">
                        {user.email}
                      </p>
                    </div>
                    <div className="grid gap-1 py-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4">
                      <p className="text-sm text-forest/70">Member since</p>
                      <p className="text-sm font-medium">
                        {Number.isNaN(Date.parse(user.createdAt))
                          ? "Not available"
                          : formattedDate}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
