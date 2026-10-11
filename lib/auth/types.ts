import type { ObjectId } from "mongodb";

export type UserRecord = {
  _id: ObjectId;
  username: string;
  usernameNormalized?: string;
  email: string;
  emailNormalized?: string;
  passwordHash?: string;
  createdAt: Date;
};

export type PublicUser = {
  id: string;
  username: string;
  email: string;
};

export type SessionRecord = {
  _id: ObjectId;
  tokenHash: string;
  userId: ObjectId;
  createdAt: Date;
  expiresAt: Date;
};
