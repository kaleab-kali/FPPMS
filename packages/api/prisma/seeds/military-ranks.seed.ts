import { PrismaClient } from "@prisma/client";

const RANK_CATEGORIES = {
	CONSTABLE: "CONSTABLE",
	NCO: "NCO",
	OFFICER: "OFFICER",
	SENIOR_OFFICER: "SENIOR_OFFICER",
} as const;

const RETIREMENT_AGES = {
	CONSTABLE_NCO: 50,
	JUNIOR_OFFICER: 52,
	SENIOR_OFFICER: 55,
} as const;

const MILITARY_RANKS = [
	{
		code: "CONST",
		name: "Constable",
		nameAm: "ኮንስታብል",
		level: 1,
		category: RANK_CATEGORIES.CONSTABLE,
		baseSalary: 4500,
		ceilingSalary: 6300,
		retirementAge: RETIREMENT_AGES.CONSTABLE_NCO,
		minYearsForPromotion: 3,
	},
	{
		code: "ACPL",
		name: "Assistant Corporal",
		nameAm: "ረዳት ኮርፖራል",
		level: 2,
		category: RANK_CATEGORIES.CONSTABLE,
		baseSalary: 5000,
		ceilingSalary: 7000,
		retirementAge: RETIREMENT_AGES.CONSTABLE_NCO,
		minYearsForPromotion: 3,
	},
	{
		code: "CPL",
		name: "Corporal",
		nameAm: "ኮርፖራል",
		level: 3,
		category: RANK_CATEGORIES.CONSTABLE,
		baseSalary: 5500,
		ceilingSalary: 7700,
		retirementAge: RETIREMENT_AGES.CONSTABLE_NCO,
		minYearsForPromotion: 3,
	},
	{
		code: "SGT",
		name: "Sergeant",
		nameAm: "ሳጅንት",
		level: 4,
		category: RANK_CATEGORIES.NCO,
		baseSalary: 6000,
		ceilingSalary: 8400,
		retirementAge: RETIREMENT_AGES.CONSTABLE_NCO,
		minYearsForPromotion: 3,
	},
	{
		code: "SSGT",
		name: "Staff Sergeant",
		nameAm: "ስታፍ ሳጅንት",
		level: 5,
		category: RANK_CATEGORIES.NCO,
		baseSalary: 6500,
		ceilingSalary: 9100,
		retirementAge: RETIREMENT_AGES.CONSTABLE_NCO,
		minYearsForPromotion: 3,
	},
	{
		code: "MSGT",
		name: "Master Sergeant",
		nameAm: "ማስተር ሳጅንት",
		level: 6,
		category: RANK_CATEGORIES.NCO,
		baseSalary: 7000,
		ceilingSalary: 9800,
		retirementAge: RETIREMENT_AGES.CONSTABLE_NCO,
		minYearsForPromotion: 4,
	},
	{
		code: "SMSGT",
		name: "Senior Master Sergeant",
		nameAm: "ከፍተኛ ማስተር ሳጅንት",
		level: 7,
		category: RANK_CATEGORIES.NCO,
		baseSalary: 7500,
		ceilingSalary: 10500,
		retirementAge: RETIREMENT_AGES.CONSTABLE_NCO,
		minYearsForPromotion: 4,
	},
	{
		code: "2LT",
		name: "Second Lieutenant",
		nameAm: "ሜቶ ሌተናንት",
		level: 8,
		category: RANK_CATEGORIES.OFFICER,
		baseSalary: 8500,
		ceilingSalary: 11900,
		retirementAge: RETIREMENT_AGES.JUNIOR_OFFICER,
		minYearsForPromotion: 3,
	},
	{
		code: "1LT",
		name: "First Lieutenant",
		nameAm: "አንደኛ ሌተናንት",
		level: 9,
		category: RANK_CATEGORIES.OFFICER,
		baseSalary: 9500,
		ceilingSalary: 13300,
		retirementAge: RETIREMENT_AGES.JUNIOR_OFFICER,
		minYearsForPromotion: 3,
	},
	{
		code: "CPT",
		name: "Captain",
		nameAm: "ካፕቴን",
		level: 10,
		category: RANK_CATEGORIES.OFFICER,
		baseSalary: 10500,
		ceilingSalary: 14700,
		retirementAge: RETIREMENT_AGES.JUNIOR_OFFICER,
		minYearsForPromotion: 4,
	},
	{
		code: "MAJ",
		name: "Major",
		nameAm: "ሜጀር",
		level: 11,
		category: RANK_CATEGORIES.OFFICER,
		baseSalary: 12000,
		ceilingSalary: 16800,
		retirementAge: RETIREMENT_AGES.JUNIOR_OFFICER,
		minYearsForPromotion: 4,
	},
	{
		code: "LTCOL",
		name: "Lieutenant Colonel",
		nameAm: "ሌተናንት ኮሎኔል",
		level: 12,
		category: RANK_CATEGORIES.SENIOR_OFFICER,
		baseSalary: 14000,
		ceilingSalary: 19600,
		retirementAge: RETIREMENT_AGES.SENIOR_OFFICER,
		minYearsForPromotion: 4,
	},
	{
		code: "COL",
		name: "Colonel",
		nameAm: "ኮሎኔል",
		level: 13,
		category: RANK_CATEGORIES.SENIOR_OFFICER,
		baseSalary: 16000,
		ceilingSalary: 22400,
		retirementAge: RETIREMENT_AGES.SENIOR_OFFICER,
		minYearsForPromotion: 5,
	},
	{
		code: "BGEN",
		name: "Brigadier General",
		nameAm: "ብሪጌዲየር ጀነራል",
		level: 14,
		category: RANK_CATEGORIES.SENIOR_OFFICER,
		baseSalary: 18000,
		ceilingSalary: 25200,
		retirementAge: RETIREMENT_AGES.SENIOR_OFFICER,
		minYearsForPromotion: 5,
	},
	{
		code: "MGEN",
		name: "Major General",
		nameAm: "ሜጀር ጀነራል",
		level: 15,
		category: RANK_CATEGORIES.SENIOR_OFFICER,
		baseSalary: 20000,
		ceilingSalary: 28000,
		retirementAge: RETIREMENT_AGES.SENIOR_OFFICER,
		minYearsForPromotion: 5,
	},
	{
		code: "LGEN",
		name: "Lieutenant General",
		nameAm: "ሌተናንት ጀነራል",
		level: 16,
		category: RANK_CATEGORIES.SENIOR_OFFICER,
		baseSalary: 22000,
		ceilingSalary: 30800,
		retirementAge: RETIREMENT_AGES.SENIOR_OFFICER,
		minYearsForPromotion: null,
	},
];

const DEFAULT_STEP_COUNT = 9;
const DEFAULT_STEP_PERIOD_YEARS = 2;

export const seedMilitaryRanks = async (prisma: PrismaClient): Promise<void> => {
	for (const [index, rank] of MILITARY_RANKS.entries()) {
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

		const salaryIncrement = (rank.ceilingSalary - rank.baseSalary) / (DEFAULT_STEP_COUNT - 1);
		for (let step = 1; step <= DEFAULT_STEP_COUNT; step++) {
			const salaryAmount = rank.baseSalary + salaryIncrement * (step - 1);
			await prisma.militaryRankSalaryStep.create({
				data: {
					rankId: createdRank.id,
					stepNumber: step,
					salaryAmount: Math.round(salaryAmount),
					yearsRequired: (step - 1) * DEFAULT_STEP_PERIOD_YEARS,
				},
			});
		}

		console.log(`Created rank: ${rank.name} (${rank.code}) with ${DEFAULT_STEP_COUNT} salary steps`);
	}
};
