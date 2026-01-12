import { Injectable, NotFoundException } from "@nestjs/common";
import { EmployeeType, Prisma, SalaryEligibilityStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/client";
import { PrismaService } from "#api/database/prisma.service";
import { calculateSkip, paginate } from "#api/common/utils/pagination.util";
import { SalaryCalculationService } from "#api/modules/salary-management/services/salary-calculation.service";
import { SalaryHistoryService } from "#api/modules/salary-management/services/salary-history.service";
import { SalaryProgressionService } from "#api/modules/salary-management/services/salary-progression.service";
import { SalaryEligibilityQueryDto } from "#api/modules/salary-management/dto/salary-eligibility-query.dto";
import { MassRaiseType } from "#api/modules/salary-management/dto/mass-raise.dto";

const ELIGIBILITY_INCLUDE = {
	employee: {
		select: {
			id: true,
			employeeId: true,
			fullName: true,
			fullNameAm: true,
			employmentDate: true,
			center: {
				select: {
					id: true,
					code: true,
					name: true,
					nameAm: true,
				},
			},
			department: {
				select: {
					id: true,
					code: true,
					name: true,
					nameAm: true,
				},
			},
		},
	},
	rank: {
		select: {
			id: true,
			code: true,
			name: true,
			nameAm: true,
			category: true,
		},
	},
} as const;

@Injectable()
export class SalaryManagementService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly salaryCalculation: SalaryCalculationService,
		private readonly salaryHistory: SalaryHistoryService,
		private readonly salaryProgression: SalaryProgressionService,
	) {}

	async getEligibilityList(tenantId: string, query: SalaryEligibilityQueryDto): Promise<{
		data: Array<{
			id: string;
			tenantId: string;
			employeeId: string;
			rankId: string;
			currentStep: number;
			nextStepNumber: number;
			currentSalary: string;
			nextSalary: string;
			salaryIncrease: string;
			eligibilityDate: Date;
			status: SalaryEligibilityStatus;
			processedAt: Date | null;
			processedBy: string | null;
			rejectionReason: string | null;
			salaryHistoryId: string | null;
			notifiedAt: Date | null;
			createdAt: Date;
			updatedAt: Date;
			employee?: unknown;
			rank?: unknown;
		}>;
		meta: {
			total: number;
			page: number;
			limit: number;
			totalPages: number;
			hasNextPage: boolean;
			hasPreviousPage: boolean;
		};
	}> {
		const page = query.page ?? 1;
		const limit = query.limit ?? 20;

		const where: Prisma.SalaryStepEligibilityWhereInput = {
			tenantId,
		};

		if (query.status) {
			where.status = query.status;
		}

		if (query.rankId) {
			where.rankId = query.rankId;
		}

		if (query.currentStep !== undefined) {
			where.currentStep = query.currentStep;
		}

		if (query.eligibilityDateFrom || query.eligibilityDateTo) {
			where.eligibilityDate = {};
			if (query.eligibilityDateFrom) {
				where.eligibilityDate.gte = new Date(query.eligibilityDateFrom);
			}
			if (query.eligibilityDateTo) {
				where.eligibilityDate.lte = new Date(query.eligibilityDateTo);
			}
		}

		if (query.centerId || query.departmentId || query.search) {
			where.employee = {};
			if (query.centerId) {
				where.employee.centerId = query.centerId;
			}
			if (query.departmentId) {
				where.employee.departmentId = query.departmentId;
			}
			if (query.search) {
				where.employee.OR = [
					{ employeeId: { contains: query.search, mode: "insensitive" } },
					{ fullName: { contains: query.search, mode: "insensitive" } },
				];
			}
		}

		const orderBy: Prisma.SalaryStepEligibilityOrderByWithRelationInput = {};
		const sortBy = query.sortBy ?? "eligibilityDate";
		const sortOrder = query.sortOrder ?? "asc";
		orderBy[sortBy as keyof Prisma.SalaryStepEligibilityOrderByWithRelationInput] = sortOrder;

		const [data, total] = await Promise.all([
			this.prisma.salaryStepEligibility.findMany({
				where,
				include: ELIGIBILITY_INCLUDE,
				orderBy,
				skip: calculateSkip(page, limit),
				take: limit,
			}),
			this.prisma.salaryStepEligibility.count({ where }),
		]);

		const formattedData = data.map((item) => ({
			...item,
			currentSalary: item.currentSalary.toString(),
			nextSalary: item.nextSalary.toString(),
			salaryIncrease: item.nextSalary.minus(item.currentSalary).toString(),
		}));

		return paginate(formattedData, total, page, limit);
	}

	async getTodayEligibility(tenantId: string): Promise<{
		data: Array<{
			id: string;
			tenantId: string;
			employeeId: string;
			rankId: string;
			currentStep: number;
			nextStepNumber: number;
			currentSalary: string;
			nextSalary: string;
			salaryIncrease: string;
			eligibilityDate: Date;
			status: SalaryEligibilityStatus;
			employee?: unknown;
			rank?: unknown;
		}>;
		count: number;
		date: string;
	}> {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		const data = await this.prisma.salaryStepEligibility.findMany({
			where: {
				tenantId,
				status: SalaryEligibilityStatus.PENDING,
				eligibilityDate: {
					gte: today,
					lt: tomorrow,
				},
			},
			include: ELIGIBILITY_INCLUDE,
			orderBy: { eligibilityDate: "asc" },
		});

		const formattedData = data.map((item) => ({
			...item,
			currentSalary: item.currentSalary.toString(),
			nextSalary: item.nextSalary.toString(),
			salaryIncrease: item.nextSalary.minus(item.currentSalary).toString(),
		}));

		return {
			data: formattedData,
			count: data.length,
			date: today.toISOString().split("T")[0],
		};
	}

	async getEligibilitySummary(tenantId: string): Promise<{
		pending: number;
		approvedThisMonth: number;
		rejectedThisMonth: number;
		upcomingNext30Days: number;
		byRank: Array<{ rankId: string; rankName: string; count: number }>;
	}> {
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const next30Days = new Date(now);
		next30Days.setDate(next30Days.getDate() + 30);

		const [pending, approvedThisMonth, rejectedThisMonth, upcomingNext30Days, byRankData] = await Promise.all([
			this.prisma.salaryStepEligibility.count({
				where: { tenantId, status: SalaryEligibilityStatus.PENDING },
			}),
			this.prisma.salaryStepEligibility.count({
				where: {
					tenantId,
					status: SalaryEligibilityStatus.APPROVED,
					processedAt: { gte: startOfMonth },
				},
			}),
			this.prisma.salaryStepEligibility.count({
				where: {
					tenantId,
					status: SalaryEligibilityStatus.REJECTED,
					processedAt: { gte: startOfMonth },
				},
			}),
			this.prisma.salaryStepEligibility.count({
				where: {
					tenantId,
					status: SalaryEligibilityStatus.PENDING,
					eligibilityDate: { gte: now, lte: next30Days },
				},
			}),
			this.prisma.salaryStepEligibility.groupBy({
				by: ["rankId"],
				where: { tenantId, status: SalaryEligibilityStatus.PENDING },
				_count: { rankId: true },
			}),
		]);

		const rankIds = byRankData.map((r) => r.rankId);
		const ranks = await this.prisma.militaryRank.findMany({
			where: { id: { in: rankIds } },
			select: { id: true, name: true },
		});

		const rankMap = new Map(ranks.map((r) => [r.id, r.name]));

		const byRank = byRankData.map((r) => ({
			rankId: r.rankId,
			rankName: rankMap.get(r.rankId) ?? "Unknown",
			count: r._count.rankId,
		}));

		return {
			pending,
			approvedThisMonth,
			rejectedThisMonth,
			upcomingNext30Days,
			byRank,
		};
	}

	async processIncrement(
		tenantId: string,
		eligibilityId: string,
		processedBy: string,
		effectiveDate?: string,
		notes?: string,
	): Promise<{
		success: boolean;
		employeeId: string;
		employeeName: string;
		fromStep: number;
		toStep: number;
		fromSalary: string;
		toSalary: string;
		historyId?: string;
	}> {
		const result = await this.salaryProgression.processStepIncrement(
			tenantId,
			eligibilityId,
			processedBy,
			effectiveDate ? new Date(effectiveDate) : undefined,
			notes,
		);

		return {
			...result,
			fromSalary: result.fromSalary.toString(),
			toSalary: result.toSalary.toString(),
		};
	}

	async processBatchIncrement(
		tenantId: string,
		eligibilityIds: string[],
		processedBy: string,
		effectiveDate?: string,
		notes?: string,
	): Promise<{
		processed: number;
		failed: number;
		results: Array<{
			success: boolean;
			employeeId: string;
			employeeName: string;
			fromStep: number;
			toStep: number;
			fromSalary: string;
			toSalary: string;
			historyId?: string;
			error?: string;
		}>;
	}> {
		const result = await this.salaryProgression.processBatchIncrements(
			tenantId,
			eligibilityIds,
			processedBy,
			effectiveDate ? new Date(effectiveDate) : undefined,
			notes,
		);

		return {
			...result,
			results: result.results.map((r) => ({
				...r,
				fromSalary: r.fromSalary.toString(),
				toSalary: r.toSalary.toString(),
			})),
		};
	}

	async processManualJump(
		tenantId: string,
		employeeId: string,
		toStep: number,
		orderReference: string,
		reason: string,
		effectiveDate: string,
		processedBy: string,
		documentPath?: string,
		notes?: string,
	): Promise<{
		success: boolean;
		employeeId: string;
		employeeName: string;
		fromStep: number;
		toStep: number;
		fromSalary: string;
		toSalary: string;
		historyId?: string;
	}> {
		const result = await this.salaryProgression.processManualJump(
			tenantId,
			employeeId,
			toStep,
			orderReference,
			reason,
			new Date(effectiveDate),
			processedBy,
			documentPath,
			notes,
		);

		return {
			...result,
			fromSalary: result.fromSalary.toString(),
			toSalary: result.toSalary.toString(),
		};
	}

	async processMassRaise(
		tenantId: string,
		rankId: string,
		raiseType: MassRaiseType,
		options: {
			incrementSteps?: number;
			targetStep?: number;
			centerId?: string;
		},
		orderReference: string,
		reason: string,
		effectiveDate: string,
		processedBy: string,
		documentPath?: string,
		notes?: string,
	): Promise<{
		totalProcessed: number;
		successCount: number;
		failureCount: number;
		skippedCount: number;
		results: Array<{
			success: boolean;
			employeeId: string;
			employeeName: string;
			fromStep: number;
			toStep: number;
			fromSalary: string;
			toSalary: string;
			historyId?: string;
			error?: string;
		}>;
	}> {
		const result = await this.salaryProgression.processMassRaise(
			tenantId,
			rankId,
			raiseType,
			options,
			orderReference,
			reason,
			new Date(effectiveDate),
			processedBy,
			documentPath,
			notes,
		);

		return {
			...result,
			results: result.results.map((r) => ({
				...r,
				fromSalary: r.fromSalary.toString(),
				toSalary: r.toSalary.toString(),
			})),
		};
	}

	async getMassRaisePreview(
		tenantId: string,
		rankId: string,
		raiseType: MassRaiseType,
		options: {
			incrementSteps?: number;
			targetStep?: number;
			centerId?: string;
		},
	): Promise<{
		totalEmployees: number;
		affectedEmployees: number;
		skippedEmployees: number;
		totalSalaryIncrease: string;
		preview: Array<{
			employeeId: string;
			employeeName: string;
			currentStep: number;
			newStep: number;
			currentSalary: string;
			newSalary: string;
			willBeSkipped: boolean;
			skipReason?: string;
		}>;
	}> {
		const result = await this.salaryProgression.getMassRaisePreview(tenantId, rankId, raiseType, options);

		return {
			...result,
			totalSalaryIncrease: result.totalSalaryIncrease.toString(),
			preview: result.preview.map((p) => ({
				...p,
				currentSalary: p.currentSalary.toString(),
				newSalary: p.newSalary.toString(),
			})),
		};
	}

	async rejectEligibility(
		tenantId: string,
		eligibilityId: string,
		rejectionReason: string,
		processedBy: string,
	): Promise<{ message: string }> {
		await this.salaryProgression.rejectEligibility(tenantId, eligibilityId, rejectionReason, processedBy);
		return { message: "Eligibility rejected successfully" };
	}

	async getEmployeeSalaryHistory(
		tenantId: string,
		employeeId: string,
		filter?: {
			changeType?: string;
			dateFrom?: string;
			dateTo?: string;
			page?: number;
			limit?: number;
		},
	): Promise<{
		data: unknown[];
		meta: {
			total: number;
			page: number;
			limit: number;
			totalPages: number;
			hasNextPage: boolean;
			hasPreviousPage: boolean;
		};
	}> {
		const employee = await this.prisma.employee.findFirst({
			where: { id: employeeId, tenantId },
		});

		if (!employee) {
			throw new NotFoundException("Employee not found");
		}

		return this.salaryHistory.getEmployeeSalaryHistory(tenantId, employeeId, {
			changeType: filter?.changeType as never,
			dateFrom: filter?.dateFrom ? new Date(filter.dateFrom) : undefined,
			dateTo: filter?.dateTo ? new Date(filter.dateTo) : undefined,
			page: filter?.page,
			limit: filter?.limit,
		});
	}

	async getEmployeeSalaryProjection(tenantId: string, employeeId: string): Promise<{
		employeeId: string;
		employeeCode: string;
		employeeName: string;
		currentRank: {
			id: string;
			code: string;
			name: string;
			nameAm: string | null;
		};
		currentStep: number;
		currentSalary: string;
		employmentDate: Date;
		maxStep: number;
		ceilingSalary: string;
		yearsToReachCeiling: number;
		projections: Array<{
			year: number;
			step: number;
			salary: string;
			effectiveDate: string;
			changeType: string;
			isCeiling: boolean;
		}>;
		projectedCeilingDate: string | null;
		nextEligibilityDate: string | null;
		daysUntilNextEligibility: number | null;
	}> {
		const employee = await this.prisma.employee.findFirst({
			where: {
				id: employeeId,
				tenantId,
				employeeType: EmployeeType.MILITARY,
				deletedAt: null,
			},
			include: {
				rank: {
					include: {
						salarySteps: {
							orderBy: { stepNumber: "asc" },
						},
					},
				},
			},
		});

		if (!employee) {
			throw new NotFoundException("Military employee not found");
		}

		if (!employee.rank || !employee.rankId) {
			throw new NotFoundException("Employee does not have an assigned rank");
		}

		const projections = await this.salaryCalculation.calculateSalaryProjection(
			employee.rankId,
			employee.currentSalaryStep,
			employee.employmentDate,
		);

		const { nextStep, eligibilityDate, isAtCeiling } = await this.salaryCalculation.calculateNextEligibilityDate(
			employee.employmentDate,
			employee.currentSalaryStep,
			employee.rank.stepPeriodYears,
		);

		const maxStep = this.salaryCalculation.getMaxStep();
		const yearsToReachCeiling = isAtCeiling ? 0 : (maxStep - employee.currentSalaryStep) * employee.rank.stepPeriodYears;

		const ceilingProjection = projections.find((p) => p.isCeiling);
		const projectedCeilingDate = ceilingProjection
			? ceilingProjection.effectiveDate.toISOString().split("T")[0]
			: null;

		const now = new Date();
		const daysUntilNextEligibility = isAtCeiling
			? null
			: Math.ceil((eligibilityDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

		return {
			employeeId: employee.id,
			employeeCode: employee.employeeId,
			employeeName: employee.fullName,
			currentRank: {
				id: employee.rank.id,
				code: employee.rank.code,
				name: employee.rank.name,
				nameAm: employee.rank.nameAm,
			},
			currentStep: employee.currentSalaryStep,
			currentSalary: (employee.currentSalary ?? employee.rank.baseSalary).toString(),
			employmentDate: employee.employmentDate,
			maxStep,
			ceilingSalary: employee.rank.ceilingSalary.toString(),
			yearsToReachCeiling,
			projections: projections.map((p) => ({
				year: p.year,
				step: p.step,
				salary: p.salary.toString(),
				effectiveDate: p.effectiveDate.toISOString().split("T")[0],
				changeType: "STEP_INCREMENT",
				isCeiling: p.isCeiling,
			})),
			projectedCeilingDate,
			nextEligibilityDate: isAtCeiling ? null : eligibilityDate.toISOString().split("T")[0],
			daysUntilNextEligibility,
		};
	}

	async getStepDistributionReport(tenantId: string, centerId?: string): Promise<{
		tenantId: string;
		generatedAt: Date;
		totalMilitaryEmployees: number;
		byRank: Array<{
			rankId: string;
			rankCode: string;
			rankName: string;
			rankNameAm: string | null;
			totalEmployees: number;
			baseSalary: string;
			ceilingSalary: string;
			distribution: Array<{
				step: number;
				count: number;
				salaryAmount: string;
				percentage: string;
			}>;
		}>;
		overallDistribution: Array<{
			step: number;
			count: number;
			salaryAmount: string;
			percentage: string;
		}>;
		averageStep: string;
		employeesAtCeiling: number;
		ceilingPercentage: string;
	}> {
		const whereClause: Prisma.EmployeeWhereInput = {
			tenantId,
			employeeType: EmployeeType.MILITARY,
			status: "ACTIVE",
			rankId: { not: null },
			deletedAt: null,
		};

		if (centerId) {
			whereClause.centerId = centerId;
		}

		const employees = await this.prisma.employee.findMany({
			where: whereClause,
			select: {
				rankId: true,
				currentSalaryStep: true,
				currentSalary: true,
			},
		});

		const ranks = await this.prisma.militaryRank.findMany({
			where: { OR: [{ tenantId }, { tenantId: null }] },
			include: {
				salarySteps: {
					orderBy: { stepNumber: "asc" },
				},
			},
			orderBy: { level: "asc" },
		});

		const rankMap = new Map(ranks.map((r) => [r.id, r]));
		const totalMilitaryEmployees = employees.length;

		const overallStepCounts: Record<number, number> = {};
		const rankData: Record<
			string,
			{
				stepCounts: Record<number, number>;
				total: number;
			}
		> = {};

		for (const emp of employees) {
			if (!emp.rankId) continue;

			if (!rankData[emp.rankId]) {
				rankData[emp.rankId] = { stepCounts: {}, total: 0 };
			}

			rankData[emp.rankId].stepCounts[emp.currentSalaryStep] =
				(rankData[emp.rankId].stepCounts[emp.currentSalaryStep] ?? 0) + 1;
			rankData[emp.rankId].total++;

			overallStepCounts[emp.currentSalaryStep] = (overallStepCounts[emp.currentSalaryStep] ?? 0) + 1;
		}

		const byRank = [];
		for (const rank of ranks) {
			const data = rankData[rank.id];
			if (!data || data.total === 0) continue;

			const distribution = [];
			for (let step = 0; step <= 9; step++) {
				const count = data.stepCounts[step] ?? 0;
				const stepInfo = rank.salarySteps.find((s) => s.stepNumber === step);
				distribution.push({
					step,
					count,
					salaryAmount: stepInfo?.salaryAmount.toString() ?? "0",
					percentage: data.total > 0 ? ((count / data.total) * 100).toFixed(2) : "0.00",
				});
			}

			byRank.push({
				rankId: rank.id,
				rankCode: rank.code,
				rankName: rank.name,
				rankNameAm: rank.nameAm,
				totalEmployees: data.total,
				baseSalary: rank.baseSalary.toString(),
				ceilingSalary: rank.ceilingSalary.toString(),
				distribution,
			});
		}

		const overallDistribution = [];
		for (let step = 0; step <= 9; step++) {
			const count = overallStepCounts[step] ?? 0;
			overallDistribution.push({
				step,
				count,
				salaryAmount: "N/A",
				percentage: totalMilitaryEmployees > 0 ? ((count / totalMilitaryEmployees) * 100).toFixed(2) : "0.00",
			});
		}

		const totalSteps = employees.reduce((sum, emp) => sum + emp.currentSalaryStep, 0);
		const averageStep = totalMilitaryEmployees > 0 ? (totalSteps / totalMilitaryEmployees).toFixed(2) : "0.00";

		const employeesAtCeiling = overallStepCounts[9] ?? 0;
		const ceilingPercentage =
			totalMilitaryEmployees > 0 ? ((employeesAtCeiling / totalMilitaryEmployees) * 100).toFixed(2) : "0.00";

		return {
			tenantId,
			generatedAt: new Date(),
			totalMilitaryEmployees,
			byRank,
			overallDistribution,
			averageStep,
			employeesAtCeiling,
			ceilingPercentage,
		};
	}

	async getRankSalarySteps(tenantId: string, rankId: string): Promise<{
		rankId: string;
		rankCode: string;
		rankName: string;
		rankNameAm: string | null;
		category: string;
		baseSalary: string;
		ceilingSalary: string;
		stepCount: number;
		stepPeriodYears: number;
		steps: Array<{
			stepNumber: number;
			salaryAmount: string;
			yearsRequired: number;
		}>;
	}> {
		const rank = await this.prisma.militaryRank.findFirst({
			where: {
				id: rankId,
				OR: [{ tenantId }, { tenantId: null }],
			},
			include: {
				salarySteps: {
					orderBy: { stepNumber: "asc" },
				},
			},
		});

		if (!rank) {
			throw new NotFoundException("Rank not found");
		}

		return {
			rankId: rank.id,
			rankCode: rank.code,
			rankName: rank.name,
			rankNameAm: rank.nameAm,
			category: rank.category,
			baseSalary: rank.baseSalary.toString(),
			ceilingSalary: rank.ceilingSalary.toString(),
			stepCount: rank.stepCount,
			stepPeriodYears: rank.stepPeriodYears,
			steps: rank.salarySteps.map((s) => ({
				stepNumber: s.stepNumber,
				salaryAmount: s.salaryAmount.toString(),
				yearsRequired: s.yearsRequired,
			})),
		};
	}

	async getPromotionSalaryPreview(
		tenantId: string,
		employeeId: string,
		newRankId: string,
	): Promise<{
		employeeId: string;
		employeeName: string;
		currentRank: {
			id: string;
			code: string;
			name: string;
			nameAm: string | null;
		};
		newRank: {
			id: string;
			code: string;
			name: string;
			nameAm: string | null;
		};
		currentStep: number;
		currentSalary: string;
		newStep: number;
		newSalary: string;
		salaryIncrease: string;
		percentageIncrease: string;
		calculationExplanation: string;
	}> {
		const employee = await this.prisma.employee.findFirst({
			where: {
				id: employeeId,
				tenantId,
				employeeType: EmployeeType.MILITARY,
				deletedAt: null,
			},
			include: {
				rank: true,
			},
		});

		if (!employee) {
			throw new NotFoundException("Military employee not found");
		}

		if (!employee.rank || !employee.rankId) {
			throw new NotFoundException("Employee does not have a current rank");
		}

		const newRank = await this.prisma.militaryRank.findFirst({
			where: {
				id: newRankId,
				OR: [{ tenantId }, { tenantId: null }],
			},
		});

		if (!newRank) {
			throw new NotFoundException("New rank not found");
		}

		const currentSalary = employee.currentSalary ?? employee.rank.baseSalary;

		const { newStep, newSalary, explanation } = await this.salaryCalculation.calculatePromotionStep(
			employee.rankId,
			newRankId,
			currentSalary,
		);

		const { increase, percentageIncrease } = this.salaryCalculation.calculateSalaryIncrease(currentSalary, newSalary);

		return {
			employeeId: employee.id,
			employeeName: employee.fullName,
			currentRank: {
				id: employee.rank.id,
				code: employee.rank.code,
				name: employee.rank.name,
				nameAm: employee.rank.nameAm,
			},
			newRank: {
				id: newRank.id,
				code: newRank.code,
				name: newRank.name,
				nameAm: newRank.nameAm,
			},
			currentStep: employee.currentSalaryStep,
			currentSalary: currentSalary.toString(),
			newStep,
			newSalary: newSalary.toString(),
			salaryIncrease: increase.toString(),
			percentageIncrease: percentageIncrease.toFixed(2),
			calculationExplanation: explanation,
		};
	}

	async processPromotion(
		tenantId: string,
		employeeId: string,
		newRankId: string,
		effectiveDate: string,
		processedBy: string,
		orderReference?: string,
		reason?: string,
		documentPath?: string,
	): Promise<{
		success: boolean;
		employeeId: string;
		employeeName: string;
		fromStep: number;
		toStep: number;
		fromSalary: string;
		toSalary: string;
		historyId?: string;
	}> {
		const result = await this.salaryProgression.processPromotion(
			tenantId,
			employeeId,
			newRankId,
			new Date(effectiveDate),
			processedBy,
			orderReference,
			reason,
			documentPath,
		);

		return {
			...result,
			fromSalary: result.fromSalary.toString(),
			toSalary: result.toSalary.toString(),
		};
	}

	async triggerDailyEligibilityCheck(tenantId: string): Promise<{ newlyEligible: number }> {
		const newlyEligible = await this.salaryProgression.checkDailyEligibility(tenantId);
		return { newlyEligible };
	}
}
