import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class CreateDepartmentDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(20)
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

	@IsString()
	@IsOptional()
	parentId?: string;

	@IsString()
	@IsOptional()
	headEmployeeId?: string;

	@IsInt()
	@Min(0)
	@IsOptional()
	sortOrder?: number;

	@IsBoolean()
	@IsOptional()
	isActive?: boolean;
}
