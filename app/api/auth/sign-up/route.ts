import { createSession } from "@/lib/auth/session";
import { registerUser } from "@/lib/auth/registerUser";
import { validateRegistrationData } from "@/lib/auth/validateRegistrationData";

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
		return Response.json({ error: "Registration data is required." }, { status: 400 });
	}

	const input = body as Record<string, unknown>;
	const data = {
		username: typeof input.username === "string" ? input.username : "",
		email: typeof input.email === "string" ? input.email : "",
		password: typeof input.password === "string" ? input.password : "",
		confirmPassword: typeof input.confirmPassword === "string" ? input.confirmPassword : "",
	};
	const validation = validateRegistrationData(data);
	if (!validation.valid) {
		return Response.json({ error: "Check the highlighted fields.", errors: validation.errors }, { status: 400 });
	}

	let user;
	try {
		const registration = await registerUser(data);
		if (!registration.ok) {
			const error = registration.conflict === "username"
				? "That username is already in use."
				: "An account with this email already exists.";
			return Response.json({ error }, { status: 409 });
		}
		user = registration.user;
	} catch (error) {
		console.error("[auth:sign-up] user registration failed", getSafeErrorDetails(error));
		return Response.json({ error: "Account creation is temporarily unavailable." }, { status: 500 });
	}

	try {
		await createSession(user.id);
	} catch (error) {
		console.error("[auth:sign-up] session creation failed", getSafeErrorDetails(error));
		return Response.json({ error: "Account creation is temporarily unavailable." }, { status: 500 });
	}

	return Response.json({ user }, { status: 201 });
}