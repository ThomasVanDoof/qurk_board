import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth/session";

export default async function ProfileLayout({ children }: Readonly<{ children: ReactNode }>) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return children;
}
