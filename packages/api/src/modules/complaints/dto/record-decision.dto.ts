import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class RecordDecisionDto {
	@ApiProperty({
		description: "Date when the punishment decision was made (ISO 8601 format)",
		example: "2025-01-30",
	})
	@IsDateString()
	@IsNotEmpty()
	decisionDate: string;

	@ApiProperty({
		description: "Salary deduction percentage (3% to 100%)",
		example: 10,
		minimum: 0,
		maximum: 100,
	})
	@IsInt()
	@Min(0)
	@Max(100)
	@IsNotEmpty()
	punishmentPercentage: number;

	@ApiProperty({
		description: "Text description of the punishment",
		example: "10% salary deduction for one month due to sleeping on duty (2nd occurrence)",
		maxLength: 1000,
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(1000)
	punishmentDescription: string;

	@ApiPropertyOptional({
		description: "Additional notes about the decision",
		example: "Decision made after reviewing all evidence and rebuttal",
		maxLength: 1000,
	})
	@IsString()
	@IsOptional()
	@MaxLength(1000)
	notes?: string;
}
