import "server-only";
import { getDatabase } from "@/lib/db";
import type { UserRecord } from "@/lib/auth/types";

export async function findUserByEmail(email: string) {
	const database = await getDatabase();
	const normalizedEmail = email.trim().toLowerCase();
	return database.collection<UserRecord>("users").findOne(
		{
			$or: [
				{ emailNormalized: normalizedEmail },
				{ email: normalizedEmail },
			],
		},
		{ collation: { locale: "en", strength: 2 } },
	);
}
