import { findUserByEmail } from "@/lib/auth/findUserByEmail";
import { verifyPassword } from "@/lib/auth/hashPassword";
import { createSession } from "@/lib/auth/session";

export const runtime = "nodejs";

function getSafeErrorDetails(error: unknown) {
  if (typeof error !== "object" || error === null) return { errorType: typeof error };
  const details: { errorType?: string; errorCode?: string | number; codeName?: string } = {};
  if ("name" in error && typeof error.name === "string") details.errorType = error.name;
  if ("code" in error && (typeof error.code === "string" || typeof error.code === "number")) {
    details.errorCode = error.code;
  }
  if ("codeName" in error && typeof error.codeName === "string") details.codeName = error.codeName;
  return details;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return Response.json({ error: "Email and password are required." }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input.password === "string" ? input.password : "";
  if (!email || email.length > 254 || !password || password.length > 128) {
    return Response.json({ error: "Email and password are required." }, { status: 400 });
  }

  let user;
  try {
    user = await findUserByEmail(email);
  } catch (error) {
    console.error("[auth:login] user lookup failed", getSafeErrorDetails(error));
    return Response.json({ error: "Sign in is temporarily unavailable." }, { status: 500 });
  }
  if (!user || typeof user.passwordHash !== "string") {
    return Response.json({ error: "Email or password is incorrect." }, { status: 401 });
  }

  let passwordMatches: boolean;
  try {
    passwordMatches = await verifyPassword(password, user.passwordHash);
  } catch (error) {
    console.error("[auth:login] password verification failed", getSafeErrorDetails(error));
    return Response.json({ error: "Sign in is temporarily unavailable." }, { status: 500 });
  }
  if (!passwordMatches) {
    return Response.json({ error: "Email or password is incorrect." }, { status: 401 });
  }

  try {
    await createSession(user._id.toHexString());
  } catch (error) {
    console.error("[auth:login] session creation failed", getSafeErrorDetails(error));
    return Response.json({ error: "Sign in is temporarily unavailable." }, { status: 500 });
  }

  return Response.json({
    user: { id: user._id.toHexString(), username: user.username, email: user.email },
  });
}
