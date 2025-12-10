import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { seedMilitaryRanks } from "./military-ranks.seed.js";
import { assignPermissionsToRoles, seedPermissions } from "./permissions.seed.js";
import { seedRegions } from "./regions.seed.js";
import { seedRoles } from "./roles.seed.js";
import { seedTenants } from "./tenants.seed.js";
import { seedITAdmin } from "./users.seed.js";

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

	console.log("=== Seeding Regions ===");
	await seedRegions(prisma, tenantId);
	console.log("");

	console.log("=== Seeding IT Admin User ===");
	await seedITAdmin(prisma, tenantId);
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
