import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { seedCenters } from "./centers.seed.js";
import { seedDepartments } from "./departments.seed.js";
import { seedEmployees } from "./employees.seed.js";
import { seedHolidays } from "./holidays.seed.js";
import { seedLeaveTypes } from "./leave-types.seed.js";
import { seedMilitaryRanks } from "./military-ranks.seed.js";
import { assignPermissionsToRoles, seedPermissions } from "./permissions.seed.js";
import { seedPositions } from "./positions.seed.js";
import { seedRegions } from "./regions.seed.js";
import { seedRoles } from "./roles.seed.js";
import { seedTenants } from "./tenants.seed.js";
import { seedITAdmin, seedUsersFromEmployees } from "./users.seed.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });

const main = async (): Promise<void> => {
	console.log("Starting database seed...\n");

	console.log("=== Seeding Tenants ===");
	const tenantId = await seedTenants(prisma);
	console.log("");

	console.log("=== Seeding Roles ===");
	await seedRoles(prisma);
	console.log("");

	console.log("=== Seeding Permissions ===");
	await seedPermissions(prisma);
	await assignPermissionsToRoles(prisma);
	console.log("");

	console.log("=== Seeding Military Ranks ===");
	await seedMilitaryRanks(prisma);
	console.log("");

	console.log("=== Seeding Regions, SubCities, and Woredas ===");
	await seedRegions(prisma, tenantId);
	console.log("");

	console.log("=== Seeding Centers ===");
	await seedCenters(prisma, tenantId);
	console.log("");

	console.log("=== Seeding Departments ===");
	await seedDepartments(prisma, tenantId);
	console.log("");

	console.log("=== Seeding Positions ===");
	await seedPositions(prisma, tenantId);
	console.log("");

	console.log("=== Seeding Leave Types ===");
	await seedLeaveTypes(prisma, tenantId);
	console.log("");

	console.log("=== Seeding Holidays ===");
	await seedHolidays(prisma, tenantId);
	console.log("");

	console.log("=== Seeding Employees ===");
	await seedEmployees(prisma, tenantId);
	console.log("");

	console.log("=== Seeding IT Admin User ===");
	await seedITAdmin(prisma, tenantId);
	console.log("");

	console.log("=== Seeding Users from Employees ===");
	await seedUsersFromEmployees(prisma, tenantId);
	console.log("");

	console.log("Database seed completed successfully!");
};

main()
	.catch((e) => {
		console.error("Seed error:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
