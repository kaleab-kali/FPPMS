import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class UpdatePositionDto {
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

	@IsString()
	@IsOptional()
	departmentId?: string;

	@IsInt()
	@Min(0)
	@IsOptional()
	sortOrder?: number;

	@IsBoolean()
	@IsOptional()
	isActive?: boolean;
}
