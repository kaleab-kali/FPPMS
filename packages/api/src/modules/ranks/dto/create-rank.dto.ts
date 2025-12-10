import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class CreateRankDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(20)
	code: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	nameAm: string;

	@IsInt()
	@Min(1)
	level: number;

	@IsString()
	@IsNotEmpty()
	@MaxLength(50)
	category: string;

	@IsNumber()
	@Min(0)
	baseSalary: number;

	@IsNumber()
	@Min(0)
	ceilingSalary: number;

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
	retirementAge: number;

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
