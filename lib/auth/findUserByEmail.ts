import { getDatabase } from "@/lib/db";

export async function findUserByEmail(email: string) {
  const database = await getDatabase();
  const users = database.collection("users");
  const normalizedEmail = email.trim().toLowerCase();

  return await users.findOne({
    $or: [
      { emailNormalized: normalizedEmail },
      { email: normalizedEmail },
    ],
  });
}
