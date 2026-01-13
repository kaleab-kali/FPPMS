import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { SalaryScaleRank, SalaryScaleStatus, SalaryScaleStep, SalaryScaleVersion } from "@prisma/client";
import { PrismaService } from "#api/database/prisma.service";
import { CreateSalaryScaleDto, SalaryScaleRankInputDto } from "#api/modules/salary-scale/dto/create-salary-scale.dto";
import {
	SalaryScaleListResponseDto,
	SalaryScaleRankResponseDto,
	SalaryScaleStepResponseDto,
	SalaryScaleVersionResponseDto,
} from "#api/modules/salary-scale/dto/salary-scale-response.dto";
import { UpdateSalaryScaleDto } from "#api/modules/salary-scale/dto/update-salary-scale.dto";

const DEFAULT_STEP_COUNT = 9;
const DEFAULT_STEP_PERIOD_YEARS = 2;

type ScaleVersionWithRanks = SalaryScaleVersion & {
	rankSalaries: Array<SalaryScaleRank & { salarySteps: SalaryScaleStep[] }>;
};

@Injectable()
export class SalaryScaleService {
	constructor(private prisma: PrismaService) {}

	async create(tenantId: string, dto: CreateSalaryScaleDto, userId?: string): Promise<SalaryScaleVersionResponseDto> {
		const existing = await this.prisma.salaryScaleVersion.findFirst({
			where: {
				code: dto.code,
				OR: [{ tenantId }, { tenantId: null }],
			},
		});

		if (existing) {
			throw new BadRequestException(`Salary scale with code "${dto.code}" already exists`);
		}

		const stepCount = dto.stepCount ?? DEFAULT_STEP_COUNT;
		const stepPeriodYears = dto.stepPeriodYears ?? DEFAULT_STEP_PERIOD_YEARS;

		const scaleVersion = await this.prisma.salaryScaleVersion.create({
			data: {
				tenantId,
				code: dto.code,
				name: dto.name,
				nameAm: dto.nameAm,
				description: dto.description,
				effectiveDate: new Date(dto.effectiveDate),
				expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
				status: SalaryScaleStatus.DRAFT,
				stepCount,
				stepPeriodYears,
				createdBy: userId,
			},
		});

		for (const rankDto of dto.ranks) {
			await this.createRankWithSteps(scaleVersion.id, rankDto, stepPeriodYears);
		}

		return this.findOne(tenantId, scaleVersion.id);
	}

	async findAll(tenantId: string, status?: SalaryScaleStatus): Promise<SalaryScaleListResponseDto[]> {
		const whereClause: { OR: Array<{ tenantId: string | null }>; status?: SalaryScaleStatus } = {
			OR: [{ tenantId }, { tenantId: null }],
		};

		if (status) {
			whereClause.status = status;
		}

		const scales = await this.prisma.salaryScaleVersion.findMany({
			where: whereClause,
			include: {
				_count: {
					select: { rankSalaries: true },
				},
			},
			orderBy: [{ effectiveDate: "desc" }, { createdAt: "desc" }],
		});

		return scales.map((scale) => ({
			id: scale.id,
			code: scale.code,
			name: scale.name,
			nameAm: scale.nameAm || undefined,
			effectiveDate: scale.effectiveDate,
			expiryDate: scale.expiryDate || undefined,
			status: scale.status,
			rankCount: scale._count.rankSalaries,
			createdAt: scale.createdAt,
		}));
	}

	async findOne(tenantId: string, id: string): Promise<SalaryScaleVersionResponseDto> {
		const scale = await this.prisma.salaryScaleVersion.findFirst({
			where: {
				id,
				OR: [{ tenantId }, { tenantId: null }],
			},
			include: {
				rankSalaries: {
					include: {
						salarySteps: {
							orderBy: { stepNumber: "asc" },
						},
					},
					orderBy: [{ level: "asc" }, { sortOrder: "asc" }],
				},
			},
		});

		if (!scale) {
			throw new NotFoundException(`Salary scale with ID "${id}" not found`);
		}

		return this.mapToResponse(scale);
	}

	async findActiveScale(tenantId: string): Promise<SalaryScaleVersionResponseDto | null> {
		const scale = await this.prisma.salaryScaleVersion.findFirst({
			where: {
				status: SalaryScaleStatus.ACTIVE,
				OR: [{ tenantId }, { tenantId: null }],
			},
			include: {
				rankSalaries: {
					include: {
						salarySteps: {
							orderBy: { stepNumber: "asc" },
						},
					},
					orderBy: [{ level: "asc" }, { sortOrder: "asc" }],
				},
			},
		});

		if (!scale) {
			return null;
		}

		return this.mapToResponse(scale);
	}

	async update(tenantId: string, id: string, dto: UpdateSalaryScaleDto): Promise<SalaryScaleVersionResponseDto> {
		const existing = await this.prisma.salaryScaleVersion.findFirst({
			where: {
				id,
				OR: [{ tenantId }, { tenantId: null }],
			},
		});

		if (!existing) {
			throw new NotFoundException(`Salary scale with ID "${id}" not found`);
		}

		if (existing.status === SalaryScaleStatus.ARCHIVED) {
			throw new BadRequestException("Cannot update an archived salary scale");
		}

		const updatedScale = await this.prisma.salaryScaleVersion.update({
			where: { id },
			data: {
				name: dto.name,
				nameAm: dto.nameAm,
				description: dto.description,
				effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : undefined,
				expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
				status: dto.status,
				stepCount: dto.stepCount,
				stepPeriodYears: dto.stepPeriodYears,
			},
		});

		if (dto.ranks?.length) {
			await this.prisma.salaryScaleRank.deleteMany({
				where: { scaleVersionId: id },
			});

			const stepPeriodYears = dto.stepPeriodYears ?? existing.stepPeriodYears;
			for (const rankDto of dto.ranks) {
				await this.createRankWithSteps(id, rankDto, stepPeriodYears);
			}
		}

		return this.findOne(tenantId, updatedScale.id);
	}

	async activate(tenantId: string, id: string, userId: string): Promise<SalaryScaleVersionResponseDto> {
		const scale = await this.prisma.salaryScaleVersion.findFirst({
			where: {
				id,
				OR: [{ tenantId }, { tenantId: null }],
			},
		});

		if (!scale) {
			throw new NotFoundException(`Salary scale with ID "${id}" not found`);
		}

		if (scale.status === SalaryScaleStatus.ARCHIVED) {
			throw new BadRequestException("Cannot activate an archived salary scale");
		}

		await this.prisma.$transaction(async (tx) => {
			await tx.salaryScaleVersion.updateMany({
				where: {
					status: SalaryScaleStatus.ACTIVE,
					OR: [{ tenantId }, { tenantId: null }],
					id: { not: id },
				},
				data: { status: SalaryScaleStatus.ARCHIVED },
			});

			await tx.salaryScaleVersion.update({
				where: { id },
				data: {
					status: SalaryScaleStatus.ACTIVE,
					approvedBy: userId,
					approvedAt: new Date(),
				},
			});
		});

		return this.findOne(tenantId, id);
	}

	async archive(tenantId: string, id: string): Promise<SalaryScaleVersionResponseDto> {
		const scale = await this.prisma.salaryScaleVersion.findFirst({
			where: {
				id,
				OR: [{ tenantId }, { tenantId: null }],
			},
		});

		if (!scale) {
			throw new NotFoundException(`Salary scale with ID "${id}" not found`);
		}

		await this.prisma.salaryScaleVersion.update({
			where: { id },
			data: { status: SalaryScaleStatus.ARCHIVED },
		});

		return this.findOne(tenantId, id);
	}

	async remove(tenantId: string, id: string): Promise<{ message: string }> {
		const scale = await this.prisma.salaryScaleVersion.findFirst({
			where: {
				id,
				tenantId,
			},
		});

		if (!scale) {
			throw new NotFoundException(`Salary scale with ID "${id}" not found or cannot be deleted`);
		}

		if (scale.status === SalaryScaleStatus.ACTIVE) {
			throw new BadRequestException("Cannot delete an active salary scale. Archive it first.");
		}

		await this.prisma.salaryScaleVersion.delete({
			where: { id },
		});

		return { message: "Salary scale deleted successfully" };
	}

	async duplicate(
		tenantId: string,
		id: string,
		newCode: string,
		userId?: string,
	): Promise<SalaryScaleVersionResponseDto> {
		const original = await this.prisma.salaryScaleVersion.findFirst({
			where: {
				id,
				OR: [{ tenantId }, { tenantId: null }],
			},
			include: {
				rankSalaries: {
					include: {
						salarySteps: {
							orderBy: { stepNumber: "asc" },
						},
					},
				},
			},
		});

		if (!original) {
			throw new NotFoundException(`Salary scale with ID "${id}" not found`);
		}

		const existing = await this.prisma.salaryScaleVersion.findFirst({
			where: {
				code: newCode,
				OR: [{ tenantId }, { tenantId: null }],
			},
		});

		if (existing) {
			throw new BadRequestException(`Salary scale with code "${newCode}" already exists`);
		}

		const newScale = await this.prisma.salaryScaleVersion.create({
			data: {
				tenantId,
				code: newCode,
				name: `${original.name} (Copy)`,
				nameAm: original.nameAm ? `${original.nameAm} (\u1245\u12F3)` : null,
				description: original.description,
				effectiveDate: original.effectiveDate,
				expiryDate: original.expiryDate,
				status: SalaryScaleStatus.DRAFT,
				stepCount: original.stepCount,
				stepPeriodYears: original.stepPeriodYears,
				createdBy: userId,
			},
		});

		for (const rank of original.rankSalaries) {
			const newRank = await this.prisma.salaryScaleRank.create({
				data: {
					scaleVersionId: newScale.id,
					rankCode: rank.rankCode,
					rankName: rank.rankName,
					rankNameAm: rank.rankNameAm,
					category: rank.category,
					level: rank.level,
					baseSalary: rank.baseSalary,
					ceilingSalary: rank.ceilingSalary,
					sortOrder: rank.sortOrder,
				},
			});

			await this.prisma.salaryScaleStep.createMany({
				data: rank.salarySteps.map((step) => ({
					scaleRankId: newRank.id,
					stepNumber: step.stepNumber,
					salaryAmount: step.salaryAmount,
					yearsRequired: step.yearsRequired,
				})),
			});
		}

		return this.findOne(tenantId, newScale.id);
	}

	async getRankSalary(tenantId: string, scaleId: string, rankCode: string): Promise<SalaryScaleRankResponseDto | null> {
		const rank = await this.prisma.salaryScaleRank.findFirst({
			where: {
				scaleVersionId: scaleId,
				rankCode,
				scaleVersion: {
					OR: [{ tenantId }, { tenantId: null }],
				},
			},
			include: {
				salarySteps: {
					orderBy: { stepNumber: "asc" },
				},
			},
		});

		if (!rank) {
			return null;
		}

		return this.mapRankToResponse(rank);
	}

	private async createRankWithSteps(
		scaleVersionId: string,
		dto: SalaryScaleRankInputDto,
		stepPeriodYears: number,
	): Promise<void> {
		const rank = await this.prisma.salaryScaleRank.create({
			data: {
				scaleVersionId,
				rankCode: dto.rankCode,
				rankName: dto.rankName,
				rankNameAm: dto.rankNameAm,
				category: dto.category,
				level: dto.level,
				baseSalary: dto.baseSalary,
				ceilingSalary: dto.ceilingSalary,
				sortOrder: dto.sortOrder ?? 0,
			},
		});

		await this.prisma.salaryScaleStep.createMany({
			data: dto.salarySteps.map((step) => ({
				scaleRankId: rank.id,
				stepNumber: step.stepNumber,
				salaryAmount: step.salaryAmount,
				yearsRequired: step.stepNumber * stepPeriodYears,
			})),
		});
	}

	private mapToResponse(scale: ScaleVersionWithRanks): SalaryScaleVersionResponseDto {
		return {
			id: scale.id,
			tenantId: scale.tenantId || undefined,
			code: scale.code,
			name: scale.name,
			nameAm: scale.nameAm || undefined,
			description: scale.description || undefined,
			effectiveDate: scale.effectiveDate,
			expiryDate: scale.expiryDate || undefined,
			status: scale.status,
			stepCount: scale.stepCount,
			stepPeriodYears: scale.stepPeriodYears,
			approvedBy: scale.approvedBy || undefined,
			approvedAt: scale.approvedAt || undefined,
			createdBy: scale.createdBy || undefined,
			createdAt: scale.createdAt,
			updatedAt: scale.updatedAt,
			rankSalaries: scale.rankSalaries.map((r) => this.mapRankToResponse(r)),
		};
	}

	private mapRankToResponse(rank: SalaryScaleRank & { salarySteps: SalaryScaleStep[] }): SalaryScaleRankResponseDto {
		return {
			id: rank.id,
			rankCode: rank.rankCode,
			rankName: rank.rankName,
			rankNameAm: rank.rankNameAm || undefined,
			category: rank.category,
			level: rank.level,
			baseSalary: rank.baseSalary.toString(),
			ceilingSalary: rank.ceilingSalary.toString(),
			sortOrder: rank.sortOrder,
			salarySteps: rank.salarySteps.map((s) => this.mapStepToResponse(s)),
		};
	}

	private mapStepToResponse(step: SalaryScaleStep): SalaryScaleStepResponseDto {
		return {
			id: step.id,
			stepNumber: step.stepNumber,
			salaryAmount: step.salaryAmount.toString(),
			yearsRequired: step.yearsRequired,
		};
	}
}
