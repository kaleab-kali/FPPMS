import { PrismaClient, SalaryScaleStatus } from "@prisma/client";

const RANK_CATEGORIES = {
	ENLISTED: "ENLISTED",
	NCO: "NCO",
	JUNIOR_OFFICER: "JUNIOR_OFFICER",
	SENIOR_OFFICER: "SENIOR_OFFICER",
	EXECUTIVE: "EXECUTIVE",
	GENERAL: "GENERAL",
} as const;

const STEP_PERIOD_YEARS = 2;
const STEP_COUNT = 9;

interface RankSalaryData {
	code: string;
	name: string;
	nameAm: string;
	category: string;
	level: number;
	baseSalary: number;
	steps: number[];
	ceiling: number;
}

const POLICE_SALARY_SCALE_2018_EC: RankSalaryData[] = [
	{
		code: "CONST",
		name: "Constable",
		nameAm: "\u12AE\u1295\u1235\u1273\u1265\u120D",
		category: RANK_CATEGORIES.ENLISTED,
		level: 1,
		baseSalary: 6365,
		steps: [6591, 6818, 7054, 7297, 7549, 7809, 8079, 8357, 8646],
		ceiling: 8944,
	},
	{
		code: "ASST_SGT",
		name: "Assistant Sergeant",
		nameAm: "\u1228\u12F3\u1275 \u1233\u1305\u1295",
		category: RANK_CATEGORIES.ENLISTED,
		level: 2,
		baseSalary: 7054,
		steps: [7297, 7549, 7809, 8079, 8357, 8646, 8944, 9239, 9544],
		ceiling: 9859,
	},
	{
		code: "DEP_SGT",
		name: "Deputy Sergeant",
		nameAm: "\u121D\u12AD\u1275\u120D \u1233\u1305\u1295",
		category: RANK_CATEGORIES.ENLISTED,
		level: 3,
		baseSalary: 7809,
		steps: [8079, 8357, 8646, 8944, 9239, 9544, 9859, 10179, 10688],
		ceiling: 11223,
	},
	{
		code: "SGT",
		name: "Sergeant",
		nameAm: "\u1233\u1305\u1295",
		category: RANK_CATEGORIES.ENLISTED,
		level: 4,
		baseSalary: 8646,
		steps: [8944, 9239, 9544, 9859, 10179, 10688, 11223, 11784, 12373],
		ceiling: 12992,
	},
	{
		code: "CHIEF_SGT",
		name: "Chief Sergeant",
		nameAm: "\u12CB\u1293 \u1233\u1305\u1295",
		category: RANK_CATEGORIES.NCO,
		level: 5,
		baseSalary: 9544,
		steps: [9859, 10179, 10688, 11223, 11784, 12373, 12992, 13641, 14296],
		ceiling: 14975,
	},
	{
		code: "ASST_INSP",
		name: "Assistant Inspector",
		nameAm: "\u1228\u12F3\u1275 \u12A2\u1295\u1235\u1354\u12AD\u1270\u122D",
		category: RANK_CATEGORIES.NCO,
		level: 6,
		baseSalary: 10688,
		steps: [11223, 11784, 12373, 12992, 13641, 14296, 14975, 15671, 16384],
		ceiling: 17121,
	},
	{
		code: "DEP_INSP",
		name: "Deputy Inspector",
		nameAm: "\u121D\u12AD\u1275\u120D \u12A2\u1295\u1235\u1354\u12AD\u1270\u122D",
		category: RANK_CATEGORIES.JUNIOR_OFFICER,
		level: 7,
		baseSalary: 12373,
		steps: [12992, 13641, 14296, 14975, 15671, 16384, 17121, 17892, 18697],
		ceiling: 19538,
	},
	{
		code: "INSP",
		name: "Inspector",
		nameAm: "\u12A2\u1295\u1235\u1354\u12AD\u1270\u122D",
		category: RANK_CATEGORIES.JUNIOR_OFFICER,
		level: 8,
		baseSalary: 14296,
		steps: [14975, 15671, 16384, 17121, 17892, 18697, 19538, 20418, 21336],
		ceiling: 22256,
	},
	{
		code: "CHIEF_INSP",
		name: "Chief Inspector",
		nameAm: "\u12CB\u1293 \u12A2\u1295\u1235\u1354\u12AD\u1270\u122D",
		category: RANK_CATEGORIES.JUNIOR_OFFICER,
		level: 9,
		baseSalary: 16384,
		steps: [17121, 17892, 18697, 19538, 20418, 21336, 22256, 23215, 24215],
		ceiling: 25232,
	},
	{
		code: "DEP_CMD",
		name: "Deputy Commander",
		nameAm: "\u121D\u12AD\u1275\u120D \u12AE\u121B\u1295\u12F0\u122D",
		category: RANK_CATEGORIES.SENIOR_OFFICER,
		level: 10,
		baseSalary: 18697,
		steps: [19538, 20418, 21336, 22256, 23215, 24215, 25232, 26267, 27310],
		ceiling: 28361,
	},
	{
		code: "CMD",
		name: "Commander",
		nameAm: "\u12AE\u121B\u1295\u12F0\u122D",
		category: RANK_CATEGORIES.SENIOR_OFFICER,
		level: 11,
		baseSalary: 21336,
		steps: [22256, 23215, 24215, 25232, 26267, 27310, 28361, 29439, 30522],
		ceiling: 31627,
	},
	{
		code: "ASST_COMM",
		name: "Assistant Commissioner",
		nameAm: "\u1228\u12F3\u1275 \u12AE\u121A\u123D\u1290\u122D",
		category: RANK_CATEGORIES.EXECUTIVE,
		level: 12,
		baseSalary: 24215,
		steps: [25232, 26267, 27310, 28361, 29439, 30522, 31627, 32750, 33880],
		ceiling: 35011,
	},
	{
		code: "DEP_COMM",
		name: "Deputy Commissioner",
		nameAm: "\u121D\u12AD\u1275\u120D \u12AE\u121A\u123D\u1290\u122D",
		category: RANK_CATEGORIES.EXECUTIVE,
		level: 13,
		baseSalary: 27310,
		steps: [28361, 29439, 30522, 31627, 32750, 33880, 35011, 36146, 37317],
		ceiling: 38526,
	},
	{
		code: "COMM",
		name: "Commissioner",
		nameAm: "\u12AE\u121A\u123D\u1290\u122D",
		category: RANK_CATEGORIES.EXECUTIVE,
		level: 14,
		baseSalary: 30522,
		steps: [31627, 32750, 33880, 35011, 36146, 37317, 38526, 39774, 41063],
		ceiling: 42393,
	},
	{
		code: "DEP_COMM_GEN",
		name: "Deputy Commissioner General",
		nameAm: "\u121D/\u12AE\u121A/\u1300\u1290\u122B\u120D",
		category: RANK_CATEGORIES.GENERAL,
		level: 15,
		baseSalary: 32750,
		steps: [33880, 35011, 36146, 37317, 38526, 39774, 41063, 42393, 43610],
		ceiling: 44412,
	},
	{
		code: "COMM_GEN",
		name: "Commissioner General",
		nameAm: "\u12AE\u121A\u123D\u1290\u122D \u1300\u1290\u122B\u120D",
		category: RANK_CATEGORIES.GENERAL,
		level: 16,
		baseSalary: 35011,
		steps: [36146, 37317, 38526, 39774, 41063, 42393, 43610, 44412, 45633],
		ceiling: 46865,
	},
];

export const seedSalaryScales = async (prisma: PrismaClient): Promise<void> => {
	console.log("Seeding salary scales...");

	const existingScale = await prisma.salaryScaleVersion.findFirst({
		where: { code: "2018-EC" },
	});

	if (existingScale) {
		console.log("Salary scale 2018-EC already exists, skipping...");
		return;
	}

	const scaleVersion = await prisma.salaryScaleVersion.create({
		data: {
			code: "2018-EC",
			name: "Police Salary Scale 2018 EC",
			nameAm: "\u12E8\u1356\u120A\u1235 \u12E8\u12F0\u121E\u12DD \u1235\u12AC\u120D 2018 \u12D3.\u121D",
			description: "Official Ethiopian Federal Police salary scale effective from 2018 Ethiopian Calendar",
			effectiveDate: new Date("2025-09-11"),
			status: SalaryScaleStatus.ACTIVE,
			stepCount: STEP_COUNT,
			stepPeriodYears: STEP_PERIOD_YEARS,
		},
	});

	console.log(`Created salary scale version: ${scaleVersion.code}`);

	for (const rankData of POLICE_SALARY_SCALE_2018_EC) {
		const scaleRank = await prisma.salaryScaleRank.create({
			data: {
				scaleVersionId: scaleVersion.id,
				rankCode: rankData.code,
				rankName: rankData.name,
				rankNameAm: rankData.nameAm,
				category: rankData.category,
				level: rankData.level,
				baseSalary: rankData.baseSalary,
				ceilingSalary: rankData.ceiling,
				sortOrder: rankData.level,
			},
		});

		const salarySteps = [
			{ stepNumber: 0, salaryAmount: rankData.baseSalary, yearsRequired: 0 },
			...rankData.steps.map((amount, index) => ({
				stepNumber: index + 1,
				salaryAmount: amount,
				yearsRequired: (index + 1) * STEP_PERIOD_YEARS,
			})),
		];

		await prisma.salaryScaleStep.createMany({
			data: salarySteps.map((step) => ({
				scaleRankId: scaleRank.id,
				stepNumber: step.stepNumber,
				salaryAmount: step.salaryAmount,
				yearsRequired: step.yearsRequired,
			})),
		});

		console.log(`  Created rank salary: ${rankData.name} with ${salarySteps.length} steps`);
	}

	console.log("Salary scales seeded successfully!");
};
