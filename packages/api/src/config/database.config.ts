import { registerAs } from "@nestjs/config";

export const databaseConfig = registerAs("database", () => ({
	url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/eppms?schema=public",
	logging: process.env.DATABASE_LOGGING === "true",
	maxConnections: parseInt(process.env.DATABASE_MAX_CONNECTIONS || "10", 10),
}));
