"use client";
import { useState } from "react";
import { validateRegistrationData } from "@/lib/auth/validateRegistrationData";
import Link from "next/link";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    }>({});

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  const result = validateRegistrationData({
    username,
    email,
    password,
    confirmPassword,
  });

  setErrors(result.errors);

  if (!result.valid) {
    return;
  }

  console.log("Registration data is valid:", {
    username,
    email,
    password,
  });
};

  return (

    
    
    <main className="min-h-screen bg-[#DAD7CD] text-[#344E41]">
      {/* Header */}
      <header className="bg-[#344E41] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-3xl font-bold tracking-tight"
          >
            Qurk Board
          </Link>

          <nav className="flex items-center gap-6 text-sm font-medium">
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
              className="rounded-lg bg-[#588157] px-4 py-2 transition hover:bg-[#3A5A40]"
            >
              Log In
            </Link>
          </nav>
        </div>
      </header>

      {/* Register section */}
      <section className="flex min-h-[calc(100vh-76px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Register Card */}
          <div className="rounded-2xl bg-white p-8 shadow-lg sm:p-10">

            {/* Heading */}
            <div className="mb-8 text-center">

              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#A3B18A] text-2xl font-bold text-[#344E41]">
                Q
              </div>

              <h1 className="text-3xl font-bold text-[#344E41]">
                Create your account
              </h1>

              <p className="mt-2 text-sm text-[#588157]">
                Start organizing your ideas with Qurk Board.
              </p>
            </div>

            {/* Form */}
           <form onSubmit={handleSubmit} className="space-y-5">

              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-semibold text-[#344E41]"
                >
                  Create username
                </label>

                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  className="w-full rounded-lg border-2 border-[#DAD7CD] bg-[#F8F8F5] px-4 py-3 text-sm text-[#344E41] outline-none transition placeholder:text-gray-400 focus:border-[#588157] focus:ring-2 focus:ring-[#A3B18A]"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                />

                {errors.username && (
                <p className="mt-1 text-sm text-red-600">
                {errors.username}
                </p>
                )}

              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[#344E41]"
                >
                  Email
                </label>

                <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-lg border-2 border-[#DAD7CD] bg-[#F8F8F5] px-4 py-3 text-sm text-[#344E41] outline-none transition placeholder:text-gray-400 focus:border-[#588157] focus:ring-2 focus:ring-[#A3B18A]"
                />

                {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                {errors.email}
                </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-[#344E41]"
                >
                  Create password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  className="w-full rounded-lg border-2 border-[#DAD7CD] bg-[#F8F8F5] px-4 py-3 text-sm text-[#344E41] outline-none transition placeholder:text-gray-400 focus:border-[#588157] focus:ring-2 focus:ring-[#A3B18A]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && (
  <p className="mt-1 text-sm text-red-600">
    {errors.password}
  </p>
)}
              </div>

              {/* Confirm password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-[#344E41]"
                >
                  Confirm password
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  className="w-full rounded-lg border-2 border-[#DAD7CD] bg-[#F8F8F5] px-4 py-3 text-sm text-[#344E41] outline-none transition placeholder:text-gray-400 focus:border-[#588157] focus:ring-2 focus:ring-[#A3B18A]"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#588157] px-4 py-3 font-semibold text-white transition hover:bg-[#3A5A40] focus:outline-none focus:ring-2 focus:ring-[#A3B18A] focus:ring-offset-2"
                >
                  Next
                </button>
              </div>
            </form>

            {/* Login */}
            <p className="mt-7 text-center text-sm text-[#588157]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-[#344E41] underline-offset-4 hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-[#588157]">
            Organize your ideas. Connect your plans. Build your path.
          </p>
            
        </div>
      </section>
    </main>
  );
}