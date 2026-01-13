import { PrismaClient } from "@prisma/client";

interface CommitteeTypeData {
	code: string;
	name: string;
	nameAm: string;
	description: string;
	descriptionAm: string;
	isPermanent: boolean;
	requiresCenter: boolean;
	minMembers: number;
	maxMembers?: number;
}

const COMMITTEE_TYPES: CommitteeTypeData[] = [
	{
		code: "DISCIPLINE",
		name: "Discipline Committee",
		nameAm: "የዲሲፕሊን ኮሚቴ",
		description: "Handles Article 31 serious disciplinary offenses at center level",
		descriptionAm: "በማዕከል ደረጃ አንቀጽ 31 ከባድ የዲሲፕሊን ጥፋቶችን ያስተናግዳል",
		isPermanent: true,
		requiresCenter: true,
		minMembers: 5,
		maxMembers: 7,
	},
	{
		code: "GRIEVANCE",
		name: "Grievance Committee",
		nameAm: "የቅሬታ ኮሚቴ",
		description: "Reviews employee grievances and complaints at center level",
		descriptionAm: "በማዕከል ደረጃ የሰራተኞች ቅሬታዎችን እና አቤቱታዎችን ይገመግማል",
		isPermanent: true,
		requiresCenter: true,
		minMembers: 3,
		maxMembers: 5,
	},
	{
		code: "ETHICS",
		name: "Ethics Committee",
		nameAm: "የስነ-ምግባር ኮሚቴ",
		description: "Ensures ethical standards at center level",
		descriptionAm: "በማዕከል ደረጃ የስነ-ምግባር ደረጃዎችን ያረጋግጣል",
		isPermanent: true,
		requiresCenter: true,
		minMembers: 3,
		maxMembers: 5,
	},
	{
		code: "PROMOTION",
		name: "Promotion Committee",
		nameAm: "የእድገት ኮሚቴ",
		description: "Evaluates and recommends employee promotions at HQ level",
		descriptionAm: "በዋና መስሪያ ቤት ደረጃ የሰራተኞች እድገትን ይገመግማል እና ይመክራል",
		isPermanent: true,
		requiresCenter: false,
		minMembers: 5,
		maxMembers: 9,
	},
	{
		code: "TRANSFER",
		name: "Transfer Committee",
		nameAm: "የዝውውር ኮሚቴ",
		description: "Reviews and approves employee transfer requests at HQ level",
		descriptionAm: "በዋና መስሪያ ቤት ደረጃ የሰራተኛ ዝውውር ጥያቄዎችን ይገመግማል እና ያፀድቃል",
		isPermanent: true,
		requiresCenter: false,
		minMembers: 5,
		maxMembers: 7,
	},
	{
		code: "HQ_DISCIPLINE",
		name: "HQ Discipline Committee",
		nameAm: "የዋና መስሪያ ቤት ዲሲፕሊን ኮሚቴ",
		description: "Handles appeals and serious cases forwarded from centers",
		descriptionAm: "ከማዕከላት የተላለፉ ይግባኝ እና ከባድ ጉዳዮችን ያስተናግዳል",
		isPermanent: true,
		requiresCenter: false,
		minMembers: 7,
		maxMembers: 11,
	},
	{
		code: "RECRUITMENT",
		name: "Recruitment Committee",
		nameAm: "የቅጥር ኮሚቴ",
		description: "Handles recruitment and selection processes at HQ level",
		descriptionAm: "በዋና መስሪያ ቤት ደረጃ የቅጥር እና የምርጫ ሂደቶችን ያስተናግዳል",
		isPermanent: false,
		requiresCenter: false,
		minMembers: 3,
		maxMembers: 7,
	},
	{
		code: "APPRAISAL",
		name: "Performance Appraisal Committee",
		nameAm: "የአፈጻጸም ምዘና ኮሚቴ",
		description: "Oversees employee performance evaluation at center level",
		descriptionAm: "በማዕከል ደረጃ የሰራተኛ አፈጻጸም ምዘናን ይቆጣጠራል",
		isPermanent: true,
		requiresCenter: true,
		minMembers: 3,
		maxMembers: 5,
	},
	{
		code: "SAFETY",
		name: "Safety Committee",
		nameAm: "የደህንነት ኮሚቴ",
		description: "Ensures workplace safety at center level",
		descriptionAm: "በማዕከል ደረጃ የስራ ቦታ ደህንነትን ያረጋግጣል",
		isPermanent: true,
		requiresCenter: true,
		minMembers: 5,
		maxMembers: 9,
	},
];

export const seedCommitteeTypes = async (prisma: PrismaClient, tenantId: string): Promise<void> => {
	let createdCount = 0;

	for (const typeData of COMMITTEE_TYPES) {
		const existing = await prisma.committeeType.findFirst({
			where: { tenantId, code: typeData.code },
		});

		if (existing) {
			console.log(`Committee type ${typeData.code} already exists, skipping...`);
			continue;
		}

		await prisma.committeeType.create({
			data: {
				tenantId,
				code: typeData.code,
				name: typeData.name,
				nameAm: typeData.nameAm,
				description: typeData.description,
				descriptionAm: typeData.descriptionAm,
				isPermanent: typeData.isPermanent,
				requiresCenter: typeData.requiresCenter,
				minMembers: typeData.minMembers,
				maxMembers: typeData.maxMembers,
				isActive: true,
			},
		});

		createdCount++;
		console.log(
			`Created committee type: ${typeData.name} (${typeData.code}) - ${typeData.requiresCenter ? "Center-level" : "HQ-level"}`,
		);
	}

	console.log(`Seeded ${createdCount} committee types`);
};

export const seedCommittees = async (prisma: PrismaClient, tenantId: string): Promise<void> => {
	const centers = await prisma.center.findMany({
		where: { tenantId, isActive: true },
	});

	const centerRequiredTypes = await prisma.committeeType.findMany({
		where: { tenantId, requiresCenter: true, isActive: true },
	});

	const hqTypes = await prisma.committeeType.findMany({
		where: { tenantId, requiresCenter: false, isActive: true },
	});

	const hqCenter = centers.find((c) => c.code === "HQ");

	let createdCount = 0;

	for (const center of centers) {
		for (const committeeType of centerRequiredTypes) {
			const code = `${center.code}-${committeeType.code}`;

			const existing = await prisma.committee.findFirst({
				where: { tenantId, code },
			});

			if (existing) {
				continue;
			}

			await prisma.committee.create({
				data: {
					tenantId,
					committeeTypeId: committeeType.id,
					centerId: center.id,
					code,
					name: `${center.name} ${committeeType.name}`,
					nameAm: `${center.nameAm} ${committeeType.nameAm}`,
					description: `${committeeType.description} for ${center.name}`,
					descriptionAm: `ለ${center.nameAm} ${committeeType.descriptionAm}`,
					establishedDate: new Date(),
					establishedBy: "SYSTEM_SEED",
					status: "ACTIVE",
					isActive: true,
				},
			});

			createdCount++;
			console.log(`Created committee: ${code} at ${center.code}`);
		}
	}

	if (hqCenter) {
		for (const committeeType of hqTypes) {
			const code = `HQ-${committeeType.code}`;

			const existing = await prisma.committee.findFirst({
				where: { tenantId, code },
			});

			if (existing) {
				continue;
			}

			await prisma.committee.create({
				data: {
					tenantId,
					committeeTypeId: committeeType.id,
					centerId: null,
					code,
					name: `${committeeType.name}`,
					nameAm: `${committeeType.nameAm}`,
					description: committeeType.description ?? "",
					descriptionAm: committeeType.descriptionAm,
					establishedDate: new Date(),
					establishedBy: "SYSTEM_SEED",
					status: "ACTIVE",
					isActive: true,
				},
			});

			createdCount++;
			console.log(`Created HQ committee: ${code}`);
		}
	}

	console.log(`Seeded ${createdCount} committees (center-level + HQ-level)`);
};
