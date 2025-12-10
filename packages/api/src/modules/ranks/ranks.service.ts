import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "#api/database/prisma.service";
import { CreateRankDto } from "#api/modules/ranks/dto/create-rank.dto";
import { RankResponseDto } from "#api/modules/ranks/dto/rank-response.dto";
import { UpdateRankDto } from "#api/modules/ranks/dto/update-rank.dto";

const DEFAULT_STEP_COUNT = 9;
const DEFAULT_STEP_PERIOD_YEARS = 2;
const DEFAULT_SORT_ORDER = 0;

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
				stepCount: dto.stepCount ?? DEFAULT_STEP_COUNT,
				stepPeriodYears: dto.stepPeriodYears ?? DEFAULT_STEP_PERIOD_YEARS,
				retirementAge: dto.retirementAge,
				minYearsForPromotion: dto.minYearsForPromotion,
				minAppraisalScore: dto.minAppraisalScore,
				badgePath: dto.badgePath,
				sortOrder: dto.sortOrder ?? DEFAULT_SORT_ORDER,
				isActive: dto.isActive ?? true,
			},
		});

		return this.mapToResponse(rank);
	}

	async findAll(tenantId: string): Promise<RankResponseDto[]> {
		const ranks = await this.prisma.militaryRank.findMany({
			where: {
				OR: [{ tenantId }, { tenantId: null }],
			},
			orderBy: [{ level: "asc" }, { sortOrder: "asc" }],
		});

		return ranks.map((r) => this.mapToResponse(r));
	}

	async findByCategory(tenantId: string, category: string): Promise<RankResponseDto[]> {
		const ranks = await this.prisma.militaryRank.findMany({
			where: {
				category,
				OR: [{ tenantId }, { tenantId: null }],
			},
			orderBy: [{ level: "asc" }, { sortOrder: "asc" }],
		});

		return ranks.map((r) => this.mapToResponse(r));
	}

	async findOne(tenantId: string, id: string): Promise<RankResponseDto> {
		const rank = await this.prisma.militaryRank.findFirst({
			where: {
				id,
				OR: [{ tenantId }, { tenantId: null }],
			},
		});

		if (!rank) {
			throw new NotFoundException(`Rank with ID "${id}" not found`);
		}

		return this.mapToResponse(rank);
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

		return this.mapToResponse(rank);
	}

	async remove(tenantId: string, id: string): Promise<{ message: string }> {
		const existing = await this.prisma.militaryRank.findFirst({
			where: { id, tenantId },
		});

		if (!existing) {
			throw new NotFoundException(`Rank with ID "${id}" not found or not deletable`);
		}

		await this.prisma.militaryRank.delete({ where: { id } });

		return { message: "Rank deleted successfully" };
	}

	private mapToResponse(rank: {
		id: string;
		tenantId: string | null;
		code: string;
		name: string;
		nameAm: string;
		level: number;
		category: string;
		baseSalary: { toString: () => string };
		ceilingSalary: { toString: () => string };
		stepCount: number;
		stepPeriodYears: number;
		retirementAge: number;
		minYearsForPromotion: number | null;
		minAppraisalScore: number | null;
		badgePath: string | null;
		sortOrder: number;
		isActive: boolean;
		createdAt: Date;
		updatedAt: Date;
	}): RankResponseDto {
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
		};
	}
}
