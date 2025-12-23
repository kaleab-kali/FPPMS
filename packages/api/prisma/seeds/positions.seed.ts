import { PrismaClient } from "@prisma/client";

const POSITIONS = [
	{
		code: "DIR",
		name: "Director",
		nameAm: "ዳይሬክተር",
		description: "Department or center director",
		sortOrder: 1,
	},
	{
		code: "DDIR",
		name: "Deputy Director",
		nameAm: "ምክትል ዳይሬክተር",
		description: "Deputy department or center director",
		sortOrder: 2,
	},
	{
		code: "DHEAD",
		name: "Department Head",
		nameAm: "የክፍል ኃላፊ",
		description: "Head of department",
		sortOrder: 3,
	},
	{
		code: "TLEADER",
		name: "Team Leader",
		nameAm: "የቡድን መሪ",
		description: "Team leader position",
		sortOrder: 4,
	},
	{
		code: "SOFF",
		name: "Senior Officer",
		nameAm: "ከፍተኛ መኮንን",
		description: "Senior level officer",
		sortOrder: 5,
	},
	{
		code: "OFF",
		name: "Officer",
		nameAm: "መኮንን",
		description: "Standard officer position",
		sortOrder: 6,
	},
	{
		code: "JOFF",
		name: "Junior Officer",
		nameAm: "ጀማሪ መኮንን",
		description: "Junior level officer",
		sortOrder: 7,
	},
	{
		code: "GRD",
		name: "Guard",
		nameAm: "ጠባቂ",
		description: "Security guard position",
		sortOrder: 8,
	},
	{
		code: "AAST",
		name: "Administrative Assistant",
		nameAm: "የአስተዳደር ረዳት",
		description: "Administrative support staff",
		sortOrder: 9,
	},
	{
		code: "HRSP",
		name: "HR Specialist",
		nameAm: "የሰው ሀይል ባለሙያ",
		description: "Human resources specialist",
		sortOrder: 10,
	},
	{
		code: "ACCT",
		name: "Accountant",
		nameAm: "የሂሳብ ባለሙያ",
		description: "Financial accountant",
		sortOrder: 11,
	},
	{
		code: "ITSP",
		name: "IT Specialist",
		nameAm: "የአይቲ ባለሙያ",
		description: "Information technology specialist",
		sortOrder: 12,
	},
	{
		code: "NURSE",
		name: "Nurse",
		nameAm: "ነርስ",
		description: "Medical nurse",
		sortOrder: 13,
	},
	{
		code: "DOCTOR",
		name: "Doctor",
		nameAm: "ዶክተር",
		description: "Medical doctor",
		sortOrder: 14,
	},
	{
		code: "LEGAL",
		name: "Legal Officer",
		nameAm: "የህግ መኮንን",
		description: "Legal affairs officer",
		sortOrder: 15,
	},
] as const;

export const seedPositions = async (prisma: PrismaClient, tenantId: string): Promise<void> => {
	for (const pos of POSITIONS) {
		const existing = await prisma.position.findFirst({
			where: { tenantId, code: pos.code },
		});

		if (existing) {
			console.log(`Position ${pos.code} already exists, skipping...`);
			continue;
		}

		await prisma.position.create({
			data: {
				tenantId,
				code: pos.code,
				name: pos.name,
				nameAm: pos.nameAm,
				description: pos.description,
				sortOrder: pos.sortOrder,
				isActive: true,
			},
		});

		console.log(`Created position: ${pos.name} (${pos.code})`);
	}
};
