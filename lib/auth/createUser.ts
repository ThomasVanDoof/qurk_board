import "server-only";
import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/db";
import type { PublicUser, UserRecord } from "@/lib/auth/types";

export type CreateUserResult =
	| { ok: true; user: PublicUser }
	| { ok: false; conflict: "email" | "username" };

export async function createUser(username: string, email: string, passwordHash: string): Promise<CreateUserResult> {
	const users = (await getDatabase()).collection<UserRecord>("users");
	await users.createIndex({ email: 1 }, { unique: true });

	const normalizedUsername = username.trim().toLowerCase();
	const normalizedEmail = email.trim().toLowerCase();
	const user: UserRecord = {
		_id: new ObjectId(),
		username: username.trim(),
		usernameNormalized: normalizedUsername,
		email: normalizedEmail,
		emailNormalized: normalizedEmail,
		passwordHash,
		createdAt: new Date(),
	};

	try {
		await users.insertOne(user);
	} catch (error) {
		if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
			const keyPattern = "keyPattern" in error && typeof error.keyPattern === "object" && error.keyPattern !== null
				? error.keyPattern
				: undefined;
			return { ok: false, conflict: keyPattern && "usernameNormalized" in keyPattern ? "username" : "email" };
		}
		throw error;
	}

	return { ok: true, user: { id: user._id.toHexString(), username: user.username, email: user.email } };
}
