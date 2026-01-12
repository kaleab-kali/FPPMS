import { Injectable } from "@nestjs/common";
import { EmployeeSalaryHistory, Prisma, SalaryChangeType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/client";
import { calculateSkip, paginate } from "#api/common/utils/pagination.util";
import { PrismaService } from "#api/database/prisma.service";

interface CreateHistoryEntryData {
	tenantId: string;
	employeeId: string;
	rankId: string;
	changeType: SalaryChangeType;
	fromStep?: number;
	toStep: number;
	fromSalary?: Decimal;
	toSalary: Decimal;
	effectiveDate: Date;
	reason?: string;
	orderReference?: string;
	documentPath?: string;
	previousRankId?: string;
	isAutomatic: boolean;
	processedBy?: string;
	approvedBy?: string;
	notes?: string;
}

interface SalaryHistoryFilter {
	changeType?: SalaryChangeType;
	dateFrom?: Date;
	dateTo?: Date;
	rankId?: string;
	page?: number;
	limit?: number;
}

const SALARY_HISTORY_INCLUDE = {
	employee: {
		select: {
			id: true,
			employeeId: true,
			fullName: true,
			fullNameAm: true,
		},
	},
	rank: {
		select: {
			id: true,
			code: true,
			name: true,
			nameAm: true,
		},
	},
	previousRank: {
		select: {
			id: true,
			code: true,
			name: true,
			nameAm: true,
		},
	},
} as const;

@Injectable()
export class SalaryHistoryService {
	constructor(private readonly prisma: PrismaService) {}

	async createHistoryEntry(data: CreateHistoryEntryData): Promise<EmployeeSalaryHistory> {
		return this.prisma.employeeSalaryHistory.create({
			data: {
				tenantId: data.tenantId,
				employeeId: data.employeeId,
				rankId: data.rankId,
				changeType: data.changeType,
				fromStep: data.fromStep,
				toStep: data.toStep,
				fromSalary: data.fromSalary,
				toSalary: data.toSalary,
				effectiveDate: data.effectiveDate,
				reason: data.reason,
				orderReference: data.orderReference,
				documentPath: data.documentPath,
				previousRankId: data.previousRankId,
				isAutomatic: data.isAutomatic,
				processedBy: data.processedBy,
				approvedBy: data.approvedBy,
				approvedAt: data.approvedBy ? new Date() : undefined,
				notes: data.notes,
			},
		});
	}

	async getEmployeeSalaryHistory(
		tenantId: string,
		employeeId: string,
		filter?: SalaryHistoryFilter,
	): Promise<{
		data: EmployeeSalaryHistory[];
		meta: {
			total: number;
			page: number;
			limit: number;
			totalPages: number;
			hasNextPage: boolean;
			hasPreviousPage: boolean;
		};
	}> {
		const page = filter?.page ?? 1;
		const limit = filter?.limit ?? 20;

		const where: Prisma.EmployeeSalaryHistoryWhereInput = {
			tenantId,
			employeeId,
		};

		if (filter?.changeType) {
			where.changeType = filter.changeType;
		}

		if (filter?.dateFrom || filter?.dateTo) {
			where.effectiveDate = {};
			if (filter.dateFrom) {
				where.effectiveDate.gte = filter.dateFrom;
			}
			if (filter.dateTo) {
				where.effectiveDate.lte = filter.dateTo;
			}
		}

		if (filter?.rankId) {
			where.rankId = filter.rankId;
		}

		const [data, total] = await Promise.all([
			this.prisma.employeeSalaryHistory.findMany({
				where,
				include: SALARY_HISTORY_INCLUDE,
				orderBy: { effectiveDate: "desc" },
				skip: calculateSkip(page, limit),
				take: limit,
			}),
			this.prisma.employeeSalaryHistory.count({ where }),
		]);

		return paginate(data, total, page, limit);
	}

	async getSalaryChangesByType(
		tenantId: string,
		changeType: SalaryChangeType,
		dateRange?: { from: Date; to: Date },
		pagination?: { page: number; limit: number },
	): Promise<{
		data: EmployeeSalaryHistory[];
		meta: {
			total: number;
			page: number;
			limit: number;
			totalPages: number;
			hasNextPage: boolean;
			hasPreviousPage: boolean;
		};
	}> {
		const page = pagination?.page ?? 1;
		const limit = pagination?.limit ?? 20;

		const where: Prisma.EmployeeSalaryHistoryWhereInput = {
			tenantId,
			changeType,
		};

		if (dateRange) {
			where.effectiveDate = {
				gte: dateRange.from,
				lte: dateRange.to,
			};
		}

		const [data, total] = await Promise.all([
			this.prisma.employeeSalaryHistory.findMany({
				where,
				include: SALARY_HISTORY_INCLUDE,
				orderBy: { effectiveDate: "desc" },
				skip: calculateSkip(page, limit),
				take: limit,
			}),
			this.prisma.employeeSalaryHistory.count({ where }),
		]);

		return paginate(data, total, page, limit);
	}

	async getSalaryChangeSummary(
		tenantId: string,
		dateRange?: { from: Date; to: Date },
	): Promise<{
		byChangeType: Record<SalaryChangeType, number>;
		totalChanges: number;
		totalSalaryIncrease: Decimal;
		averageIncrease: Decimal;
	}> {
		const where: Prisma.EmployeeSalaryHistoryWhereInput = { tenantId };

		if (dateRange) {
			where.effectiveDate = {
				gte: dateRange.from,
				lte: dateRange.to,
			};
		}

		const changes = await this.prisma.employeeSalaryHistory.findMany({
			where,
			select: {
				changeType: true,
				fromSalary: true,
				toSalary: true,
			},
		});

		const byChangeType: Record<SalaryChangeType, number> = {
			INITIAL: 0,
			STEP_INCREMENT: 0,
			MANUAL_JUMP: 0,
			MASS_RAISE: 0,
			PROMOTION: 0,
			SCALE_REVISION: 0,
		};

		let totalSalaryIncrease = new Decimal(0);

		for (const change of changes) {
			byChangeType[change.changeType]++;
			if (change.fromSalary) {
				totalSalaryIncrease = totalSalaryIncrease.plus(change.toSalary.minus(change.fromSalary));
			}
		}

		const totalChanges = changes.length;
		const averageIncrease = totalChanges > 0 ? totalSalaryIncrease.dividedBy(totalChanges) : new Decimal(0);

		return {
			byChangeType,
			totalChanges,
			totalSalaryIncrease,
			averageIncrease,
		};
	}

	async getLatestSalaryChange(tenantId: string, employeeId: string): Promise<EmployeeSalaryHistory | null> {
		return this.prisma.employeeSalaryHistory.findFirst({
			where: {
				tenantId,
				employeeId,
			},
			include: SALARY_HISTORY_INCLUDE,
			orderBy: { effectiveDate: "desc" },
		});
	}

	async getHistoryByDateRange(
		tenantId: string,
		from: Date,
		to: Date,
		pagination?: { page: number; limit: number },
	): Promise<{
		data: EmployeeSalaryHistory[];
		meta: {
			total: number;
			page: number;
			limit: number;
			totalPages: number;
			hasNextPage: boolean;
			hasPreviousPage: boolean;
		};
	}> {
		const page = pagination?.page ?? 1;
		const limit = pagination?.limit ?? 20;

		const where: Prisma.EmployeeSalaryHistoryWhereInput = {
			tenantId,
			effectiveDate: {
				gte: from,
				lte: to,
			},
		};

		const [data, total] = await Promise.all([
			this.prisma.employeeSalaryHistory.findMany({
				where,
				include: SALARY_HISTORY_INCLUDE,
				orderBy: { effectiveDate: "desc" },
				skip: calculateSkip(page, limit),
				take: limit,
			}),
			this.prisma.employeeSalaryHistory.count({ where }),
		]);

		return paginate(data, total, page, limit);
	}

	async countChangesByEmployee(tenantId: string, employeeId: string): Promise<Record<SalaryChangeType, number>> {
		const changes = await this.prisma.employeeSalaryHistory.groupBy({
			by: ["changeType"],
			where: {
				tenantId,
				employeeId,
			},
			_count: {
				changeType: true,
			},
		});

		const result: Record<SalaryChangeType, number> = {
			INITIAL: 0,
			STEP_INCREMENT: 0,
			MANUAL_JUMP: 0,
			MASS_RAISE: 0,
			PROMOTION: 0,
			SCALE_REVISION: 0,
		};

		for (const change of changes) {
			result[change.changeType] = change._count.changeType;
		}

		return result;
	}
}
