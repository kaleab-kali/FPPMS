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
			name: "Federal Police Commission",
			nameAm: "\u12E8\u134C\u12F4\u122B\u120D \u1356\u120A\u1235 \u12AE\u121A\u123D\u1295",
			type: "HQ",
			isActive: true,
			settings: {},
		},
	});

	console.log(`Created tenant: ${tenant.name} (${tenant.code})`);
	return tenant.id;
};
