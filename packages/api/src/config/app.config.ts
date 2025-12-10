import { registerAs } from "@nestjs/config";

export const appConfig = registerAs("app", () => ({
	name: process.env.APP_NAME || "EPPMS",
	env: process.env.NODE_ENV || "development",
	port: parseInt(process.env.PORT || "3000", 10),
	apiPrefix: process.env.API_PREFIX || "api",
	corsOrigins: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:5173"],
	defaultTenantCode: process.env.DEFAULT_TENANT_CODE || "HQ",
	employeeIdPrefix: process.env.EMPLOYEE_ID_PREFIX || "FPC",
}));
