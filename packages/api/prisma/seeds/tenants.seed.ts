import { PrismaClient } from "@prisma/client";

export const seedTenants = async (prisma: PrismaClient): Promise<string> => {
	const existingTenant = await prisma.tenant.findFirst({
		where: { code: "FPC" },
	});

	if (existingTenant) {
		console.log("Default tenant already exists, skipping...");
		return existingTenant.id;
	}

	const tenant = await prisma.tenant.create({
		data: {
			code: "FPC",
			name: "Federal Prison Commission",
			nameAm: "የፌደራል ማረሚያ ኮሚሽን",
			type: "GOVERNMENT",
			isActive: true,
			settings: {},
		},
	});

	console.log(`Created tenant: ${tenant.name} (${tenant.code})`);
	return tenant.id;
};
