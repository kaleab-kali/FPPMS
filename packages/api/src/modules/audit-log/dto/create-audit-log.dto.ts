import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AuditAction } from "@prisma/client";
import { IsArray, IsEnum, IsObject, IsOptional, IsString } from "class-validator";

export class CreateAuditLogDto {
	@ApiProperty({
		description: "The tenant ID for multi-tenant isolation",
		example: "clx1234567890",
	})
	@IsString()
	tenantId: string;

	@ApiPropertyOptional({
		description: "The ID of the user who performed the action",
		example: "clx0987654321",
	})
	@IsString()
	@IsOptional()
	userId?: string;

	@ApiPropertyOptional({
		description: "The username of the user who performed the action",
		example: "FPC-0001-25",
	})
	@IsString()
	@IsOptional()
	username?: string;

	@ApiPropertyOptional({
		description: "The primary role of the user at the time of action",
		example: "HR_OFFICER",
	})
	@IsString()
	@IsOptional()
	userRole?: string;

	@ApiPropertyOptional({
		description: "The center name of the user at the time of action",
		example: "Headquarters",
	})
	@IsString()
	@IsOptional()
	userCenter?: string;

	@ApiProperty({
		description: "The type of action performed",
		enum: AuditAction,
		enumName: "AuditAction",
		example: AuditAction.CREATE,
	})
	@IsEnum(AuditAction)
	action: AuditAction;

	@ApiProperty({
		description: "The module where the action was performed",
		example: "employees",
	})
	@IsString()
	module: string;

	@ApiProperty({
		description: "The resource type that was affected",
		example: "employee",
	})
	@IsString()
	resource: string;

	@ApiPropertyOptional({
		description: "The ID of the specific resource affected",
		example: "clx1122334455",
	})
	@IsString()
	@IsOptional()
	resourceId?: string;

	@ApiProperty({
		description: "IP address of the client making the request",
		example: "192.168.1.100",
	})
	@IsString()
	ipAddress: string;

	@ApiPropertyOptional({
		description: "Raw user agent string from the request",
		example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
	})
	@IsString()
	@IsOptional()
	userAgent?: string;

	@ApiPropertyOptional({
		description: "Detected device type (desktop, mobile, tablet)",
		example: "desktop",
	})
	@IsString()
	@IsOptional()
	deviceType?: string;

	@ApiPropertyOptional({
		description: "Detected browser name",
		example: "Chrome",
	})
	@IsString()
	@IsOptional()
	browser?: string;

	@ApiPropertyOptional({
		description: "Detected operating system",
		example: "Windows 10",
	})
	@IsString()
	@IsOptional()
	os?: string;

	@ApiPropertyOptional({
		description: "Session ID for tracking user session",
		example: "sess_abc123xyz789",
	})
	@IsString()
	@IsOptional()
	sessionId?: string;

	@ApiPropertyOptional({
		description: "Request ID for tracing",
		example: "req_abc123xyz789",
	})
	@IsString()
	@IsOptional()
	requestId?: string;

	@ApiPropertyOptional({
		description: "Previous value of the resource before modification",
		example: { status: "ACTIVE", name: "John Doe" },
	})
	@IsObject()
	@IsOptional()
	previousValue?: Record<string, unknown>;

	@ApiPropertyOptional({
		description: "New value of the resource after modification",
		example: { status: "INACTIVE", name: "John Doe" },
	})
	@IsObject()
	@IsOptional()
	newValue?: Record<string, unknown>;

	@ApiPropertyOptional({
		description: "List of fields that were changed",
		example: ["status", "updatedAt"],
	})
	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	changedFields?: string[];

	@ApiPropertyOptional({
		description: "Human-readable description of the action",
		example: "Updated employee status from ACTIVE to INACTIVE",
	})
	@IsString()
	@IsOptional()
	description?: string;

	@ApiPropertyOptional({
		description: "Reason provided for the action",
		example: "Employee resigned",
	})
	@IsString()
	@IsOptional()
	reason?: string;

	@ApiPropertyOptional({
		description: "ID of a related audit log entry",
		example: "clx9988776655",
	})
	@IsString()
	@IsOptional()
	relatedAuditId?: string;
}
