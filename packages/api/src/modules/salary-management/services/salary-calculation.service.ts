import { Injectable, NotFoundException } from "@nestjs/common";
import { Decimal } from "@prisma/client/runtime/client";
import { PrismaService } from "#api/database/prisma.service";

const STEP_PERIOD_YEARS = 2;
const MAX_STEP = 9;
const MIN_STEP = 0;

interface SalaryStepInfo {
	stepNumber: number;
	salaryAmount: Decimal;
	yearsRequired: number;
}

interface NextEligibilityResult {
	nextStep: number;
	eligibilityDate: Date;
	isAtCeiling: boolean;
}

@Injectable()
export class SalaryCalculationService {
	constructor(private readonly prisma: PrismaService) {}

	async getSalaryForStep(rankId: string, stepNumber: number): Promise<Decimal> {
		const step = await this.prisma.militaryRankSalaryStep.findUnique({
			where: {
				rankId_stepNumber: {
					rankId,
					stepNumber,
				},
			},
		});

		if (!step) {
			throw new NotFoundException(`Salary step ${stepNumber} not found for rank ${rankId}`);
		}

		return step.salaryAmount;
	}

	async getAllStepsForRank(rankId: string): Promise<SalaryStepInfo[]> {
		const steps = await this.prisma.militaryRankSalaryStep.findMany({
			where: { rankId },
			orderBy: { stepNumber: "asc" },
		});

		if (steps.length === 0) {
			throw new NotFoundException(`No salary steps found for rank ${rankId}`);
		}

		return steps.map((step) => ({
			stepNumber: step.stepNumber,
			salaryAmount: step.salaryAmount,
			yearsRequired: step.yearsRequired,
		}));
	}

	async findStepForSalary(rankId: string, currentSalary: Decimal): Promise<{ step: number; salary: Decimal }> {
		const steps = await this.prisma.militaryRankSalaryStep.findMany({
			where: { rankId },
			orderBy: { stepNumber: "asc" },
		});

		if (steps.length === 0) {
			throw new NotFoundException(`No salary steps found for rank ${rankId}`);
		}

		for (const step of steps) {
			if (step.salaryAmount.greaterThanOrEqualTo(currentSalary)) {
				return {
					step: step.stepNumber,
					salary: step.salaryAmount,
				};
			}
		}

		const lastStep = steps[steps.length - 1];
		return {
			step: lastStep.stepNumber,
			salary: lastStep.salaryAmount,
		};
	}

	async calculateNextEligibilityDate(
		employmentDate: Date,
		currentStep: number,
		stepPeriodYears: number = STEP_PERIOD_YEARS,
	): Promise<NextEligibilityResult> {
		if (currentStep >= MAX_STEP) {
			return {
				nextStep: MAX_STEP,
				eligibilityDate: new Date(),
				isAtCeiling: true,
			};
		}

		const nextStep = currentStep + 1;
		const yearsRequired = nextStep * stepPeriodYears;
		const eligibilityDate = new Date(employmentDate);
		eligibilityDate.setFullYear(eligibilityDate.getFullYear() + yearsRequired);

		return {
			nextStep,
			eligibilityDate,
			isAtCeiling: false,
		};
	}

	async calculateSalaryProjection(
		rankId: string,
		currentStep: number,
		employmentDate: Date,
		yearsToProject: number = 20,
	): Promise<
		Array<{
			year: number;
			step: number;
			salary: Decimal;
			effectiveDate: Date;
			isCeiling: boolean;
		}>
	> {
		const steps = await this.getAllStepsForRank(rankId);
		const rank = await this.prisma.militaryRank.findUnique({
			where: { id: rankId },
			select: { stepPeriodYears: true },
		});

		const stepPeriodYears = rank?.stepPeriodYears ?? STEP_PERIOD_YEARS;
		const projections: Array<{
			year: number;
			step: number;
			salary: Decimal;
			effectiveDate: Date;
			isCeiling: boolean;
		}> = [];

		const currentYear = new Date().getFullYear();
		let projectedStep = currentStep;

		for (let yearOffset = 0; yearOffset <= yearsToProject && projectedStep <= MAX_STEP; yearOffset++) {
			const yearsFromEmployment = yearOffset + (currentYear - employmentDate.getFullYear());
			const stepForYear = Math.min(Math.floor(yearsFromEmployment / stepPeriodYears), MAX_STEP);

			if (stepForYear > projectedStep || yearOffset === 0) {
				projectedStep = Math.max(stepForYear, currentStep);
				const stepInfo = steps.find((s) => s.stepNumber === projectedStep);

				if (stepInfo) {
					const effectiveDate = new Date(employmentDate);
					effectiveDate.setFullYear(employmentDate.getFullYear() + projectedStep * stepPeriodYears);

					projections.push({
						year: currentYear + yearOffset,
						step: projectedStep,
						salary: stepInfo.salaryAmount,
						effectiveDate,
						isCeiling: projectedStep >= MAX_STEP,
					});
				}
			}

			if (projectedStep >= MAX_STEP) {
				break;
			}
		}

		return projections;
	}

	async getRankSalaryInfo(rankId: string): Promise<{
		baseSalary: Decimal;
		ceilingSalary: Decimal;
		stepCount: number;
		stepPeriodYears: number;
		steps: SalaryStepInfo[];
	}> {
		const rank = await this.prisma.militaryRank.findUnique({
			where: { id: rankId },
			include: {
				salarySteps: {
					orderBy: { stepNumber: "asc" },
				},
			},
		});

		if (!rank) {
			throw new NotFoundException(`Rank ${rankId} not found`);
		}

		return {
			baseSalary: rank.baseSalary,
			ceilingSalary: rank.ceilingSalary,
			stepCount: rank.stepCount,
			stepPeriodYears: rank.stepPeriodYears,
			steps: rank.salarySteps.map((step) => ({
				stepNumber: step.stepNumber,
				salaryAmount: step.salaryAmount,
				yearsRequired: step.yearsRequired,
			})),
		};
	}

	async calculatePromotionStep(
		currentRankId: string,
		newRankId: string,
		currentSalary: Decimal,
	): Promise<{
		newStep: number;
		newSalary: Decimal;
		explanation: string;
	}> {
		const { step: newStep, salary: newSalary } = await this.findStepForSalary(newRankId, currentSalary);

		const newRank = await this.prisma.militaryRank.findUnique({
			where: { id: newRankId },
			select: { name: true },
		});

		const explanation = `Step ${newStep} in ${newRank?.name ?? "new rank"} (${newSalary.toString()}) is the first step >= current salary (${currentSalary.toString()})`;

		return {
			newStep,
			newSalary,
			explanation,
		};
	}

	isAtCeilingStep(currentStep: number): boolean {
		return currentStep >= MAX_STEP;
	}

	getMaxStep(): number {
		return MAX_STEP;
	}

	getMinStep(): number {
		return MIN_STEP;
	}

	validateStepNumber(step: number): boolean {
		return step >= MIN_STEP && step <= MAX_STEP;
	}

	calculateSalaryIncrease(fromSalary: Decimal, toSalary: Decimal): {
		increase: Decimal;
		percentageIncrease: Decimal;
	} {
		const increase = toSalary.minus(fromSalary);
		const percentageIncrease = fromSalary.isZero()
			? new Decimal(0)
			: increase.dividedBy(fromSalary).times(100);

		return {
			increase,
			percentageIncrease,
		};
	}
}
