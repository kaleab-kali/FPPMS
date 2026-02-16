import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ENCRYPTED_PREFIX = "enc:";

let cachedKey: Buffer | undefined;

const getEncryptionKey = (): Buffer | undefined => {
	if (cachedKey) return cachedKey;
	const secret = process.env.FIELD_ENCRYPTION_KEY;
	if (!secret) return undefined;
	const salt = process.env.FIELD_ENCRYPTION_SALT ?? "ppms-field-encryption-salt";
	cachedKey = scryptSync(secret, salt, KEY_LENGTH);
	return cachedKey;
};

export const isEncryptionEnabled = (): boolean => !!process.env.FIELD_ENCRYPTION_KEY;

export const encryptField = (plaintext: string): string => {
	if (!plaintext) return plaintext;
	if (plaintext.startsWith(ENCRYPTED_PREFIX)) return plaintext;

	const key = getEncryptionKey();
	if (!key) return plaintext;

	const iv = randomBytes(IV_LENGTH);
	const cipher = createCipheriv(ALGORITHM, key, iv);

	const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
	const authTag = cipher.getAuthTag();

	const combined = Buffer.concat([iv, authTag, encrypted]);
	return `${ENCRYPTED_PREFIX}${combined.toString("base64")}`;
};

export const decryptField = (ciphertext: string): string => {
	if (!ciphertext) return ciphertext;
	if (!ciphertext.startsWith(ENCRYPTED_PREFIX)) return ciphertext;

	const key = getEncryptionKey();
	if (!key) return ciphertext;

	const combined = Buffer.from(ciphertext.slice(ENCRYPTED_PREFIX.length), "base64");

	const iv = combined.subarray(0, IV_LENGTH);
	const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
	const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

	const decipher = createDecipheriv(ALGORITHM, key, iv);
	decipher.setAuthTag(authTag);

	const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
	return decrypted.toString("utf8");
};

export const isEncrypted = (value: string): boolean => {
	return typeof value === "string" && value.startsWith(ENCRYPTED_PREFIX);
};

export const ENCRYPTED_EMPLOYEE_FIELDS = new Set([
	"passportNumber",
	"drivingLicense",
	"secondaryPhone",
	"email",
]) as ReadonlySet<string>;

export const ENCRYPTED_EMERGENCY_CONTACT_FIELDS = new Set([
	"phone",
	"alternativePhone",
	"email",
]) as ReadonlySet<string>;

export const ENCRYPTED_MOTHER_INFO_FIELDS = new Set(["phone"]) as ReadonlySet<string>;

export const encryptObject = <T extends Record<string, unknown>>(data: T, fields: ReadonlySet<string>): T => {
	if (!isEncryptionEnabled()) return data;
	const result = { ...data };
	for (const field of fields) {
		const value = result[field];
		if (typeof value === "string" && value.length > 0) {
			(result as Record<string, unknown>)[field] = encryptField(value);
		}
	}
	return result;
};

export const decryptObject = <T extends Record<string, unknown>>(data: T, fields: ReadonlySet<string>): T => {
	const result = { ...data };
	for (const field of fields) {
		const value = result[field];
		if (typeof value === "string" && isEncrypted(value)) {
			(result as Record<string, unknown>)[field] = decryptField(value);
		}
	}
	return result;
};
