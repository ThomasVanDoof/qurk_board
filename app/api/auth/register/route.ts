import { registerUser } from "@/lib/auth/registerUser";
import { createSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const result = await registerUser(data);

    if (!result.success || !result.user) {
      return Response.json(result, { status: 400 });
    }

    await createSession(String(result.user.id));

    return Response.json({
      success: true,
      user: {
        id: String(result.user.id),
        username: result.user.username,
        email: result.user.email,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("[auth:register] registration failed", getSafeErrorDetails(error));

    return Response.json(
      {
        success: false,
        error: "Something went wrong while creating the account.",
      },
      { status: 500 }
    );
  }
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
