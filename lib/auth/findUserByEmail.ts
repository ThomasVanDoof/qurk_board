import client from "@/lib/mongodb";

export async function findUserByEmail(email: string) {
  const database = client.db("qurkboard");
  const users = database.collection("users");

  return await users.findOne({ email: email.trim().toLowerCase() });
}
