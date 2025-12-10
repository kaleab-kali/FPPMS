import { PrismaClient } from "@prisma/client";

const ETHIOPIAN_REGIONS = [
	{ code: "AA", name: "Addis Ababa", nameAm: "\u12A0\u12F2\u1235 \u12A0\u1260\u1263", sortOrder: 1 },
	{ code: "AF", name: "Afar", nameAm: "\u12A0\u134B\u122D", sortOrder: 2 },
	{ code: "AM", name: "Amhara", nameAm: "\u12A0\u121B\u122B", sortOrder: 3 },
	{
		code: "BG",
		name: "Benishangul-Gumuz",
		nameAm: "\u1264\u1292\u123B\u1295\u1309\u120D-\u1309\u1219\u12DD",
		sortOrder: 4,
	},
	{ code: "DD", name: "Dire Dawa", nameAm: "\u12F5\u122C \u12F3\u12CB", sortOrder: 5 },
	{ code: "GA", name: "Gambela", nameAm: "\u130B\u121D\u1264\u120B", sortOrder: 6 },
	{ code: "HR", name: "Harari", nameAm: "\u1210\u1228\u122D", sortOrder: 7 },
	{ code: "OR", name: "Oromia", nameAm: "\u12A6\u122E\u121A\u12EB", sortOrder: 8 },
	{ code: "SD", name: "Sidama", nameAm: "\u1232\u12F3\u121B", sortOrder: 9 },
	{ code: "SM", name: "Somali", nameAm: "\u1236\u121B\u120C", sortOrder: 10 },
	{
		code: "SW",
		name: "South West Ethiopia",
		nameAm: "\u12F0\u1261\u1265 \u121D\u12D5\u122B\u1265 \u12A2\u1275\u12EE\u1335\u12EB",
		sortOrder: 11,
	},
	{
		code: "SN",
		name: "Southern Nations",
		nameAm: "\u12F0\u1261\u1265 \u1265\u1214\u122E\u127D \u1265\u1214\u1228\u1230\u1266\u127D",
		sortOrder: 12,
	},
	{ code: "TG", name: "Tigray", nameAm: "\u1275\u130D\u122B\u12ED", sortOrder: 13 },
	{
		code: "CT",
		name: "Central Ethiopia",
		nameAm: "\u121B\u12D5\u12A8\u120B\u12CA \u12A2\u1275\u12EE\u1335\u12EB",
		sortOrder: 14,
	},
];

export const seedRegions = async (prisma: PrismaClient, tenantId: string): Promise<void> => {
	for (const region of ETHIOPIAN_REGIONS) {
		const existing = await prisma.region.findFirst({
			where: { tenantId, code: region.code },
		});

		if (existing) {
			console.log(`Region ${region.code} already exists, skipping...`);
			continue;
		}

		await prisma.region.create({
			data: {
				tenantId,
				code: region.code,
				name: region.name,
				nameAm: region.nameAm,
				sortOrder: region.sortOrder,
				isActive: true,
			},
		});

		console.log(`Created region: ${region.name} (${region.code})`);
	}
};
