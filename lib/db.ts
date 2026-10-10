import "server-only";
import { MongoClient } from "mongodb";

let clientPromise: Promise<MongoClient> | undefined;

async function getClient() {
  const uri = process.env.MONGODB_DB_URI;
  if (!uri) {
    throw new Error("MONGODB_DB_URI is not configured.");
  }

  if (!clientPromise) {
    clientPromise = new MongoClient(uri).connect().catch((error: unknown) => {
      clientPromise = undefined;
      throw error;
    });
  }

  return clientPromise;
}

export async function getDatabase() {
  const databaseName = process.env.MONGODB_DB_NAME;
  if (!databaseName) {
    throw new Error("MONGODB_DB_NAME is not configured.");
  }

  return (await getClient()).db(databaseName);
}
