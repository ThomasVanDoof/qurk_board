
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function BoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/board");
  }

  return <>{children}</>;
}
