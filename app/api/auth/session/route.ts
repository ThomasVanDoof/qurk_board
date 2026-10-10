import { destroyCurrentSession, getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });
    return Response.json({ user });
  } catch {
    return Response.json({ error: "Unable to read the current session." }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await destroyCurrentSession();
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "Unable to end the current session." }, { status: 500 });
  }
}
