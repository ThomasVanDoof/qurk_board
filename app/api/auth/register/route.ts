import { registerUser } from "@/lib/auth/registerUser";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const result = await registerUser(data);

    if (!result.success) {
      return Response.json(result, { status: 400 });
    }

    return Response.json(result, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);

    return Response.json(
      {
        success: false,
        error: "Something went wrong while creating the account.",
      },
      { status: 500 }
    );
  }
}
