import { PrismaClient } from "@prisma/client";

const RANK_CATEGORIES = {
	ENLISTED: "ENLISTED",
	NCO: "NCO",
	JUNIOR_OFFICER: "JUNIOR_OFFICER",
	SENIOR_OFFICER: "SENIOR_OFFICER",
	EXECUTIVE: "EXECUTIVE",
	GENERAL: "GENERAL",
} as const;

const RETIREMENT_AGES = {
	ENLISTED: 50,
	NCO: 52,
	OFFICER: 55,
} as const;

const POLICE_RANKS = [
	{
		code: "CONST",
		name: "Constable",
		nameAm: "ኮንስታብል",
		level: 1,
		category: RANK_CATEGORIES.ENLISTED,
		baseSalary: 6365,
		steps: [6591, 6818, 7054, 7297, 7549, 7809, 8079, 8357, 8646],
		ceilingSalary: 8944,
		retirementAge: RETIREMENT_AGES.ENLISTED,
		minYearsForPromotion: 3,
	},
	{
		code: "ASST_SGT",
		name: "Assistant Sergeant",
		nameAm: "ረዳት ሳጅን",
		level: 2,
		category: RANK_CATEGORIES.ENLISTED,
		baseSalary: 7054,
		steps: [7297, 7549, 7809, 8079, 8357, 8646, 8944, 9239, 9544],
		ceilingSalary: 9859,
		retirementAge: RETIREMENT_AGES.ENLISTED,
		minYearsForPromotion: 3,
	},
	{
		code: "DEP_SGT",
		name: "Deputy Sergeant",
		nameAm: "ምክትል ሳጅን",
		level: 3,
		category: RANK_CATEGORIES.ENLISTED,
		baseSalary: 7809,
		steps: [8079, 8357, 8646, 8944, 9239, 9544, 9859, 10179, 10688],
		ceilingSalary: 11223,
		retirementAge: RETIREMENT_AGES.ENLISTED,
		minYearsForPromotion: 3,
	},
	{
		code: "SGT",
		name: "Sergeant",
		nameAm: "ሳጅን",
		level: 4,
		category: RANK_CATEGORIES.ENLISTED,
		baseSalary: 8646,
		steps: [8944, 9239, 9544, 9859, 10179, 10688, 11223, 11784, 12373],
		ceilingSalary: 12992,
		retirementAge: RETIREMENT_AGES.ENLISTED,
		minYearsForPromotion: 3,
	},
	{
		code: "CHIEF_SGT",
		name: "Chief Sergeant",
		nameAm: "ዋና ሳጅን",
		level: 5,
		category: RANK_CATEGORIES.NCO,
		baseSalary: 9544,
		steps: [9859, 10179, 10688, 11223, 11784, 12373, 12992, 13641, 14296],
		ceilingSalary: 14975,
		retirementAge: RETIREMENT_AGES.NCO,
		minYearsForPromotion: 3,
	},
	{
		code: "ASST_INSP",
		name: "Assistant Inspector",
		nameAm: "ረዳት ኢንስፔክተር",
		level: 6,
		category: RANK_CATEGORIES.NCO,
		baseSalary: 10688,
		steps: [11223, 11784, 12373, 12992, 13641, 14296, 14975, 15671, 16384],
		ceilingSalary: 17121,
		retirementAge: RETIREMENT_AGES.NCO,
		minYearsForPromotion: 4,
	},
	{
		code: "DEP_INSP",
		name: "Deputy Inspector",
		nameAm: "ምክትል ኢንስፔክተር",
		level: 7,
		category: RANK_CATEGORIES.JUNIOR_OFFICER,
		baseSalary: 12373,
		steps: [12992, 13641, 14296, 14975, 15671, 16384, 17121, 17892, 18697],
		ceilingSalary: 19538,
		retirementAge: RETIREMENT_AGES.OFFICER,
		minYearsForPromotion: 4,
	},
	{
		code: "INSP",
		name: "Inspector",
		nameAm: "ኢንስፔክተር",
		level: 8,
		category: RANK_CATEGORIES.JUNIOR_OFFICER,
		baseSalary: 14296,
		steps: [14975, 15671, 16384, 17121, 17892, 18697, 19538, 20418, 21336],
		ceilingSalary: 22256,
		retirementAge: RETIREMENT_AGES.OFFICER,
		minYearsForPromotion: 4,
	},
	{
		code: "CHIEF_INSP",
		name: "Chief Inspector",
		nameAm: "ዋና ኢንስፔክተር",
		level: 9,
		category: RANK_CATEGORIES.JUNIOR_OFFICER,
		baseSalary: 16384,
		steps: [17121, 17892, 18697, 19538, 20418, 21336, 22256, 23215, 24215],
		ceilingSalary: 25232,
		retirementAge: RETIREMENT_AGES.OFFICER,
		minYearsForPromotion: 4,
	},
	{
		code: "DEP_CMDR",
		name: "Deputy Commander",
		nameAm: "ምክትል ኮማንደር",
		level: 10,
		category: RANK_CATEGORIES.SENIOR_OFFICER,
		baseSalary: 18697,
		steps: [19538, 20418, 21336, 22256, 23215, 24215, 25232, 26267, 27310],
		ceilingSalary: 28361,
		retirementAge: RETIREMENT_AGES.OFFICER,
		minYearsForPromotion: 4,
	},
	{
		code: "CMDR",
		name: "Commander",
		nameAm: "ኮማንደር",
		level: 11,
		category: RANK_CATEGORIES.SENIOR_OFFICER,
		baseSalary: 21336,
		steps: [22256, 23215, 24215, 25232, 26267, 27310, 28361, 29439, 30522],
		ceilingSalary: 31627,
		retirementAge: RETIREMENT_AGES.OFFICER,
		minYearsForPromotion: 5,
	},
	{
		code: "ASST_COMM",
		name: "Assistant Commissioner",
		nameAm: "ረዳት ኮሚሽነር",
		level: 12,
		category: RANK_CATEGORIES.EXECUTIVE,
		baseSalary: 24215,
		steps: [25232, 26267, 27310, 28361, 29439, 30522, 31627, 32750, 33880],
		ceilingSalary: 35011,
		retirementAge: RETIREMENT_AGES.OFFICER,
		minYearsForPromotion: 5,
	},
	{
		code: "DEP_COMM",
		name: "Deputy Commissioner",
		nameAm: "ምክትል ኮሚሽነር",
		level: 13,
		category: RANK_CATEGORIES.EXECUTIVE,
		baseSalary: 27310,
		steps: [28361, 29439, 30522, 31627, 32750, 33880, 35011, 36146, 37317],
		ceilingSalary: 38526,
		retirementAge: RETIREMENT_AGES.OFFICER,
		minYearsForPromotion: 5,
	},
	{
		code: "COMM",
		name: "Commissioner",
		nameAm: "ኮሚሽነር",
		level: 14,
		category: RANK_CATEGORIES.EXECUTIVE,
		baseSalary: 30522,
		steps: [31627, 32750, 33880, 35011, 36146, 37317, 38526, 39774, 41063],
		ceilingSalary: 42393,
		retirementAge: RETIREMENT_AGES.OFFICER,
		minYearsForPromotion: 5,
	},
	{
		code: "DEP_COMM_GEN",
		name: "Deputy Commissioner General",
		nameAm: "ም/ኮሚ/ጀነራል",
		level: 15,
		category: RANK_CATEGORIES.GENERAL,
		baseSalary: 32750,
		steps: [33880, 35011, 36146, 37317, 38526, 39774, 41063, 42393, 43610],
		ceilingSalary: 44412,
		retirementAge: RETIREMENT_AGES.OFFICER,
		minYearsForPromotion: 5,
	},
	{
		code: "COMM_GEN",
		name: "Commissioner General",
		nameAm: "ኮሚሽነር ጀነራል",
		level: 16,
		category: RANK_CATEGORIES.GENERAL,
		baseSalary: 35011,
		steps: [36146, 37317, 38526, 39774, 41063, 42393, 43610, 44412, 45633],
		ceilingSalary: 46865,
		retirementAge: RETIREMENT_AGES.OFFICER,
		minYearsForPromotion: null,
	},
];

const DEFAULT_STEP_COUNT = 9;
const DEFAULT_STEP_PERIOD_YEARS = 2;

export const seedMilitaryRanks = async (prisma: PrismaClient): Promise<void> => {
	for (const [index, rank] of POLICE_RANKS.entries()) {
		const existing = await prisma.militaryRank.findFirst({
			where: { code: rank.code, tenantId: null },
		});

		if (existing) {
			console.log(`Rank ${rank.code} already exists, skipping...`);
			continue;
		}

		const createdRank = await prisma.militaryRank.create({
			data: {
				code: rank.code,
				name: rank.name,
				nameAm: rank.nameAm,
				level: rank.level,
				category: rank.category,
				baseSalary: rank.baseSalary,
				ceilingSalary: rank.ceilingSalary,
				stepCount: DEFAULT_STEP_COUNT,
				stepPeriodYears: DEFAULT_STEP_PERIOD_YEARS,
				retirementAge: rank.retirementAge,
				minYearsForPromotion: rank.minYearsForPromotion,
				sortOrder: index,
				isActive: true,
				tenantId: null,
			},
		});

		await prisma.militaryRankSalaryStep.create({
			data: {
				rankId: createdRank.id,
				stepNumber: 0,
				salaryAmount: rank.baseSalary,
				yearsRequired: 0,
			},
		});

		for (const [stepIndex, stepSalary] of rank.steps.entries()) {
			const stepNumber = stepIndex + 1;
			await prisma.militaryRankSalaryStep.create({
				data: {
					rankId: createdRank.id,
					stepNumber: stepNumber,
					salaryAmount: stepSalary,
					yearsRequired: stepNumber * DEFAULT_STEP_PERIOD_YEARS,
				},
			});
		}

		console.log(`Created rank: ${rank.name} (${rank.code}) with ${DEFAULT_STEP_COUNT + 1} salary steps (base + 9 steps)`);
	}
};
