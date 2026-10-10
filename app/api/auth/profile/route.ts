import { getCurrentUser } from "@/lib/auth/session";
import { updateUserProfile } from "@/lib/auth/updateUserProfile";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  let user;
  try {
    user = await getCurrentUser();
  } catch {
    return Response.json({ error: "Unable to verify the current session." }, { status: 500 });
  }
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body) ||
    !("username" in body) ||
    typeof body.username !== "string"
  ) {
    return Response.json({ error: "A username is required." }, { status: 400 });
  }
  const username = body.username.trim();
  if (username.length < 3 || username.length > 40) {
    return Response.json(
      { error: "Username must be between 3 and 40 characters." },
      { status: 400 },
    );
  }
  try {
    const updatedUser = await updateUserProfile(user.id, username);
    if (!updatedUser) return Response.json({ error: "Account not found." }, { status: 404 });
    return Response.json({ user: updatedUser });
  } catch {
    return Response.json({ error: "Unable to update profile." }, { status: 500 });
  }
}
