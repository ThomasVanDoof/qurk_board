import type { RegistrationData } from "@/lib/auth/validateRegistrationData";
import { registerUser } from "@/lib/auth/registerUser";
import { createSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }
  if (!isRegistrationData(body)) {
    return Response.json(
      { success: false, error: "Username, email, password, and confirmation are required." },
      { status: 400 },
    );
  }

  try {
    const result = await registerUser(body);
    if (!result.success || !result.user) {
      return Response.json(result, { status: 400 });
    }

    await createSession(String(result.user.id));

    return Response.json(
      {
        success: true,
        user: {
          id: String(result.user.id),
          username: result.user.username,
          email: result.user.email,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[auth:register] registration failed", getSafeErrorDetails(error));

    return Response.json(
      {
        success: false,
        error: "Something went wrong while creating the account.",
      },
      { status: 500 },
    );
  }
}

function isRegistrationData(value: unknown): value is RegistrationData {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "username" in value &&
    typeof value.username === "string" &&
    "email" in value &&
    typeof value.email === "string" &&
    "password" in value &&
    typeof value.password === "string" &&
    "confirmPassword" in value &&
    typeof value.confirmPassword === "string"
  );
}

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
