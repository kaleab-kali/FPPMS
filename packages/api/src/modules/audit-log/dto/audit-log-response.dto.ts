import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AuditAction } from "@prisma/client";

export class AuditLogResponseDto {
	@ApiProperty({
		description: "Unique identifier for the audit log entry",
		example: "clx1234567890",
	})
	id: string;

	@ApiProperty({
		description: "Tenant ID for multi-tenant isolation",
		example: "clx0001234567",
	})
	tenantId: string;

	@ApiProperty({
		description: "Timestamp when the action was performed",
		example: "2025-01-15T10:30:00.000Z",
	})
	timestamp: Date;

	@ApiPropertyOptional({
		description: "ID of the user who performed the action",
		example: "clx0987654321",
	})
	userId: string | null;

	@ApiPropertyOptional({
		description: "Username of the user who performed the action",
		example: "FPC-0001-25",
	})
	username: string | null;

	@ApiPropertyOptional({
		description: "Primary role of the user at the time of action",
		example: "HR_OFFICER",
	})
	userRole: string | null;

	@ApiPropertyOptional({
		description: "Center name of the user at the time of action",
		example: "Headquarters",
	})
	userCenter: string | null;

	@ApiProperty({
		description: "Type of action performed",
		enum: AuditAction,
		enumName: "AuditAction",
		example: AuditAction.CREATE,
	})
	action: AuditAction;

	@ApiProperty({
		description: "Module where the action was performed",
		example: "employees",
	})
	module: string;

	@ApiProperty({
		description: "Resource type that was affected",
		example: "employee",
	})
	resource: string;

	@ApiPropertyOptional({
		description: "ID of the specific resource affected",
		example: "clx1122334455",
	})
	resourceId: string | null;

	@ApiProperty({
		description: "IP address of the client making the request",
		example: "192.168.1.100",
	})
	ipAddress: string;

	@ApiPropertyOptional({
		description: "Raw user agent string from the request",
		example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
	})
	userAgent: string | null;

	@ApiPropertyOptional({
		description: "Detected device type",
		example: "desktop",
	})
	deviceType: string | null;

	@ApiPropertyOptional({
		description: "Detected browser name",
		example: "Chrome",
	})
	browser: string | null;

	@ApiPropertyOptional({
		description: "Detected operating system",
		example: "Windows 10",
	})
	os: string | null;

	@ApiPropertyOptional({
		description: "Session ID for tracking user session",
		example: "sess_abc123xyz789",
	})
	sessionId: string | null;

	@ApiPropertyOptional({
		description: "Request ID for tracing",
		example: "req_abc123xyz789",
	})
	requestId: string | null;

	@ApiPropertyOptional({
		description: "Previous value of the resource before modification",
		example: { status: "ACTIVE" },
	})
	previousValue: Record<string, unknown> | null;

	@ApiPropertyOptional({
		description: "New value of the resource after modification",
		example: { status: "INACTIVE" },
	})
	newValue: Record<string, unknown> | null;

	@ApiProperty({
		description: "List of fields that were changed",
		example: ["status", "updatedAt"],
		type: [String],
	})
	changedFields: string[];

	@ApiPropertyOptional({
		description: "Human-readable description of the action",
		example: "Updated employee status from ACTIVE to INACTIVE",
	})
	description: string | null;

	@ApiPropertyOptional({
		description: "Reason provided for the action",
		example: "Employee resigned",
	})
	reason: string | null;

	@ApiPropertyOptional({
		description: "ID of a related audit log entry",
		example: "clx9988776655",
	})
	relatedAuditId: string | null;
}

export class PaginationMetaDto {
	@ApiProperty({
		description: "Total number of items",
		example: 150,
	})
	total: number;

	@ApiProperty({
		description: "Current page number",
		example: 1,
	})
	page: number;

	@ApiProperty({
		description: "Number of items per page",
		example: 20,
	})
	limit: number;

	@ApiProperty({
		description: "Total number of pages",
		example: 8,
	})
	totalPages: number;

	@ApiProperty({
		description: "Whether there is a next page",
		example: true,
	})
	hasNextPage: boolean;

	@ApiProperty({
		description: "Whether there is a previous page",
		example: false,
	})
	hasPreviousPage: boolean;
}

export class PaginatedAuditLogResponseDto {
	@ApiProperty({
		description: "Array of audit log entries",
		type: [AuditLogResponseDto],
	})
	data: AuditLogResponseDto[];

	@ApiProperty({
		description: "Pagination metadata",
		type: PaginationMetaDto,
	})
	meta: PaginationMetaDto;
}
