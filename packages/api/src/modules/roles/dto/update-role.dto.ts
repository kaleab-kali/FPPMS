import { IsArray, IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class UpdateRoleDto {
	@IsString()
	@IsOptional()
	@MaxLength(100)
	name?: string;

	@IsString()
	@IsOptional()
	@MaxLength(100)
	nameAm?: string;

	@IsString()
	@IsOptional()
	@MaxLength(500)
	description?: string;

	@IsInt()
	@Min(0)
	@IsOptional()
	level?: number;

	@IsString()
	@IsOptional()
	@MaxLength(50)
	accessScope?: string;

	@IsBoolean()
	@IsOptional()
	isActive?: boolean;

	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	permissionIds?: string[];
}
