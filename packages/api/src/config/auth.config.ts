import { registerAs } from "@nestjs/config";

export const authConfig = registerAs("auth", () => ({
	jwtSecret: process.env.JWT_SECRET || "change-this-secret-in-production",
	jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
	sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || "30", 10),
	maxFailedAttempts: parseInt(process.env.MAX_FAILED_ATTEMPTS || "5", 10),
	lockoutDuration: parseInt(process.env.LOCKOUT_DURATION || "30", 10),
	passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH || "8", 10),
	passwordExpiryDays: parseInt(process.env.PASSWORD_EXPIRY_DAYS || "90", 10),
	saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10),
}));
