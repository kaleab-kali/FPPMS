import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
	ArrayMaxSize,
	ArrayMinSize,
	IsArray,
	IsBoolean,
	IsInt,
	IsNumber,
	IsOptional,
	IsString,
	MaxLength,
	Min,
	ValidateNested,
} from "class-validator";
import { SalaryStepDto } from "#api/modules/ranks/dto/create-rank.dto";

export class UpdateRankDto {
	@ApiPropertyOptional({
		description: "Rank name in English",
		example: "Constable",
	})
	@IsString()
	@IsOptional()
	@MaxLength(100)
	name?: string;

	@ApiPropertyOptional({
		description: "Rank name in Amharic",
		example: "\u12AE\u1295\u1235\u1273\u1265\u120D",
	})
	@IsString()
	@IsOptional()
	@MaxLength(100)
	nameAm?: string;

	@ApiPropertyOptional({
		description: "Hierarchical level",
		example: 1,
	})
	@IsInt()
	@Min(1)
	@IsOptional()
	level?: number;

	@ApiPropertyOptional({
		description: "Rank category",
		example: "ENLISTED",
	})
	@IsString()
	@IsOptional()
	@MaxLength(50)
	category?: string;

	@ApiPropertyOptional({
		description: "Base salary (Step 0) in ETB",
		example: 6365,
	})
	@IsNumber()
	@Min(0)
	@IsOptional()
	baseSalary?: number;

	@ApiPropertyOptional({
		description: "Ceiling salary in ETB",
		example: 8944,
	})
	@IsNumber()
	@Min(0)
	@IsOptional()
	ceilingSalary?: number;

	@ApiPropertyOptional({
		description: "Number of salary steps",
		example: 9,
	})
	@IsInt()
	@Min(1)
	@IsOptional()
	stepCount?: number;

	@ApiPropertyOptional({
		description: "Years between step increments",
		example: 2,
	})
	@IsInt()
	@Min(1)
	@IsOptional()
	stepPeriodYears?: number;

	@ApiPropertyOptional({
		description: "Retirement age",
		example: 50,
	})
	@IsInt()
	@Min(1)
	@IsOptional()
	retirementAge?: number;

	@ApiPropertyOptional({
		description: "Minimum years for promotion",
		example: 3,
	})
	@IsInt()
	@Min(0)
	@IsOptional()
	minYearsForPromotion?: number;

	@ApiPropertyOptional({
		description: "Minimum appraisal score for promotion",
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
		description: "Sort order",
		example: 0,
	})
	@IsInt()
	@Min(0)
	@IsOptional()
	sortOrder?: number;

	@ApiPropertyOptional({
		description: "Whether the rank is active",
		example: true,
	})
	@IsBoolean()
	@IsOptional()
	isActive?: boolean;

	@ApiPropertyOptional({
		description: "Array of salary steps (will replace existing steps if provided)",
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
