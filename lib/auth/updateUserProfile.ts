import "server-only";
import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/db";
import type { PublicUser, UserRecord } from "@/lib/auth/types";

export async function updateUserProfile(
  userId: string,
  username: string,
): Promise<PublicUser | null> {
  if (!/^[a-f\d]{24}$/i.test(userId)) return null;
  const users = (await getDatabase()).collection<UserRecord>("users");
  const id = new ObjectId(userId);
  const result = await users.updateOne(
    { _id: id },
    { $set: { username, usernameNormalized: username.toLowerCase() } },
  );
  if (result.matchedCount === 0) return null;
  const user = await users.findOne({ _id: id });
  return user ? { id: user._id.toHexString(), username: user.username, email: user.email } : null;
}
