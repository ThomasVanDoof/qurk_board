"use client";

import { useEffect, useState, type FormEvent } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";

type User = { id: string; username: string; email: string };
type UserResponse = { user: User };

async function readUserResponse(response: Response): Promise<UserResponse> {
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof body === "object" && body !== null && "error" in body && typeof body.error === "string"
        ? body.error
        : "Unable to load your profile.";
    throw new Error(message);
  }
  return body as UserResponse;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { cache: "no-store" })
      .then(readUserResponse)
      .then((data) => {
        if (!active) return;
        setUser(data.user);
        setUsername(data.user.username);
      })
      .catch((loadError: unknown) => {
        if (active)
          setError(loadError instanceof Error ? loadError.message : "Unable to load your profile.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await readUserResponse(response);
      setUser(data.user);
      setUsername(data.user.username);
      setMessage("Profile updated.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to update your profile.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#DAD7CD] px-6 py-12 text-[#344E41]">
      <section className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold">Your profile</h1>
        <p className="mt-2 text-[#3A5A40]">Account details</p>
        {isLoading ? (
          <p role="status" className="mt-8">
            Loading profile...
          </p>
        ) : (
          user && (
            <form
              onSubmit={(event) => {
                void saveProfile(event);
              }}
              className="mt-8 grid gap-5 rounded-lg border border-[#A3B18A] bg-white p-6"
            >
              <p className="grid gap-1 text-sm">
                <span className="font-medium">Email</span>
                <span>{user.email}</span>
              </p>
              <Input
                label="Username"
                name="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                minLength={3}
                maxLength={40}
                required
              />
              {error && (
                <p role="alert" className="text-sm text-red-700">
                  {error}
                </p>
              )}
              {message && (
                <p role="status" className="text-sm text-[#3A5A40]">
                  {message}
                </p>
              )}
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save profile"}
              </Button>
            </form>
          )
        )}
        {error && !isLoading && !user && (
          <p role="alert" className="mt-6 text-sm text-red-700">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}
