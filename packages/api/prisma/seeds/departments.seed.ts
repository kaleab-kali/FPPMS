import { PrismaClient } from "@prisma/client";

const DEPARTMENTS = [
	{
		code: "ADM",
		name: "Administration",
		nameAm: "አስተዳደር",
		description: "Administrative operations and general management",
		sortOrder: 1,
	},
	{
		code: "HR",
		name: "Human Resources",
		nameAm: "የሰው ሀይል",
		description: "Human resources management and personnel affairs",
		sortOrder: 2,
	},
	{
		code: "SEC",
		name: "Security Operations",
		nameAm: "የጥበቃ ክፍል",
		description: "Security management and operations",
		sortOrder: 3,
	},
	{
		code: "RHB",
		name: "Rehabilitation",
		nameAm: "ማስተካከያ",
		description: "Prisoner rehabilitation and reform programs",
		sortOrder: 4,
	},
	{
		code: "MED",
		name: "Medical Services",
		nameAm: "የሕክምና አገልግሎት",
		description: "Medical and healthcare services",
		sortOrder: 5,
	},
	{
		code: "FIN",
		name: "Finance",
		nameAm: "ፋይናንስ",
		description: "Financial management and accounting",
		sortOrder: 6,
	},
	{
		code: "ICT",
		name: "ICT Department",
		nameAm: "የመረጃ ቴክኖሎጂ",
		description: "Information and communication technology",
		sortOrder: 7,
	},
	{
		code: "LEG",
		name: "Legal Affairs",
		nameAm: "የህግ ጉዳዮች",
		description: "Legal services and compliance",
		sortOrder: 8,
	},
	{
		code: "LOG",
		name: "Logistics",
		nameAm: "ሎጂስቲክስ",
		description: "Supply chain and logistics management",
		sortOrder: 9,
	},
	{
		code: "TRN",
		name: "Training",
		nameAm: "ስልጠና",
		description: "Staff training and development",
		sortOrder: 10,
	},
] as const;

export const seedDepartments = async (prisma: PrismaClient, tenantId: string): Promise<void> => {
	for (const dept of DEPARTMENTS) {
		const existing = await prisma.department.findFirst({
			where: { tenantId, code: dept.code },
		});

		if (existing) {
			console.log(`Department ${dept.code} already exists, skipping...`);
			continue;
		}

		await prisma.department.create({
			data: {
				tenantId,
				code: dept.code,
				name: dept.name,
				nameAm: dept.nameAm,
				description: dept.description,
				sortOrder: dept.sortOrder,
				isActive: true,
			},
		});

		console.log(`Created department: ${dept.name} (${dept.code})`);
	}
};
