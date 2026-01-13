import { ApiPropertyOptional } from "@nestjs/swagger";
import { AuditAction } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class AuditLogQueryDto {
	@ApiPropertyOptional({
		description: "Page number for pagination",
		example: 1,
		minimum: 1,
		default: 1,
	})
	@IsOptional()
	@IsInt()
	@Min(1)
	@Transform(({ value }) => parseInt(value, 10))
	page?: number = 1;

	@ApiPropertyOptional({
		description: "Number of items per page",
		example: 20,
		minimum: 1,
		maximum: 100,
		default: 20,
	})
	@IsOptional()
	@IsInt()
	@Min(1)
	@Max(100)
	@Transform(({ value }) => parseInt(value, 10))
	limit?: number = 20;

	@ApiPropertyOptional({
		description: "Filter by start date (ISO 8601 format)",
		example: "2025-01-01T00:00:00.000Z",
	})
	@IsOptional()
	@IsDateString()
	dateFrom?: string;

	@ApiPropertyOptional({
		description: "Filter by end date (ISO 8601 format)",
		example: "2025-12-31T23:59:59.999Z",
	})
	@IsOptional()
	@IsDateString()
	dateTo?: string;

	@ApiPropertyOptional({
		description: "Filter by user ID",
		example: "clx0987654321",
	})
	@IsOptional()
	@IsString()
	userId?: string;

	@ApiPropertyOptional({
		description: "Filter by action type",
		enum: AuditAction,
		enumName: "AuditAction",
		example: AuditAction.CREATE,
	})
	@IsOptional()
	@IsEnum(AuditAction)
	action?: AuditAction;

	@ApiPropertyOptional({
		description: "Filter by module name",
		example: "employees",
	})
	@IsOptional()
	@IsString()
	module?: string;

	@ApiPropertyOptional({
		description: "Filter by resource type",
		example: "employee",
	})
	@IsOptional()
	@IsString()
	resource?: string;

	@ApiPropertyOptional({
		description: "Filter by specific resource ID",
		example: "clx1122334455",
	})
	@IsOptional()
	@IsString()
	resourceId?: string;

	@ApiPropertyOptional({
		description: "Filter by IP address",
		example: "192.168.1.100",
	})
	@IsOptional()
	@IsString()
	ipAddress?: string;

	@ApiPropertyOptional({
		description: "Search term for username, description, or module",
		example: "employee",
	})
	@IsOptional()
	@IsString()
	search?: string;

	@ApiPropertyOptional({
		description: "Field to sort by",
		example: "timestamp",
		default: "timestamp",
	})
	@IsOptional()
	@IsString()
	sortBy?: string = "timestamp";

	@ApiPropertyOptional({
		description: "Sort order (ascending or descending)",
		enum: ["asc", "desc"],
		example: "desc",
		default: "desc",
	})
	@IsOptional()
	@IsIn(["asc", "desc"])
	sortOrder?: "asc" | "desc" = "desc";
}

export class LoginHistoryQueryDto {
	@ApiPropertyOptional({
		description: "Page number for pagination",
		example: 1,
		minimum: 1,
		default: 1,
	})
	@IsOptional()
	@IsInt()
	@Min(1)
	@Transform(({ value }) => parseInt(value, 10))
	page?: number = 1;

	@ApiPropertyOptional({
		description: "Number of items per page",
		example: 20,
		minimum: 1,
		maximum: 100,
		default: 20,
	})
	@IsOptional()
	@IsInt()
	@Min(1)
	@Max(100)
	@Transform(({ value }) => parseInt(value, 10))
	limit?: number = 20;

	@ApiPropertyOptional({
		description: "Filter by start date (ISO 8601 format)",
		example: "2025-01-01T00:00:00.000Z",
	})
	@IsOptional()
	@IsDateString()
	dateFrom?: string;

	@ApiPropertyOptional({
		description: "Filter by end date (ISO 8601 format)",
		example: "2025-12-31T23:59:59.999Z",
	})
	@IsOptional()
	@IsDateString()
	dateTo?: string;

	@ApiPropertyOptional({
		description: "Filter by user ID",
		example: "clx0987654321",
	})
	@IsOptional()
	@IsString()
	userId?: string;

	@ApiPropertyOptional({
		description: "Filter by IP address",
		example: "192.168.1.100",
	})
	@IsOptional()
	@IsString()
	ipAddress?: string;

	@ApiPropertyOptional({
		description: "Filter by success status",
		example: true,
	})
	@IsOptional()
	@Transform(({ value }) =>
		value === undefined || value === null || value === "" ? undefined : value === "true" || value === true,
	)
	isSuccessful?: boolean;

	@ApiPropertyOptional({
		description: "Search term for username or IP address",
		example: "admin",
	})
	@IsOptional()
	@IsString()
	search?: string;

	@ApiPropertyOptional({
		description: "Field to sort by",
		example: "loginAt",
		default: "loginAt",
	})
	@IsOptional()
	@IsString()
	sortBy?: string = "loginAt";

	@ApiPropertyOptional({
		description: "Sort order (ascending or descending)",
		enum: ["asc", "desc"],
		example: "desc",
		default: "desc",
	})
	@IsOptional()
	@IsIn(["asc", "desc"])
	sortOrder?: "asc" | "desc" = "desc";
}
