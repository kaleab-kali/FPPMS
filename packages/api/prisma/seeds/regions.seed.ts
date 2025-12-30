import { PrismaClient } from "@prisma/client";

const ETHIOPIAN_REGIONS = [
	{ code: "AA", name: "Addis Ababa", nameAm: "አዲስ አበባ", sortOrder: 1 },
	{ code: "AF", name: "Afar", nameAm: "አፋር", sortOrder: 2 },
	{ code: "AM", name: "Amhara", nameAm: "አማራ", sortOrder: 3 },
	{ code: "BG", name: "Benishangul-Gumuz", nameAm: "ቤኒሻንጉል-ጉሙዝ", sortOrder: 4 },
	{ code: "DD", name: "Dire Dawa", nameAm: "ድሬ ዳዋ", sortOrder: 5 },
	{ code: "GA", name: "Gambela", nameAm: "ጋምቤላ", sortOrder: 6 },
	{ code: "HR", name: "Harari", nameAm: "ሀረር", sortOrder: 7 },
	{ code: "OR", name: "Oromia", nameAm: "ኦሮሚያ", sortOrder: 8 },
	{ code: "SD", name: "Sidama", nameAm: "ሲዳማ", sortOrder: 9 },
	{ code: "SM", name: "Somali", nameAm: "ሶማሌ", sortOrder: 10 },
	{ code: "SW", name: "South West Ethiopia", nameAm: "ደቡብ ምዕራብ ኢትዮጵያ", sortOrder: 11 },
	{ code: "SN", name: "Southern Nations", nameAm: "ደቡብ ብሔሮች ብሔረሰቦች", sortOrder: 12 },
	{ code: "TG", name: "Tigray", nameAm: "ትግራይ", sortOrder: 13 },
	{ code: "CT", name: "Central Ethiopia", nameAm: "ማዕከላዊ ኢትዮጵያ", sortOrder: 14 },
] as const;

const ADDIS_ABABA_SUBCITIES = [
	{ code: "AK", name: "Akaki Kaliti", nameAm: "አቃቂ ቃሊቲ", sortOrder: 1 },
	{ code: "NK", name: "Nifas Silk-Lafto", nameAm: "ንፋስ ስልክ-ላፍቶ", sortOrder: 2 },
	{ code: "KO", name: "Kolfe Keranio", nameAm: "ኮልፌ ቀራንዮ", sortOrder: 3 },
	{ code: "GU", name: "Gulele", nameAm: "ጉለሌ", sortOrder: 4 },
	{ code: "LD", name: "Lideta", nameAm: "ልደታ", sortOrder: 5 },
	{ code: "KI", name: "Kirkos", nameAm: "ቂርቆስ", sortOrder: 6 },
	{ code: "AR", name: "Arada", nameAm: "አራዳ", sortOrder: 7 },
	{ code: "AD", name: "Addis Ketema", nameAm: "አዲስ ከተማ", sortOrder: 8 },
	{ code: "YK", name: "Yeka", nameAm: "የካ", sortOrder: 9 },
	{ code: "BO", name: "Bole", nameAm: "ቦሌ", sortOrder: 10 },
	{ code: "LM", name: "Lemi Kura", nameAm: "ለሚ ኩራ", sortOrder: 11 },
] as const;

const ADDIS_ABABA_WOREDAS: Record<string, Array<{ code: string; name: string; nameAm: string; sortOrder: number }>> = {
	AK: [
		{ code: "AK01", name: "Woreda 01", nameAm: "ወረዳ 01", sortOrder: 1 },
		{ code: "AK02", name: "Woreda 02", nameAm: "ወረዳ 02", sortOrder: 2 },
		{ code: "AK03", name: "Woreda 03", nameAm: "ወረዳ 03", sortOrder: 3 },
	],
	NK: [
		{ code: "NK01", name: "Woreda 01", nameAm: "ወረዳ 01", sortOrder: 1 },
		{ code: "NK02", name: "Woreda 02", nameAm: "ወረዳ 02", sortOrder: 2 },
		{ code: "NK03", name: "Woreda 03", nameAm: "ወረዳ 03", sortOrder: 3 },
	],
	KO: [
		{ code: "KO01", name: "Woreda 01", nameAm: "ወረዳ 01", sortOrder: 1 },
		{ code: "KO02", name: "Woreda 02", nameAm: "ወረዳ 02", sortOrder: 2 },
		{ code: "KO03", name: "Woreda 03", nameAm: "ወረዳ 03", sortOrder: 3 },
	],
	GU: [
		{ code: "GU01", name: "Woreda 01", nameAm: "ወረዳ 01", sortOrder: 1 },
		{ code: "GU02", name: "Woreda 02", nameAm: "ወረዳ 02", sortOrder: 2 },
	],
	LD: [
		{ code: "LD01", name: "Woreda 01", nameAm: "ወረዳ 01", sortOrder: 1 },
		{ code: "LD02", name: "Woreda 02", nameAm: "ወረዳ 02", sortOrder: 2 },
	],
	KI: [
		{ code: "KI01", name: "Woreda 01", nameAm: "ወረዳ 01", sortOrder: 1 },
		{ code: "KI02", name: "Woreda 02", nameAm: "ወረዳ 02", sortOrder: 2 },
	],
	AR: [
		{ code: "AR01", name: "Woreda 01", nameAm: "ወረዳ 01", sortOrder: 1 },
		{ code: "AR02", name: "Woreda 02", nameAm: "ወረዳ 02", sortOrder: 2 },
	],
	AD: [
		{ code: "AD01", name: "Woreda 01", nameAm: "ወረዳ 01", sortOrder: 1 },
		{ code: "AD02", name: "Woreda 02", nameAm: "ወረዳ 02", sortOrder: 2 },
	],
	YK: [
		{ code: "YK01", name: "Woreda 01", nameAm: "ወረዳ 01", sortOrder: 1 },
		{ code: "YK02", name: "Woreda 02", nameAm: "ወረዳ 02", sortOrder: 2 },
		{ code: "YK03", name: "Woreda 03", nameAm: "ወረዳ 03", sortOrder: 3 },
	],
	BO: [
		{ code: "BO01", name: "Woreda 01", nameAm: "ወረዳ 01", sortOrder: 1 },
		{ code: "BO02", name: "Woreda 02", nameAm: "ወረዳ 02", sortOrder: 2 },
		{ code: "BO03", name: "Woreda 03", nameAm: "ወረዳ 03", sortOrder: 3 },
	],
	LM: [
		{ code: "LM01", name: "Woreda 01", nameAm: "ወረዳ 01", sortOrder: 1 },
		{ code: "LM02", name: "Woreda 02", nameAm: "ወረዳ 02", sortOrder: 2 },
	],
};

export const seedRegions = async (prisma: PrismaClient, tenantId: string): Promise<void> => {
	const regionMap: Record<string, string> = {};

	for (const region of ETHIOPIAN_REGIONS) {
		const existing = await prisma.region.findFirst({
			where: { tenantId, code: region.code },
		});

		if (existing) {
			console.log(`Region ${region.code} already exists, skipping...`);
			regionMap[region.code] = existing.id;
			continue;
		}

		const created = await prisma.region.create({
			data: {
				tenantId,
				code: region.code,
				name: region.name,
				nameAm: region.nameAm,
				sortOrder: region.sortOrder,
				isActive: true,
			},
		});

		regionMap[region.code] = created.id;
		console.log(`Created region: ${region.name} (${region.code})`);
	}

	const addisAbabaRegionId = regionMap.AA;
	if (!addisAbabaRegionId) {
		console.log("Addis Ababa region not found, skipping subcities and woredas");
		return;
	}

	const subCityMap: Record<string, string> = {};

	for (const subCity of ADDIS_ABABA_SUBCITIES) {
		const existing = await prisma.subCity.findFirst({
			where: { tenantId, code: subCity.code },
		});

		if (existing) {
			console.log(`SubCity ${subCity.code} already exists, skipping...`);
			subCityMap[subCity.code] = existing.id;
			continue;
		}

		const created = await prisma.subCity.create({
			data: {
				tenantId,
				regionId: addisAbabaRegionId,
				code: subCity.code,
				name: subCity.name,
				nameAm: subCity.nameAm,
				sortOrder: subCity.sortOrder,
				isActive: true,
			},
		});

		subCityMap[subCity.code] = created.id;
		console.log(`Created subcity: ${subCity.name} (${subCity.code})`);
	}

	for (const [subCityCode, woredas] of Object.entries(ADDIS_ABABA_WOREDAS)) {
		const subCityId = subCityMap[subCityCode];
		if (!subCityId) {
			console.log(`SubCity ${subCityCode} not found, skipping woredas`);
			continue;
		}

		for (const woreda of woredas) {
			const existing = await prisma.woreda.findFirst({
				where: { tenantId, code: woreda.code },
			});

			if (existing) {
				console.log(`Woreda ${woreda.code} already exists, skipping...`);
				continue;
			}

			await prisma.woreda.create({
				data: {
					tenantId,
					subCityId,
					code: woreda.code,
					name: woreda.name,
					nameAm: woreda.nameAm,
					sortOrder: woreda.sortOrder,
					isActive: true,
				},
			});

			console.log(`Created woreda: ${woreda.name} (${woreda.code}) in ${subCityCode}`);
		}
	}
};
