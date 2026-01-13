import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentTenant } from "#api/common/decorators/current-tenant.decorator";
import { Permissions } from "#api/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "#api/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "#api/common/guards/permissions.guard";
import { AuditLogService } from "./audit-log.service";
import { AuditLogQueryDto, LoginHistoryQueryDto } from "./dto/audit-log-query.dto";
import { AuditLogResponseDto, PaginatedAuditLogResponseDto } from "./dto/audit-log-response.dto";
import { PaginatedLoginHistoryResponseDto } from "./dto/login-history.dto";

@ApiTags("audit-logs")
@Controller("audit-logs")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditLogController {
	constructor(private readonly auditLogService: AuditLogService) {}

	@Get()
	@Permissions("audit.read.log")
	@ApiOperation({
		summary: "Get all audit logs",
		description:
			"Retrieves a paginated list of audit logs with optional filters for date range, user, action, module, and more.",
	})
	@ApiResponse({
		status: 200,
		description: "Paginated list of audit logs returned successfully",
		type: PaginatedAuditLogResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing authentication token" })
	@ApiResponse({ status: 403, description: "Forbidden - Insufficient permissions to view audit logs" })
	async findAll(@CurrentTenant() tenantId: string, @Query() query: AuditLogQueryDto) {
		return this.auditLogService.findAll(tenantId, query);
	}

	@Get("login-history")
	@Permissions("audit.read.history")
	@ApiOperation({
		summary: "Get login history",
		description: "Retrieves a paginated list of all login/logout events with optional filters.",
	})
	@ApiResponse({
		status: 200,
		description: "Paginated list of login history returned successfully",
		type: PaginatedLoginHistoryResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing authentication token" })
	@ApiResponse({ status: 403, description: "Forbidden - Insufficient permissions to view login history" })
	async getLoginHistory(@CurrentTenant() tenantId: string, @Query() query: LoginHistoryQueryDto) {
		return this.auditLogService.getLoginHistory(tenantId, query);
	}

	@Get("user/:userId")
	@Permissions("audit.read.log")
	@ApiOperation({
		summary: "Get audit logs by user",
		description: "Retrieves all audit log entries for a specific user with optional filters.",
	})
	@ApiParam({
		name: "userId",
		description: "The unique identifier of the user",
		example: "clx0987654321",
	})
	@ApiResponse({
		status: 200,
		description: "Paginated list of user audit logs returned successfully",
		type: PaginatedAuditLogResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing authentication token" })
	@ApiResponse({ status: 403, description: "Forbidden - Insufficient permissions to view audit logs" })
	async findByUser(
		@CurrentTenant() tenantId: string,
		@Param("userId") userId: string,
		@Query() query: AuditLogQueryDto,
	) {
		return this.auditLogService.findByUser(tenantId, userId, query);
	}

	@Get("user/:userId/login-history")
	@Permissions("audit.read.history")
	@ApiOperation({
		summary: "Get login history for a specific user",
		description: "Retrieves all login/logout events for a specific user with optional filters.",
	})
	@ApiParam({
		name: "userId",
		description: "The unique identifier of the user",
		example: "clx0987654321",
	})
	@ApiResponse({
		status: 200,
		description: "Paginated list of user login history returned successfully",
		type: PaginatedLoginHistoryResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing authentication token" })
	@ApiResponse({ status: 403, description: "Forbidden - Insufficient permissions to view login history" })
	async getUserLoginHistory(
		@CurrentTenant() tenantId: string,
		@Param("userId") userId: string,
		@Query() query: LoginHistoryQueryDto,
	) {
		return this.auditLogService.getUserLoginHistory(tenantId, userId, query);
	}

	@Get("resource/:module/:resourceId")
	@Permissions("audit.read.log")
	@ApiOperation({
		summary: "Get audit history for a specific resource",
		description:
			"Retrieves all audit log entries for a specific resource, useful for tracking changes to individual records.",
	})
	@ApiParam({
		name: "module",
		description: "The module name where the resource belongs",
		example: "employees",
	})
	@ApiParam({
		name: "resourceId",
		description: "The unique identifier of the resource",
		example: "clx1122334455",
	})
	@ApiResponse({
		status: 200,
		description: "Paginated list of resource audit logs returned successfully",
		type: PaginatedAuditLogResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing authentication token" })
	@ApiResponse({ status: 403, description: "Forbidden - Insufficient permissions to view audit logs" })
	async findByResource(
		@CurrentTenant() tenantId: string,
		@Param("module") module: string,
		@Param("resourceId") resourceId: string,
		@Query() query: AuditLogQueryDto,
	) {
		return this.auditLogService.findByResource(tenantId, module, resourceId, query);
	}

	@Get(":id")
	@Permissions("audit.read.log")
	@ApiOperation({
		summary: "Get audit log by ID",
		description: "Retrieves a single audit log entry by its unique identifier.",
	})
	@ApiParam({
		name: "id",
		description: "The unique identifier of the audit log entry",
		example: "clx1234567890",
	})
	@ApiResponse({
		status: 200,
		description: "Audit log entry returned successfully",
		type: AuditLogResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing authentication token" })
	@ApiResponse({ status: 403, description: "Forbidden - Insufficient permissions to view audit logs" })
	@ApiResponse({ status: 404, description: "Audit log entry not found" })
	async findOne(@CurrentTenant() tenantId: string, @Param("id") id: string) {
		return this.auditLogService.findOne(tenantId, id);
	}
}
