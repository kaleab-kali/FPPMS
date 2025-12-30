import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ACCESS_SCOPES } from "#api/common/constants/roles.constant";

export class RolePermissionDto {
	@ApiProperty({ description: "Permission ID", example: "perm-uuid-123" })
	id: string;

	@ApiProperty({ description: "Module name", example: "employees" })
	module: string;

	@ApiProperty({ description: "Action type", example: "read" })
	action: string;

	@ApiProperty({ description: "Resource name", example: "employee" })
	resource: string;

	@ApiPropertyOptional({ description: "Permission description", example: "View employee records" })
	description?: string;
}

export class RoleResponseDto {
	@ApiProperty({ description: "Role ID", example: "role-uuid-123" })
	id: string;

	@ApiPropertyOptional({ description: "Tenant ID (null for system roles)", example: "tenant-uuid-123" })
	tenantId: string | undefined;

	@ApiProperty({ description: "Unique role code", example: "HR_OFFICER" })
	code: string;

	@ApiProperty({ description: "Role display name", example: "HR Officer" })
	name: string;

	@ApiPropertyOptional({ description: "Amharic role name", example: "የሰው ሀይል መኮንን" })
	nameAm: string | undefined;

	@ApiPropertyOptional({ description: "Role description", example: "HR operations and employee management" })
	description: string | undefined;

	@ApiProperty({ description: "Whether this is a system-defined role", example: true })
	isSystemRole: boolean;

	@ApiProperty({ description: "Role hierarchy level (higher = more authority)", example: 70 })
	level: number;

	@ApiProperty({
		description: "Access scope determining data visibility",
		example: ACCESS_SCOPES.OWN_CENTER,
		enum: [ACCESS_SCOPES.ALL_CENTERS, ACCESS_SCOPES.OWN_CENTER],
	})
	accessScope: string;

	@ApiProperty({ description: "Whether the role is active", example: true })
	isActive: boolean;

	@ApiProperty({ description: "Permissions assigned to this role", type: [RolePermissionDto] })
	permissions: RolePermissionDto[];

	@ApiProperty({ description: "Creation timestamp" })
	createdAt: Date;

	@ApiProperty({ description: "Last update timestamp" })
	updatedAt: Date;
}
