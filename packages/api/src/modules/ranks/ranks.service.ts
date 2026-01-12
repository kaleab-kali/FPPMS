import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { MilitaryRank, MilitaryRankSalaryStep } from "@prisma/client";
import { PrismaService } from "#api/database/prisma.service";
import { CreateRankDto, SalaryStepDto } from "#api/modules/ranks/dto/create-rank.dto";
import { RankResponseDto, SalaryStepResponseDto } from "#api/modules/ranks/dto/rank-response.dto";
import { UpdateRankDto } from "#api/modules/ranks/dto/update-rank.dto";

const DEFAULT_STEP_COUNT = 9;
const DEFAULT_STEP_PERIOD_YEARS = 2;
const DEFAULT_SORT_ORDER = 0;

type RankWithSteps = MilitaryRank & {
	salarySteps: MilitaryRankSalaryStep[];
};

@Injectable()
export class RanksService {
	constructor(private prisma: PrismaService) {}

	async create(tenantId: string, dto: CreateRankDto): Promise<RankResponseDto> {
		const existing = await this.prisma.militaryRank.findFirst({
			where: { tenantId, code: dto.code },
		});

		if (existing) {
			throw new BadRequestException(`Rank with code "${dto.code}" already exists`);
		}

		const stepCount = dto.stepCount ?? DEFAULT_STEP_COUNT;
		const stepPeriodYears = dto.stepPeriodYears ?? DEFAULT_STEP_PERIOD_YEARS;

		const rank = await this.prisma.militaryRank.create({
			data: {
				tenantId,
				code: dto.code,
				name: dto.name,
				nameAm: dto.nameAm,
				level: dto.level,
				category: dto.category,
				baseSalary: dto.baseSalary,
				ceilingSalary: dto.ceilingSalary,
				stepCount,
				stepPeriodYears,
				retirementAge: dto.retirementAge,
				minYearsForPromotion: dto.minYearsForPromotion,
				minAppraisalScore: dto.minAppraisalScore,
				badgePath: dto.badgePath,
				sortOrder: dto.sortOrder ?? DEFAULT_SORT_ORDER,
				isActive: dto.isActive ?? true,
			},
		});

		const salarySteps = dto.salarySteps?.length
			? this.createStepsFromArray(rank.id, dto.salarySteps, stepPeriodYears)
			: this.calculateSteps(rank.id, dto.baseSalary, dto.ceilingSalary, stepCount, stepPeriodYears);

		await this.prisma.militaryRankSalaryStep.createMany({
			data: salarySteps,
		});

		const rankWithSteps = await this.prisma.militaryRank.findUnique({
			where: { id: rank.id },
			include: { salarySteps: { orderBy: { stepNumber: "asc" } } },
		});

		return this.mapToResponse(rankWithSteps as RankWithSteps);
	}

	async findAll(tenantId: string, includeSteps = false): Promise<RankResponseDto[]> {
		const ranks = await this.prisma.militaryRank.findMany({
			where: {
				OR: [{ tenantId }, { tenantId: null }],
			},
			include: includeSteps ? { salarySteps: { orderBy: { stepNumber: "asc" } } } : undefined,
			orderBy: [{ level: "asc" }, { sortOrder: "asc" }],
		});

		return ranks.map((r) => this.mapToResponse(r as RankWithSteps));
	}

	async findByCategory(tenantId: string, category: string, includeSteps = false): Promise<RankResponseDto[]> {
		const ranks = await this.prisma.militaryRank.findMany({
			where: {
				category,
				OR: [{ tenantId }, { tenantId: null }],
			},
			include: includeSteps ? { salarySteps: { orderBy: { stepNumber: "asc" } } } : undefined,
			orderBy: [{ level: "asc" }, { sortOrder: "asc" }],
		});

		return ranks.map((r) => this.mapToResponse(r as RankWithSteps));
	}

	async findOne(tenantId: string, id: string, includeSteps = true): Promise<RankResponseDto> {
		const rank = await this.prisma.militaryRank.findFirst({
			where: {
				id,
				OR: [{ tenantId }, { tenantId: null }],
			},
			include: includeSteps ? { salarySteps: { orderBy: { stepNumber: "asc" } } } : undefined,
		});

		if (!rank) {
			throw new NotFoundException(`Rank with ID "${id}" not found`);
		}

		return this.mapToResponse(rank as RankWithSteps);
	}

	async update(tenantId: string, id: string, dto: UpdateRankDto): Promise<RankResponseDto> {
		const existing = await this.prisma.militaryRank.findFirst({
			where: {
				id,
				OR: [{ tenantId }, { tenantId: null }],
			},
		});

		if (!existing) {
			throw new NotFoundException(`Rank with ID "${id}" not found or not editable`);
		}

		const rank = await this.prisma.militaryRank.update({
			where: { id },
			data: {
				name: dto.name,
				nameAm: dto.nameAm,
				level: dto.level,
				category: dto.category,
				baseSalary: dto.baseSalary,
				ceilingSalary: dto.ceilingSalary,
				stepCount: dto.stepCount,
				stepPeriodYears: dto.stepPeriodYears,
				retirementAge: dto.retirementAge,
				minYearsForPromotion: dto.minYearsForPromotion,
				minAppraisalScore: dto.minAppraisalScore,
				badgePath: dto.badgePath,
				sortOrder: dto.sortOrder,
				isActive: dto.isActive,
			},
		});

		if (dto.salarySteps?.length) {
			await this.prisma.militaryRankSalaryStep.deleteMany({
				where: { rankId: id },
			});

			const salarySteps = this.createStepsFromArray(
				id,
				dto.salarySteps,
				dto.stepPeriodYears ?? existing.stepPeriodYears,
			);

			await this.prisma.militaryRankSalaryStep.createMany({
				data: salarySteps,
			});
		}

		const rankWithSteps = await this.prisma.militaryRank.findUnique({
			where: { id: rank.id },
			include: { salarySteps: { orderBy: { stepNumber: "asc" } } },
		});

		return this.mapToResponse(rankWithSteps as RankWithSteps);
	}

	async updateSalarySteps(tenantId: string, rankId: string, steps: SalaryStepDto[]): Promise<RankResponseDto> {
		const existing = await this.prisma.militaryRank.findFirst({
			where: {
				id: rankId,
				OR: [{ tenantId }, { tenantId: null }],
			},
		});

		if (!existing) {
			throw new NotFoundException(`Rank with ID "${rankId}" not found`);
		}

		await this.prisma.militaryRankSalaryStep.deleteMany({
			where: { rankId },
		});

		const salarySteps = this.createStepsFromArray(rankId, steps, existing.stepPeriodYears);

		await this.prisma.militaryRankSalaryStep.createMany({
			data: salarySteps,
		});

		const rankWithSteps = await this.prisma.militaryRank.findUnique({
			where: { id: rankId },
			include: { salarySteps: { orderBy: { stepNumber: "asc" } } },
		});

		return this.mapToResponse(rankWithSteps as RankWithSteps);
	}

	async remove(tenantId: string, id: string): Promise<{ message: string }> {
		const existing = await this.prisma.militaryRank.findFirst({
			where: { id, tenantId },
		});

		if (!existing) {
			throw new NotFoundException(`Rank with ID "${id}" not found or not deletable`);
		}

		const employeeCount = await this.prisma.employee.count({
			where: { rankId: id },
		});

		if (employeeCount > 0) {
			throw new BadRequestException(
				`Cannot delete rank "${existing.name}" because ${employeeCount} employees are assigned to it`,
			);
		}

		await this.prisma.militaryRankSalaryStep.deleteMany({
			where: { rankId: id },
		});

		await this.prisma.militaryRank.delete({ where: { id } });

		return { message: "Rank deleted successfully" };
	}

	private createStepsFromArray(
		rankId: string,
		steps: SalaryStepDto[],
		stepPeriodYears: number,
	): Array<{ rankId: string; stepNumber: number; salaryAmount: number; yearsRequired: number }> {
		return steps.map((step) => ({
			rankId,
			stepNumber: step.stepNumber,
			salaryAmount: step.salaryAmount,
			yearsRequired: step.stepNumber * stepPeriodYears,
		}));
	}

	private calculateSteps(
		rankId: string,
		baseSalary: number,
		ceilingSalary: number,
		stepCount: number,
		stepPeriodYears: number,
	): Array<{ rankId: string; stepNumber: number; salaryAmount: number; yearsRequired: number }> {
		const steps: Array<{ rankId: string; stepNumber: number; salaryAmount: number; yearsRequired: number }> = [];
		const increment = (ceilingSalary - baseSalary) / stepCount;

		steps.push({
			rankId,
			stepNumber: 0,
			salaryAmount: baseSalary,
			yearsRequired: 0,
		});

		for (let i = 1; i <= stepCount; i++) {
			steps.push({
				rankId,
				stepNumber: i,
				salaryAmount: Math.round(baseSalary + increment * i),
				yearsRequired: i * stepPeriodYears,
			});
		}

		return steps;
	}

	private mapToResponse(rank: RankWithSteps | MilitaryRank): RankResponseDto {
		const salarySteps = "salarySteps" in rank && rank.salarySteps ? this.mapSalarySteps(rank.salarySteps) : undefined;

		return {
			id: rank.id,
			tenantId: rank.tenantId || undefined,
			code: rank.code,
			name: rank.name,
			nameAm: rank.nameAm,
			level: rank.level,
			category: rank.category,
			baseSalary: rank.baseSalary.toString(),
			ceilingSalary: rank.ceilingSalary.toString(),
			stepCount: rank.stepCount,
			stepPeriodYears: rank.stepPeriodYears,
			retirementAge: rank.retirementAge,
			minYearsForPromotion: rank.minYearsForPromotion || undefined,
			minAppraisalScore: rank.minAppraisalScore || undefined,
			badgePath: rank.badgePath || undefined,
			sortOrder: rank.sortOrder,
			isActive: rank.isActive,
			createdAt: rank.createdAt,
			updatedAt: rank.updatedAt,
			salarySteps,
		};
	}

	private mapSalarySteps(steps: MilitaryRankSalaryStep[]): SalaryStepResponseDto[] {
		return steps.map((step) => ({
			id: step.id,
			stepNumber: step.stepNumber,
			salaryAmount: step.salaryAmount.toString(),
			yearsRequired: step.yearsRequired,
		}));
	}
}
