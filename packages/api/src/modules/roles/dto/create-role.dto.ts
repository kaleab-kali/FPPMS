import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class CreateRoleDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(50)
	code: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name: string;

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
}
