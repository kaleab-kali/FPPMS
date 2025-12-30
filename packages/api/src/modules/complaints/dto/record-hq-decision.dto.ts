import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class RecordHqDecisionDto {
	@ApiProperty({
		description: "Date when HQ made the final decision (ISO 8601 format)",
		example: "2025-02-15",
	})
	@IsDateString()
	@IsNotEmpty()
	decisionDate: string;

	@ApiProperty({
		description: "Description of the punishment decided by HQ (demotion, termination, etc.)",
		example: "Demotion by one rank effective immediately, with 3 months probation",
		maxLength: 2000,
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(2000)
	punishmentDescription: string;

	@ApiPropertyOptional({
		description: "Additional notes about the HQ decision",
		example: "Decision made by HQ Discipline Committee after thorough review",
		maxLength: 1000,
	})
	@IsString()
	@IsOptional()
	@MaxLength(1000)
	notes?: string;
}
