import { getDatabase } from "@/lib/db";

export interface NewUser {
  username: string;
  email: string;
  password: string;
}

export async function createUser(user: NewUser) {
  const database = await getDatabase();
  const users = database.collection("users");

  const normalizedUsername = user.username.trim().toLowerCase();
  const normalizedEmail = user.email.trim().toLowerCase();

  const result = await users.insertOne({
    username: user.username.trim(),
    usernameNormalized: normalizedUsername,
    email: normalizedEmail,
    emailNormalized: normalizedEmail,
    passwordHash: user.password,
    createdAt: new Date(),
  });

  return {
    id: result.insertedId,
    username: user.username.trim(),
    email: normalizedEmail,
  };
}
