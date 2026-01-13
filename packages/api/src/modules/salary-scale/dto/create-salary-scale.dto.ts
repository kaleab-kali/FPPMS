import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
	ArrayMinSize,
	IsArray,
	IsDateString,
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	MaxLength,
	Min,
	ValidateNested,
} from "class-validator";

export class SalaryScaleStepInputDto {
	@ApiProperty({
		description: "Step number (0 for base, 1-9 for steps)",
		example: 1,
		minimum: 0,
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

export class SalaryScaleRankInputDto {
	@ApiProperty({
		description: "Rank code (must match existing MilitaryRank code)",
		example: "CONST",
		maxLength: 20,
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(20)
	rankCode: string;

	@ApiProperty({
		description: "Rank name in English",
		example: "Constable",
		maxLength: 100,
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	rankName: string;

	@ApiPropertyOptional({
		description: "Rank name in Amharic",
		example: "\u12AE\u1295\u1235\u1273\u1265\u120D",
		maxLength: 100,
	})
	@IsString()
	@IsOptional()
	@MaxLength(100)
	rankNameAm?: string;

	@ApiProperty({
		description: "Rank category",
		example: "ENLISTED",
		enum: ["ENLISTED", "NCO", "JUNIOR_OFFICER", "SENIOR_OFFICER", "EXECUTIVE", "GENERAL"],
	})
	@IsString()
	@IsNotEmpty()
	category: string;

	@ApiProperty({
		description: "Hierarchical level (1 is lowest)",
		example: 1,
		minimum: 1,
	})
	@IsInt()
	@Min(1)
	level: number;

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
		description: "Sort order for display",
		example: 0,
	})
	@IsInt()
	@Min(0)
	@IsOptional()
	sortOrder?: number;

	@ApiProperty({
		description: "Array of salary steps for this rank",
		type: [SalaryScaleStepInputDto],
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => SalaryScaleStepInputDto)
	@ArrayMinSize(1)
	salarySteps: SalaryScaleStepInputDto[];
}

export class CreateSalaryScaleDto {
	@ApiProperty({
		description: "Unique code for this salary scale version",
		example: "2018-EC",
		maxLength: 50,
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(50)
	code: string;

	@ApiProperty({
		description: "Name of the salary scale",
		example: "Police Salary Scale 2018 EC",
		maxLength: 200,
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(200)
	name: string;

	@ApiPropertyOptional({
		description: "Name in Amharic",
		example: "\u12E8\u1356\u120A\u1235 \u12E8\u12F0\u121E\u12DD \u1235\u12AC\u120D 2018",
		maxLength: 200,
	})
	@IsString()
	@IsOptional()
	@MaxLength(200)
	nameAm?: string;

	@ApiPropertyOptional({
		description: "Description of this salary scale",
		example: "Official police salary scale effective from 2018 Ethiopian Calendar",
	})
	@IsString()
	@IsOptional()
	description?: string;

	@ApiProperty({
		description: "Effective date in ISO format (YYYY-MM-DD)",
		example: "2025-09-11",
	})
	@IsDateString()
	effectiveDate: string;

	@ApiPropertyOptional({
		description: "Expiry date in ISO format (when this scale is no longer valid)",
		example: "2028-09-10",
	})
	@IsDateString()
	@IsOptional()
	expiryDate?: string;

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
		description: "Array of rank salary configurations",
		type: [SalaryScaleRankInputDto],
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => SalaryScaleRankInputDto)
	@ArrayMinSize(1)
	ranks: SalaryScaleRankInputDto[];
}
