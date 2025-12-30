import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from "class-validator";
import { ACCESS_SCOPES } from "#api/common/constants/roles.constant";

const VALID_ACCESS_SCOPES = [ACCESS_SCOPES.ALL_CENTERS, ACCESS_SCOPES.OWN_CENTER] as const;

export class CreateRoleDto {
	@ApiProperty({
		description: "Unique code for the role",
		example: "CUSTOM_ROLE",
		maxLength: 50,
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(50)
	code: string;

	@ApiProperty({
		description: "Display name of the role",
		example: "Custom Role",
		maxLength: 100,
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name: string;

	@ApiPropertyOptional({
		description: "Amharic name of the role",
		example: "ብጁ ሚና",
		maxLength: 100,
	})
	@IsString()
	@IsOptional()
	@MaxLength(100)
	nameAm?: string;

	@ApiPropertyOptional({
		description: "Description of the role and its responsibilities",
		example: "Custom role for specific operations",
		maxLength: 500,
	})
	@IsString()
	@IsOptional()
	@MaxLength(500)
	description?: string;

	@ApiPropertyOptional({
		description: "Role level for hierarchy (higher = more authority)",
		example: 50,
		minimum: 0,
	})
	@IsInt()
	@Min(0)
	@IsOptional()
	level?: number;

	@ApiPropertyOptional({
		description: "Access scope determining data visibility",
		example: ACCESS_SCOPES.OWN_CENTER,
		enum: VALID_ACCESS_SCOPES,
	})
	@IsString()
	@IsOptional()
	@IsIn(VALID_ACCESS_SCOPES, { message: "accessScope must be either ALL_CENTERS or OWN_CENTER" })
	accessScope?: string;

	@ApiPropertyOptional({
		description: "Whether the role is active",
		example: true,
		default: true,
	})
	@IsBoolean()
	@IsOptional()
	isActive?: boolean;

	@ApiPropertyOptional({
		description: "Array of permission IDs to assign to this role",
		example: ["perm-uuid-1", "perm-uuid-2"],
		type: [String],
	})
	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	permissionIds?: string[];
}
