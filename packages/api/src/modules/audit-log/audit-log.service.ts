import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PaginatedResult } from "#api/common/interfaces/paginated-result.interface";
import { calculateSkip, paginate } from "#api/common/utils/pagination.util";
import { PrismaService } from "#api/database/prisma.service";
import { AuditLogQueryDto, LoginHistoryQueryDto } from "./dto/audit-log-query.dto";
import { AuditLogResponseDto } from "./dto/audit-log-response.dto";
import { CreateAuditLogDto } from "./dto/create-audit-log.dto";
import { CreateLoginHistoryDto, LoginHistoryResponseDto } from "./dto/login-history.dto";

@Injectable()
export class AuditLogService {
	private readonly logger = new Logger(AuditLogService.name);

	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateAuditLogDto): Promise<AuditLogResponseDto> {
		const auditLog = await this.prisma.auditLog.create({
			data: {
				tenantId: dto.tenantId,
				userId: dto.userId,
				username: dto.username,
				userRole: dto.userRole,
				userCenter: dto.userCenter,
				action: dto.action,
				module: dto.module,
				resource: dto.resource,
				resourceId: dto.resourceId,
				ipAddress: dto.ipAddress,
				userAgent: dto.userAgent,
				deviceType: dto.deviceType,
				browser: dto.browser,
				os: dto.os,
				sessionId: dto.sessionId,
				requestId: dto.requestId,
				previousValue: dto.previousValue as Prisma.InputJsonValue,
				newValue: dto.newValue as Prisma.InputJsonValue,
				changedFields: dto.changedFields ?? [],
				description: dto.description,
				reason: dto.reason,
				relatedAuditId: dto.relatedAuditId,
			},
		});

		return this.mapToResponse(auditLog);
	}

	async findAll(tenantId: string, query: AuditLogQueryDto): Promise<PaginatedResult<AuditLogResponseDto>> {
		const where = this.buildWhereClause(tenantId, query);
		const orderBy = this.buildOrderBy(query.sortBy ?? "timestamp", query.sortOrder ?? "desc");
		const page = query.page ?? 1;
		const limit = query.limit ?? 20;

		const [auditLogs, total] = await Promise.all([
			this.prisma.auditLog.findMany({
				where,
				orderBy,
				skip: calculateSkip(page, limit),
				take: limit,
			}),
			this.prisma.auditLog.count({ where }),
		]);

		const data = auditLogs.map((log) => this.mapToResponse(log));
		return paginate(data, total, page, limit);
	}

	async findOne(tenantId: string, id: string): Promise<AuditLogResponseDto> {
		const auditLog = await this.prisma.auditLog.findFirst({
			where: { id, tenantId },
		});

		if (!auditLog) {
			throw new NotFoundException("Audit log entry not found");
		}

		return this.mapToResponse(auditLog);
	}

	async findByResource(
		tenantId: string,
		module: string,
		resourceId: string,
		query?: AuditLogQueryDto,
	): Promise<PaginatedResult<AuditLogResponseDto>> {
		const page = query?.page ?? 1;
		const limit = query?.limit ?? 20;

		const where: Prisma.AuditLogWhereInput = {
			tenantId,
			module,
			resourceId,
		};

		if (query?.dateFrom) {
			where.timestamp = { gte: new Date(query.dateFrom) };
		}

		if (query?.dateTo) {
			where.timestamp = {
				...(where.timestamp as Prisma.DateTimeFilter),
				lte: new Date(query.dateTo),
			};
		}

		const orderBy = this.buildOrderBy(query?.sortBy ?? "timestamp", query?.sortOrder ?? "desc");

		const [auditLogs, total] = await Promise.all([
			this.prisma.auditLog.findMany({
				where,
				orderBy,
				skip: calculateSkip(page, limit),
				take: limit,
			}),
			this.prisma.auditLog.count({ where }),
		]);

		const data = auditLogs.map((log) => this.mapToResponse(log));
		return paginate(data, total, page, limit);
	}

	async findByUser(
		tenantId: string,
		userId: string,
		query?: AuditLogQueryDto,
	): Promise<PaginatedResult<AuditLogResponseDto>> {
		const page = query?.page ?? 1;
		const limit = query?.limit ?? 20;

		const where: Prisma.AuditLogWhereInput = {
			tenantId,
			userId,
		};

		if (query?.action) {
			where.action = query.action;
		}

		if (query?.module) {
			where.module = query.module;
		}

		if (query?.dateFrom) {
			where.timestamp = { gte: new Date(query.dateFrom) };
		}

		if (query?.dateTo) {
			where.timestamp = {
				...(where.timestamp as Prisma.DateTimeFilter),
				lte: new Date(query.dateTo),
			};
		}

		const orderBy = this.buildOrderBy(query?.sortBy ?? "timestamp", query?.sortOrder ?? "desc");

		const [auditLogs, total] = await Promise.all([
			this.prisma.auditLog.findMany({
				where,
				orderBy,
				skip: calculateSkip(page, limit),
				take: limit,
			}),
			this.prisma.auditLog.count({ where }),
		]);

		const data = auditLogs.map((log) => this.mapToResponse(log));
		return paginate(data, total, page, limit);
	}

	async getLoginHistory(
		tenantId: string,
		query: LoginHistoryQueryDto,
	): Promise<PaginatedResult<LoginHistoryResponseDto>> {
		const page = query.page ?? 1;
		const limit = query.limit ?? 20;

		const where = this.buildLoginHistoryWhereClause(tenantId, query);
		const orderBy = this.buildLoginHistoryOrderBy(query.sortBy ?? "loginAt", query.sortOrder ?? "desc");

		const [loginHistory, total] = await Promise.all([
			this.prisma.loginHistory.findMany({
				where,
				orderBy,
				skip: calculateSkip(page, limit),
				take: limit,
			}),
			this.prisma.loginHistory.count({ where }),
		]);

		const data = loginHistory.map((entry) => this.mapLoginHistoryToResponse(entry));
		return paginate(data, total, page, limit);
	}

	async recordLogin(dto: CreateLoginHistoryDto): Promise<LoginHistoryResponseDto> {
		const loginHistory = await this.prisma.loginHistory.create({
			data: {
				userId: dto.userId,
				ipAddress: dto.ipAddress,
				userAgent: dto.userAgent,
				deviceType: dto.deviceType,
				browser: dto.browser,
				os: dto.os,
				location: dto.location,
				sessionId: dto.sessionId,
				isSuccessful: dto.isSuccessful ?? true,
				failureReason: dto.failureReason,
			},
		});

		return this.mapLoginHistoryToResponse(loginHistory);
	}

	async recordLogout(sessionId: string): Promise<LoginHistoryResponseDto | undefined> {
		const loginEntry = await this.prisma.loginHistory.findFirst({
			where: { sessionId, logoutAt: null },
			orderBy: { loginAt: "desc" },
		});

		if (!loginEntry) {
			this.logger.warn(`No active login session found for sessionId: ${sessionId}`);
			return undefined;
		}

		const updated = await this.prisma.loginHistory.update({
			where: { id: loginEntry.id },
			data: { logoutAt: new Date() },
		});

		return this.mapLoginHistoryToResponse(updated);
	}

	async getUserLoginHistory(
		_tenantId: string,
		userId: string,
		query?: LoginHistoryQueryDto,
	): Promise<PaginatedResult<LoginHistoryResponseDto>> {
		const page = query?.page ?? 1;
		const limit = query?.limit ?? 20;

		const where: Prisma.LoginHistoryWhereInput = { userId };

		if (query?.dateFrom) {
			where.loginAt = { gte: new Date(query.dateFrom) };
		}

		if (query?.dateTo) {
			where.loginAt = {
				...(where.loginAt as Prisma.DateTimeFilter),
				lte: new Date(query.dateTo),
			};
		}

		if (query?.isSuccessful !== undefined) {
			where.isSuccessful = query.isSuccessful;
		}

		const orderBy = this.buildLoginHistoryOrderBy(query?.sortBy ?? "loginAt", query?.sortOrder ?? "desc");

		const [loginHistory, total] = await Promise.all([
			this.prisma.loginHistory.findMany({
				where,
				orderBy,
				skip: calculateSkip(page, limit),
				take: limit,
			}),
			this.prisma.loginHistory.count({ where }),
		]);

		const data = loginHistory.map((entry) => this.mapLoginHistoryToResponse(entry));
		return paginate(data, total, page, limit);
	}

	private buildWhereClause(tenantId: string, query: AuditLogQueryDto): Prisma.AuditLogWhereInput {
		const where: Prisma.AuditLogWhereInput = { tenantId };

		if (query.dateFrom) {
			where.timestamp = { gte: new Date(query.dateFrom) };
		}

		if (query.dateTo) {
			where.timestamp = {
				...(where.timestamp as Prisma.DateTimeFilter),
				lte: new Date(query.dateTo),
			};
		}

		if (query.userId) {
			where.userId = query.userId;
		}

		if (query.action) {
			where.action = query.action;
		}

		if (query.module) {
			where.module = query.module;
		}

		if (query.resource) {
			where.resource = query.resource;
		}

		if (query.resourceId) {
			where.resourceId = query.resourceId;
		}

		if (query.ipAddress) {
			where.ipAddress = query.ipAddress;
		}

		if (query.search) {
			where.OR = [
				{ username: { contains: query.search, mode: "insensitive" } },
				{ description: { contains: query.search, mode: "insensitive" } },
				{ module: { contains: query.search, mode: "insensitive" } },
				{ resource: { contains: query.search, mode: "insensitive" } },
			];
		}

		return where;
	}

	private buildLoginHistoryWhereClause(_tenantId: string, query: LoginHistoryQueryDto): Prisma.LoginHistoryWhereInput {
		const where: Prisma.LoginHistoryWhereInput = {};

		if (query.dateFrom) {
			where.loginAt = { gte: new Date(query.dateFrom) };
		}

		if (query.dateTo) {
			where.loginAt = {
				...(where.loginAt as Prisma.DateTimeFilter),
				lte: new Date(query.dateTo),
			};
		}

		if (query.userId) {
			where.userId = query.userId;
		}

		if (query.ipAddress) {
			where.ipAddress = query.ipAddress;
		}

		if (query.isSuccessful !== undefined) {
			where.isSuccessful = query.isSuccessful;
		}

		if (query.search) {
			where.OR = [{ ipAddress: { contains: query.search, mode: "insensitive" } }];
		}

		return where;
	}

	private buildOrderBy(
		sortBy: string,
		sortOrder: "asc" | "desc",
	): Prisma.AuditLogOrderByWithRelationInput | Prisma.AuditLogOrderByWithRelationInput[] {
		const validSortFields = ["timestamp", "action", "module", "resource", "username", "ipAddress"];
		const field = validSortFields.includes(sortBy) ? sortBy : "timestamp";
		return { [field]: sortOrder };
	}

	private buildLoginHistoryOrderBy(
		sortBy: string,
		sortOrder: "asc" | "desc",
	): Prisma.LoginHistoryOrderByWithRelationInput | Prisma.LoginHistoryOrderByWithRelationInput[] {
		const validSortFields = ["loginAt", "logoutAt", "ipAddress", "isSuccessful"];
		const field = validSortFields.includes(sortBy) ? sortBy : "loginAt";
		return { [field]: sortOrder };
	}

	private mapToResponse(auditLog: {
		id: string;
		tenantId: string;
		timestamp: Date;
		userId: string | null;
		username: string | null;
		userRole: string | null;
		userCenter: string | null;
		action: string;
		module: string;
		resource: string;
		resourceId: string | null;
		ipAddress: string;
		userAgent: string | null;
		deviceType: string | null;
		browser: string | null;
		os: string | null;
		sessionId: string | null;
		requestId: string | null;
		previousValue: Prisma.JsonValue;
		newValue: Prisma.JsonValue;
		changedFields: string[];
		description: string | null;
		reason: string | null;
		relatedAuditId: string | null;
	}): AuditLogResponseDto {
		return {
			id: auditLog.id,
			tenantId: auditLog.tenantId,
			timestamp: auditLog.timestamp,
			userId: auditLog.userId,
			username: auditLog.username,
			userRole: auditLog.userRole,
			userCenter: auditLog.userCenter,
			action: auditLog.action as AuditLogResponseDto["action"],
			module: auditLog.module,
			resource: auditLog.resource,
			resourceId: auditLog.resourceId,
			ipAddress: auditLog.ipAddress,
			userAgent: auditLog.userAgent,
			deviceType: auditLog.deviceType,
			browser: auditLog.browser,
			os: auditLog.os,
			sessionId: auditLog.sessionId,
			requestId: auditLog.requestId,
			previousValue: auditLog.previousValue as Record<string, unknown> | null,
			newValue: auditLog.newValue as Record<string, unknown> | null,
			changedFields: auditLog.changedFields,
			description: auditLog.description,
			reason: auditLog.reason,
			relatedAuditId: auditLog.relatedAuditId,
		};
	}

	private mapLoginHistoryToResponse(entry: {
		id: string;
		userId: string;
		loginAt: Date;
		logoutAt: Date | null;
		ipAddress: string;
		userAgent: string | null;
		deviceType: string | null;
		browser: string | null;
		os: string | null;
		location: string | null;
		sessionId: string;
		isSuccessful: boolean;
		failureReason: string | null;
	}): LoginHistoryResponseDto {
		return {
			id: entry.id,
			userId: entry.userId,
			loginAt: entry.loginAt,
			logoutAt: entry.logoutAt,
			ipAddress: entry.ipAddress,
			userAgent: entry.userAgent,
			deviceType: entry.deviceType,
			browser: entry.browser,
			os: entry.os,
			location: entry.location,
			sessionId: entry.sessionId,
			isSuccessful: entry.isSuccessful,
			failureReason: entry.failureReason,
		};
	}
}
