import "server-only";
import { createUser, type CreateUserResult } from "@/lib/auth/createUser";
import { hashPassword } from "@/lib/auth/hashPassword";
import { findUserByEmail } from "@/lib/auth/findUserByEmail";
import type { RegistrationData } from "@/lib/auth/validateRegistrationData";

export async function registerUser(data: RegistrationData): Promise<CreateUserResult> {
	const email = data.email.trim().toLowerCase();
	if (await findUserByEmail(email)) {
		return { ok: false, conflict: "email" };
	}

	const passwordHash = await hashPassword(data.password);
	return createUser(data.username, email, passwordHash);
}
