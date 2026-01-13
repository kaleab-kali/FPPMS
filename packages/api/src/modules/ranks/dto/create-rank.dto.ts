import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
	ArrayMaxSize,
	ArrayMinSize,
	IsArray,
	IsBoolean,
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	MaxLength,
	Min,
	ValidateNested,
} from "class-validator";

export class SalaryStepDto {
	@ApiProperty({
		description: "Step number (0 for base, 1-9 for steps)",
		example: 1,
		minimum: 0,
		maximum: 9,
	})
	@IsInt()
	@Min(0)
	stepNumber: number;

	@ApiProperty({
		description: "Salary amount for this step in ETB",
		example: 6591,
	})
	@IsNumber()
	@Min(0)
	salaryAmount: number;
}

export class CreateRankDto {
	@ApiProperty({
		description: "Unique code for the rank",
		example: "CONST",
		maxLength: 20,
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(20)
	code: string;

	@ApiProperty({
		description: "Rank name in English",
		example: "Constable",
		maxLength: 100,
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name: string;

	@ApiProperty({
		description: "Rank name in Amharic",
		example: "\u12AE\u1295\u1235\u1273\u1265\u120D",
		maxLength: 100,
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	nameAm: string;

	@ApiProperty({
		description: "Hierarchical level (1 is lowest)",
		example: 1,
		minimum: 1,
	})
	@IsInt()
	@Min(1)
	level: number;

	@ApiProperty({
		description: "Rank category",
		example: "ENLISTED",
		enum: ["ENLISTED", "NCO", "JUNIOR_OFFICER", "SENIOR_OFFICER", "EXECUTIVE", "GENERAL"],
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(50)
	category: string;

	@ApiProperty({
		description: "Base salary (Step 0) in ETB",
		example: 6365,
	})
	@IsNumber()
	@Min(0)
	baseSalary: number;

	@ApiProperty({
		description: "Ceiling salary (maximum) in ETB",
		example: 8944,
	})
	@IsNumber()
	@Min(0)
	ceilingSalary: number;

	@ApiPropertyOptional({
		description: "Number of salary steps (default: 9)",
		example: 9,
		default: 9,
	})
	@IsInt()
	@Min(1)
	@IsOptional()
	stepCount?: number;

	@ApiPropertyOptional({
		description: "Years between step increments (default: 2)",
		example: 2,
		default: 2,
	})
	@IsInt()
	@Min(1)
	@IsOptional()
	stepPeriodYears?: number;

	@ApiProperty({
		description: "Retirement age for this rank",
		example: 50,
	})
	@IsInt()
	@Min(1)
	retirementAge: number;

	@ApiPropertyOptional({
		description: "Minimum years of service required for promotion",
		example: 3,
	})
	@IsInt()
	@Min(0)
	@IsOptional()
	minYearsForPromotion?: number;

	@ApiPropertyOptional({
		description: "Minimum appraisal score required for promotion",
		example: 70,
	})
	@IsInt()
	@Min(0)
	@IsOptional()
	minAppraisalScore?: number;

	@ApiPropertyOptional({
		description: "Path to rank badge image",
		example: "/badges/constable.png",
	})
	@IsString()
	@IsOptional()
	@MaxLength(500)
	badgePath?: string;

	@ApiPropertyOptional({
		description: "Sort order for display",
		example: 0,
		default: 0,
	})
	@IsInt()
	@Min(0)
	@IsOptional()
	sortOrder?: number;

	@ApiPropertyOptional({
		description: "Whether the rank is active",
		example: true,
		default: true,
	})
	@IsBoolean()
	@IsOptional()
	isActive?: boolean;

	@ApiPropertyOptional({
		description: "Array of salary steps (if not provided, will be auto-calculated from base to ceiling)",
		type: [SalaryStepDto],
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => SalaryStepDto)
	@ArrayMinSize(0)
	@ArrayMaxSize(10)
	@IsOptional()
	salarySteps?: SalaryStepDto[];
}
