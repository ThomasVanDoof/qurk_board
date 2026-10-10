import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/db";
import type { PublicUser, SessionRecord, UserRecord } from "@/lib/auth/types";

export const sessionCookieName = "qurk_session";
const sessionLifetimeSeconds = 60 * 60 * 24 * 30;

function publicUser(user: UserRecord): PublicUser {
  return { id: user._id.toHexString(), username: user.username, email: user.email };
}

function cookieOptions(expires: Date) {
  return {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const database = await getDatabase();
  const sessions = database.collection<SessionRecord>("sessions");
  await sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + sessionLifetimeSeconds * 1000);
  await sessions.insertOne({
    _id: new ObjectId(),
    tokenHash: hashSessionToken(token),
    userId: new ObjectId(userId),
    createdAt: new Date(),
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, token, cookieOptions(expiresAt));
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  if (!token) return null;

  const database = await getDatabase();
  const session = await database.collection<SessionRecord>("sessions").findOne({
    tokenHash: hashSessionToken(token),
    expiresAt: { $gt: new Date() },
  });
  if (!session) return null;

  const user = await database.collection<UserRecord>("users").findOne({ _id: session.userId });
  return user ? publicUser(user) : null;
}

export async function destroyCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  try {
    if (token) {
      const database = await getDatabase();
      await database
        .collection<SessionRecord>("sessions")
        .deleteOne({ tokenHash: hashSessionToken(token) });
    }
  } catch {
    console.error("[auth:logout] Stored session cleanup failed.");
  } finally {
    cookieStore.delete(sessionCookieName);
  }
}
