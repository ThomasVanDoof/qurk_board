"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

import { validateRegistrationData } from "@/lib/auth/validateRegistrationData";
import Input from "@/components/Input";
import Button from "@/components/Button";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState("");

  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

const handleSubmit = async (
  event: React.FormEvent<HTMLFormElement>
) => {
  event.preventDefault();

  setSuccessMessage("");

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

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
        confirmPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setErrors(data.errors || {});
      return;
    }

  setSuccessMessage("Account created successfully! Redirecting to login...");

  setTimeout(() => {
  router.push("/login");
}, 2000);

  } catch (error) {
    console.error("Registration error:", error);
  }
};

  return (
    <main className="min-h-full bg-[#DAD7CD] text-[#344E41]">
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
             <Input
  label="Create username"
  name="username"
  type="text"
  placeholder="Enter your username"
  value={username}
  onChange={(event) => setUsername(event.target.value)}
/>

                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />

                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <Input
                  label="Create password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />

                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <Input
                  label="Confirm password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />

                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
              
                {successMessage && (
                <p  role="status"className="rounded-lg bg-[#DDE8D5] p-3 text-center text-sm font-medium text-[#344E41]">
             {successMessage} </p>
              )}

              {/* Submit */}
              <div className="pt-3">
                <Button type="submit">
                  Next
                </Button>
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

        </div>
      </section>
    </main>
  );
}