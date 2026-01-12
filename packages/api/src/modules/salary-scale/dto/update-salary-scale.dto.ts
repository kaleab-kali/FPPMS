import { ApiPropertyOptional } from "@nestjs/swagger";
import { SalaryScaleStatus } from "@prisma/client";
import { Type } from "class-transformer";
import {
	ArrayMinSize,
	IsArray,
	IsDateString,
	IsEnum,
	IsInt,
	IsOptional,
	IsString,
	MaxLength,
	Min,
	ValidateNested,
} from "class-validator";
import { SalaryScaleRankInputDto } from "#api/modules/salary-scale/dto/create-salary-scale.dto";

export class UpdateSalaryScaleDto {
	@ApiPropertyOptional({
		description: "Name of the salary scale",
		example: "Police Salary Scale 2018 EC (Updated)",
		maxLength: 200,
	})
	@IsString()
	@IsOptional()
	@MaxLength(200)
	name?: string;

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

	@ApiPropertyOptional({
		description: "Effective date in ISO format (YYYY-MM-DD)",
		example: "2025-09-11",
	})
	@IsDateString()
	@IsOptional()
	effectiveDate?: string;

	@ApiPropertyOptional({
		description: "Expiry date in ISO format (when this scale is no longer valid)",
		example: "2028-09-10",
	})
	@IsDateString()
	@IsOptional()
	expiryDate?: string;

	@ApiPropertyOptional({
		description: "Status of the salary scale",
		enum: SalaryScaleStatus,
		enumName: "SalaryScaleStatus",
		example: SalaryScaleStatus.ACTIVE,
	})
	@IsEnum(SalaryScaleStatus)
	@IsOptional()
	status?: SalaryScaleStatus;

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
		description: "Array of rank salary configurations (replaces all existing ranks if provided)",
		type: [SalaryScaleRankInputDto],
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => SalaryScaleRankInputDto)
	@ArrayMinSize(1)
	@IsOptional()
	ranks?: SalaryScaleRankInputDto[];
}
