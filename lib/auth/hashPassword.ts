import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

function deriveKey(password: string, salt: Buffer) {
	return new Promise<Buffer>((resolve, reject) => {
		scrypt(password, salt, 64, (error, key) => {
			if (error) {
				reject(error);
				return;
			}
			resolve(key);
		});
	});
}

export async function hashPassword(password: string) {
	const salt = randomBytes(16);
	const key = await deriveKey(password, salt);
	return `${salt.toString("hex")}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
	const [saltHex, keyHex] = storedHash.split(":");
	if (!saltHex || !keyHex || !/^[a-f0-9]+$/i.test(saltHex) || !/^[a-f0-9]+$/i.test(keyHex)) {
		return false;
	}

	const salt = Buffer.from(saltHex, "hex");
	const expectedKey = Buffer.from(keyHex, "hex");
	if (salt.length !== 16 || expectedKey.length !== 64) {
		return false;
	}

	const actualKey = await deriveKey(password, salt);
	return timingSafeEqual(actualKey, expectedKey);
}
