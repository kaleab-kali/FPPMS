import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class UpdateRankDto {
	@IsString()
	@IsOptional()
	@MaxLength(100)
	name?: string;

	@IsString()
	@IsOptional()
	@MaxLength(100)
	nameAm?: string;

	@IsInt()
	@Min(1)
	@IsOptional()
	level?: number;

	@IsString()
	@IsOptional()
	@MaxLength(50)
	category?: string;

	@IsNumber()
	@Min(0)
	@IsOptional()
	baseSalary?: number;

	@IsNumber()
	@Min(0)
	@IsOptional()
	ceilingSalary?: number;

	@IsInt()
	@Min(1)
	@IsOptional()
	stepCount?: number;

	@IsInt()
	@Min(1)
	@IsOptional()
	stepPeriodYears?: number;

	@IsInt()
	@Min(1)
	@IsOptional()
	retirementAge?: number;

	@IsInt()
	@Min(0)
	@IsOptional()
	minYearsForPromotion?: number;

	@IsInt()
	@Min(0)
	@IsOptional()
	minAppraisalScore?: number;

	@IsString()
	@IsOptional()
	@MaxLength(500)
	badgePath?: string;

	@IsInt()
	@Min(0)
	@IsOptional()
	sortOrder?: number;

	@IsBoolean()
	@IsOptional()
	isActive?: boolean;
}
